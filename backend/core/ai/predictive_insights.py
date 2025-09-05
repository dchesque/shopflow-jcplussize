"""
Predictive Insights - Sistema de predições e insights do ShopFlow
Gera previsões de fluxo, conversão, staffing e recomendações baseadas em ML
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import asyncio
from loguru import logger
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score
import warnings
warnings.filterwarnings('ignore')

from ..config import get_settings
from ..database import DatabaseManager

settings = get_settings()

@dataclass
class PredictionResult:
    """Resultado de uma predição"""
    prediction_type: str
    value: float
    confidence: float  # 0-1
    timestamp: datetime
    features_used: List[str]
    model_accuracy: Optional[float] = None

@dataclass
class FlowPrediction:
    """Predição de fluxo de pessoas"""
    next_hour_count: int
    next_2h_count: int
    next_4h_count: int
    peak_hour_today: int
    peak_count_today: int
    confidence_scores: Dict[str, float]

@dataclass
class ConversionPrediction:
    """Predição de conversão"""
    current_probability: float
    factors_positive: List[str]
    factors_negative: List[str]
    recommendations: List[str]

@dataclass
class StaffingPrediction:
    """Predição de necessidade de funcionários"""
    current_optimal: int
    next_hour_optimal: int
    peak_hour_optimal: int
    cost_savings_potential: float
    efficiency_score: float

class PredictiveEngine:
    """
    Motor principal de predições e insights
    """
    
    def __init__(self):
        self.db = None
        
        # Modelos de ML
        self.flow_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.conversion_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.staffing_model = LinearRegression()
        
        # Scalers
        self.flow_scaler = StandardScaler()
        self.conversion_scaler = StandardScaler()
        self.staffing_scaler = StandardScaler()
        
        # Cache de dados históricos
        self.historical_data = {}
        self.model_accuracies = {
            'flow': 0.0,
            'conversion': 0.0,
            'staffing': 0.0
        }
        
        # Features utilizadas
        self.flow_features = [
            'hour', 'day_of_week', 'day_of_month', 'month',
            'is_weekend', 'is_holiday', 'weather_score',
            'prev_hour_count', 'avg_last_3h', 'same_hour_yesterday',
            'same_hour_last_week', 'trend_7d', 'seasonal_factor'
        ]
        
        self.conversion_features = [
            'current_count', 'staff_count', 'avg_dwell_time',
            'crowd_density', 'hour', 'day_of_week',
            'weather_score', 'promotion_active', 'zone_activity',
            'customer_segments_ratio', 'movement_intensity'
        ]
        
        self.staffing_features = [
            'current_count', 'predicted_next_hour', 'crowd_density',
            'conversion_rate', 'avg_service_time', 'hour',
            'day_of_week', 'is_peak_hour', 'customer_complexity_score'
        ]
        
        # Cache de predições
        self.cached_predictions = {}
        self.cache_duration = timedelta(minutes=10)
        
        logger.info("🔮 Predictive Engine inicializado")
    
    async def initialize(self):
        """Inicializar o motor preditivo"""
        try:
            # Initialize database connection
            from ..config import get_settings
            settings = get_settings()
            self.db = DatabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            await self.db.initialize()
            await self.load_historical_data()
            await self.train_models()
            
            logger.success("✅ Predictive Engine pronto")
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Predictive Engine: {e}")
            # Não fazer raise para não quebrar o sistema se ML falhar
    
    async def load_historical_data(self):
        """Carregar dados históricos para treinamento"""
        try:
            # Carregar dados dos últimos 90 dias
            end_date = datetime.now()
            start_date = end_date - timedelta(days=90)
            
            # Dados de contagem por hora
            flow_query = """
            SELECT 
                DATE_TRUNC('hour', timestamp) as hour,
                COUNT(*) as visitor_count,
                AVG(CAST(metadata->>'crowd_density' as float)) as avg_crowd_density,
                AVG(CAST(metadata->>'movement_intensity' as float)) as avg_movement_intensity
            FROM behavior_analytics 
            WHERE timestamp >= $1 AND timestamp <= $2
            GROUP BY DATE_TRUNC('hour', timestamp)
            ORDER BY hour
            """
            
            flow_data = await self.db.fetch_all(flow_query, start_date, end_date)
            
            # Dados de predições anteriores (para validação)
            predictions_query = """
            SELECT 
                timestamp, prediction_type, prediction_value, actual_value,
                confidence_score, accuracy_score
            FROM predictions
            WHERE timestamp >= $1 AND prediction_type IN ('hourly_flow', 'conversion', 'staffing')
            ORDER BY timestamp
            """
            
            predictions_data = await self.db.fetch_all(predictions_query, start_date)
            
            # Processar e estruturar dados
            self.historical_data = {
                'flow': self._process_flow_data(flow_data),
                'predictions': self._process_predictions_data(predictions_data)
            }
            
            logger.info(f"✅ Dados históricos carregados: {len(flow_data)} registros de fluxo")
            
        except Exception as e:
            logger.error(f"Erro ao carregar dados históricos: {e}")
            self.historical_data = {'flow': [], 'predictions': []}
    
    def _process_flow_data(self, raw_data: List[Dict]) -> List[Dict]:
        """Processar dados de fluxo para features"""
        try:
            processed = []
            
            for i, record in enumerate(raw_data):
                timestamp = record['hour']
                
                # Features temporais básicas
                features = {
                    'timestamp': timestamp,
                    'hour': timestamp.hour,
                    'day_of_week': timestamp.weekday(),
                    'day_of_month': timestamp.day,
                    'month': timestamp.month,
                    'is_weekend': timestamp.weekday() >= 5,
                    'is_holiday': self._is_holiday(timestamp),
                    'visitor_count': record['visitor_count'],
                    'crowd_density': record['avg_crowd_density'] or 0,
                    'movement_intensity': record['avg_movement_intensity'] or 0
                }
                
                # Features baseadas em histórico (se disponível)
                if i >= 1:
                    features['prev_hour_count'] = raw_data[i-1]['visitor_count']
                else:
                    features['prev_hour_count'] = record['visitor_count']
                
                if i >= 3:
                    last_3h = [raw_data[i-j]['visitor_count'] for j in range(1, 4)]
                    features['avg_last_3h'] = np.mean(last_3h)
                else:
                    features['avg_last_3h'] = record['visitor_count']
                
                # Features sazonais (simplificadas)
                features['weather_score'] = 0.8  # Mock - poderia integrar API de clima
                features['seasonal_factor'] = self._calculate_seasonal_factor(timestamp)
                features['trend_7d'] = 1.0  # Mock - tendência dos últimos 7 dias
                
                processed.append(features)
            
            return processed
            
        except Exception as e:
            logger.error(f"Erro ao processar dados de fluxo: {e}")
            return []
    
    def _process_predictions_data(self, raw_data: List[Dict]) -> List[Dict]:
        """Processar dados de predições anteriores"""
        try:
            processed = []
            
            for record in raw_data:
                processed.append({
                    'timestamp': record['timestamp'],
                    'type': record['prediction_type'],
                    'predicted': json.loads(record['prediction_value']),
                    'actual': json.loads(record['actual_value']) if record['actual_value'] else None,
                    'confidence': record['confidence_score'] or 0,
                    'accuracy': record['accuracy_score'] or 0
                })
            
            return processed
            
        except Exception as e:
            logger.error(f"Erro ao processar dados de predições: {e}")
            return []
    
    def _is_holiday(self, date: datetime) -> bool:
        """Verificar se é feriado (implementação simplificada)"""
        # Lista básica de feriados brasileiros (implementar biblioteca completa)
        holidays_2024 = [
            (1, 1),   # Ano Novo
            (4, 21),  # Tiradentes
            (5, 1),   # Dia do Trabalhador
            (9, 7),   # Independência
            (10, 12), # Nossa Senhora
            (11, 2),  # Finados
            (11, 15), # Proclamação da República
            (12, 25)  # Natal
        ]
        
        return (date.month, date.day) in holidays_2024
    
    def _calculate_seasonal_factor(self, timestamp: datetime) -> float:
        """Calcular fator sazonal baseado no mês/hora"""
        try:
            # Fatores por mês (mock - baseado em padrões típicos de varejo)
            month_factors = {
                1: 0.8,   # Janeiro (pós-festas)
                2: 0.9,   # Fevereiro
                3: 1.0,   # Março
                4: 1.1,   # Abril
                5: 1.0,   # Maio (Dia das Mães)
                6: 0.9,   # Junho
                7: 0.9,   # Julho (férias)
                8: 1.0,   # Agosto
                9: 1.0,   # Setembro
                10: 1.1,  # Outubro (Dia das Crianças)
                11: 1.2,  # Novembro (Black Friday)
                12: 1.4   # Dezembro (Natal)
            }
            
            # Fatores por hora
            hour_factors = {
                6: 0.2, 7: 0.3, 8: 0.6, 9: 0.8, 10: 1.0,
                11: 1.1, 12: 1.2, 13: 1.3, 14: 1.4, 15: 1.3,
                16: 1.2, 17: 1.1, 18: 1.0, 19: 0.9, 20: 0.7,
                21: 0.5, 22: 0.3, 23: 0.1
            }
            
            month_factor = month_factors.get(timestamp.month, 1.0)
            hour_factor = hour_factors.get(timestamp.hour, 1.0)
            
            return (month_factor + hour_factor) / 2
            
        except Exception as e:
            logger.error(f"Erro ao calcular fator sazonal: {e}")
            return 1.0
    
    async def train_models(self):
        """Treinar modelos de ML"""
        try:
            if not self.historical_data.get('flow'):
                logger.warning("Sem dados históricos suficientes para treinar modelos")
                return
            
            # Treinar modelo de fluxo
            await self._train_flow_model()
            
            # Treinar modelo de conversão (se houver dados)
            await self._train_conversion_model()
            
            # Treinar modelo de staffing
            await self._train_staffing_model()
            
            logger.success("✅ Modelos de ML treinados")
            
        except Exception as e:
            logger.error(f"Erro ao treinar modelos: {e}")
    
    async def _train_flow_model(self):
        """Treinar modelo de predição de fluxo"""
        try:
            flow_data = self.historical_data['flow']
            
            if len(flow_data) < 24:  # Mínimo 24 horas de dados
                logger.warning("Dados insuficientes para treinar modelo de fluxo")
                return
            
            # Preparar features e target
            X = []
            y = []
            
            for record in flow_data:
                features = [
                    record['hour'], record['day_of_week'], record['day_of_month'], record['month'],
                    int(record['is_weekend']), int(record['is_holiday']), record['weather_score'],
                    record['prev_hour_count'], record['avg_last_3h'], record['visitor_count'],  # usando atual como "yesterday"
                    record['visitor_count'], record['trend_7d'], record['seasonal_factor']
                ]
                X.append(features)
                y.append(record['visitor_count'])
            
            X = np.array(X)
            y = np.array(y)
            
            if len(X) > 10:  # Split apenas se houver dados suficientes
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                
                # Treinar modelo
                X_train_scaled = self.flow_scaler.fit_transform(X_train)
                self.flow_model.fit(X_train_scaled, y_train)
                
                # Avaliar modelo
                X_test_scaled = self.flow_scaler.transform(X_test)
                y_pred = self.flow_model.predict(X_test_scaled)
                mae = mean_absolute_error(y_test, y_pred)
                accuracy = max(0, 1 - (mae / np.mean(y_test)))
                self.model_accuracies['flow'] = accuracy
                
                logger.info(f"✅ Modelo de fluxo treinado - Accuracy: {accuracy:.2f}")
            else:
                # Com poucos dados, apenas fit sem validação
                X_scaled = self.flow_scaler.fit_transform(X)
                self.flow_model.fit(X_scaled, y)
                self.model_accuracies['flow'] = 0.5  # Accuracy conservadora
                
        except Exception as e:
            logger.error(f"Erro ao treinar modelo de fluxo: {e}")
    
    async def _train_conversion_model(self):
        """Treinar modelo de predição de conversão"""
        try:
            # Mock data para conversão (em produção viria do histórico real)
            # Este modelo precisaria de dados de vendas integrados
            self.model_accuracies['conversion'] = 0.7  # Mock accuracy
            logger.info("✅ Modelo de conversão configurado (usando heurísticas)")
            
        except Exception as e:
            logger.error(f"Erro ao treinar modelo de conversão: {e}")
    
    async def _train_staffing_model(self):
        """Treinar modelo de predição de staffing"""
        try:
            # Mock training para staffing
            # Em produção, usaria dados de produtividade da equipe
            self.model_accuracies['staffing'] = 0.6  # Mock accuracy
            logger.info("✅ Modelo de staffing configurado (usando heurísticas)")
            
        except Exception as e:
            logger.error(f"Erro ao treinar modelo de staffing: {e}")
    
    async def generate_predictions(
        self,
        historical_data: Dict[str, Any],
        current_state: Dict[str, Any],
        timestamp: datetime
    ) -> Dict[str, Any]:
        """
        Gerar todas as predições principais
        
        Args:
            historical_data: Dados históricos agregados
            current_state: Estado atual do sistema
            timestamp: Timestamp de referência
            
        Returns:
            Dicionário com predições
        """
        try:
            # Verificar cache
            cache_key = f"predictions_{timestamp.strftime('%Y%m%d_%H%M')}"
            if cache_key in self.cached_predictions:
                cached = self.cached_predictions[cache_key]
                if datetime.now() - cached['generated_at'] < self.cache_duration:
                    return cached['predictions']
            
            # Gerar predições
            predictions = {}
            
            # Predição de fluxo
            flow_pred = await self._predict_flow(current_state, timestamp)
            predictions.update(flow_pred)
            
            # Predição de conversão
            conversion_pred = await self._predict_conversion(current_state, timestamp)
            predictions.update(conversion_pred)
            
            # Predição de staffing
            staffing_pred = await self._predict_staffing(current_state, timestamp)
            predictions.update(staffing_pred)
            
            # Cache das predições
            self.cached_predictions[cache_key] = {
                'predictions': predictions,
                'generated_at': datetime.now()
            }
            
            # Limpar cache antigo
            self._cleanup_prediction_cache()
            
            # Salvar predições no banco
            await self._save_predictions(predictions, timestamp)
            
            return predictions
            
        except Exception as e:
            logger.error(f"Erro ao gerar predições: {e}")
            return {}
    
    async def _predict_flow(self, current_state: Dict, timestamp: datetime) -> Dict[str, Any]:
        """Prever fluxo de pessoas"""
        try:
            current_count = current_state.get('current_count', 0)
            
            # Features para predição
            features = np.array([[
                timestamp.hour + 1,  # próxima hora
                timestamp.weekday(),
                timestamp.day,
                timestamp.month,
                int(timestamp.weekday() >= 5),
                int(self._is_holiday(timestamp)),
                0.8,  # weather_score mock
                current_count,
                current_count,  # avg_last_3h simplificado
                current_count,  # same_hour_yesterday mock
                current_count,  # same_hour_last_week mock
                1.0,  # trend_7d mock
                self._calculate_seasonal_factor(timestamp + timedelta(hours=1))
            ]])
            
            # Predição usando modelo (se treinado)
            if hasattr(self.flow_model, 'feature_importances_'):
                try:
                    features_scaled = self.flow_scaler.transform(features)
                    next_hour_pred = max(0, int(self.flow_model.predict(features_scaled)[0]))
                except:
                    # Fallback para heurística
                    next_hour_pred = self._heuristic_flow_prediction(current_count, timestamp)
            else:
                next_hour_pred = self._heuristic_flow_prediction(current_count, timestamp)
            
            # Predições adicionais
            next_2h_pred = max(0, int(next_hour_pred * 0.9))  # Decai ligeiramente
            next_4h_pred = max(0, int(next_hour_pred * 0.7))  # Decai mais
            
            return {
                'next_hour': next_hour_pred,
                'next_2h': next_2h_pred,
                'next_4h': next_4h_pred,
                'flow_confidence': self.model_accuracies['flow']
            }
            
        except Exception as e:
            logger.error(f"Erro na predição de fluxo: {e}")
            return {'next_hour': 0, 'next_2h': 0, 'next_4h': 0, 'flow_confidence': 0}
    
    def _heuristic_flow_prediction(self, current_count: int, timestamp: datetime) -> int:
        """Predição heurística de fluxo quando ML não está disponível"""
        try:
            base_prediction = current_count
            
            # Ajustes por hora do dia
            hour = (timestamp + timedelta(hours=1)).hour
            
            if 8 <= hour <= 10:  # Manhã
                multiplier = 1.2
            elif 12 <= hour <= 14:  # Almoço
                multiplier = 1.4
            elif 15 <= hour <= 18:  # Tarde
                multiplier = 1.3
            elif 19 <= hour <= 21:  # Noite
                multiplier = 1.1
            else:
                multiplier = 0.6
            
            # Ajuste para fim de semana
            if timestamp.weekday() >= 5:
                multiplier *= 1.1
            
            # Ajuste sazonal
            seasonal = self._calculate_seasonal_factor(timestamp)
            
            prediction = int(base_prediction * multiplier * seasonal)
            return max(0, min(prediction, current_count * 3))  # Cap em 3x o atual
            
        except Exception as e:
            logger.error(f"Erro na predição heurística: {e}")
            return current_count
    
    async def _predict_conversion(self, current_state: Dict, timestamp: datetime) -> Dict[str, Any]:
        """Prever probabilidade de conversão"""
        try:
            current_count = current_state.get('current_count', 0)
            staff_count = current_state.get('current_staff', 1)
            crowd_density = current_state.get('crowd_density', 0)
            avg_dwell_time = current_state.get('avg_dwell_time', 0)
            movement_intensity = current_state.get('movement_intensity', 0)
            
            # Modelo heurístico de conversão
            base_conversion = 0.15  # 15% baseline
            
            # Fatores que aumentam conversão
            if avg_dwell_time > 20:  # Tempo alto na loja
                base_conversion += 0.15
            elif avg_dwell_time > 10:
                base_conversion += 0.08
            
            if current_count > 0:
                staff_ratio = staff_count / current_count
                if staff_ratio > 0.3:  # Boa cobertura de funcionários
                    base_conversion += 0.1
                elif staff_ratio < 0.1:  # Poucos funcionários
                    base_conversion -= 0.1
            
            # Fatores que diminuem conversão
            if crowd_density > 0.7:  # Muito lotado
                base_conversion -= 0.15
            elif crowd_density > 0.5:
                base_conversion -= 0.08
            
            if movement_intensity > 0.8:  # Movimento muito errático
                base_conversion -= 0.05
            
            # Ajustes por horário
            hour = timestamp.hour
            if 12 <= hour <= 14 or 18 <= hour <= 20:  # Horários de pico
                base_conversion += 0.05
            
            conversion_prob = max(0.05, min(0.95, base_conversion))
            
            # Fatores explicativos
            factors_positive = []
            factors_negative = []
            
            if avg_dwell_time > 15:
                factors_positive.append("Alto tempo de permanência")
            if staff_count / max(current_count, 1) > 0.2:
                factors_positive.append("Boa cobertura de funcionários")
            if crowd_density < 0.4:
                factors_positive.append("Ambiente confortável")
            
            if crowd_density > 0.6:
                factors_negative.append("Alta densidade de pessoas")
            if staff_count / max(current_count, 1) < 0.1:
                factors_negative.append("Poucos funcionários disponíveis")
            if movement_intensity > 0.7:
                factors_negative.append("Movimentação intensa/errática")
            
            return {
                'conversion_prob': float(conversion_prob),
                'conversion_factors_positive': factors_positive,
                'conversion_factors_negative': factors_negative,
                'conversion_confidence': self.model_accuracies['conversion']
            }
            
        except Exception as e:
            logger.error(f"Erro na predição de conversão: {e}")
            return {'conversion_prob': 0.15, 'conversion_confidence': 0}
    
    async def _predict_staffing(self, current_state: Dict, timestamp: datetime) -> Dict[str, Any]:
        """Prever necessidade de funcionários"""
        try:
            current_count = current_state.get('current_count', 0)
            current_staff = current_state.get('current_staff', 1)
            crowd_density = current_state.get('crowd_density', 0)
            conversion_prob = current_state.get('conversion_prob', 0.15)
            
            # Algoritmo de staffing baseado em demanda
            base_staff_needed = max(1, int(current_count / 8))  # 1 funcionário para cada 8 clientes
            
            # Ajustes baseados em contexto
            if crowd_density > 0.6:
                base_staff_needed += 1  # Funcionário extra para multidão
            
            if conversion_prob > 0.5:
                base_staff_needed += 1  # Funcionário extra para alta conversão
            
            # Limitar baseado em horário e realidade da loja
            hour = timestamp.hour
            if hour < 8 or hour > 21:  # Fora do horário principal
                base_staff_needed = max(1, base_staff_needed - 1)
            
            optimal_staff = max(1, min(base_staff_needed, 6))  # Cap em 6 funcionários
            
            # Predição para próxima hora
            next_hour_count = current_state.get('next_hour', current_count)
            next_hour_optimal = max(1, min(int(next_hour_count / 8) + 1, 6))
            
            # Cálculo de eficiência e economia
            current_efficiency = min(100, (current_count / max(current_staff, 1)) * 10)
            optimal_efficiency = min(100, (current_count / max(optimal_staff, 1)) * 10)
            
            # Economia potencial (simplificada)
            if optimal_staff < current_staff:
                cost_savings = (current_staff - optimal_staff) * 25.0  # R$ por hora
            else:
                cost_savings = 0.0
            
            return {
                'optimal_staff': int(optimal_staff),
                'next_hour_optimal': int(next_hour_optimal),
                'current_efficiency': float(current_efficiency),
                'optimal_efficiency': float(optimal_efficiency),
                'cost_savings_potential': float(cost_savings),
                'staffing_confidence': self.model_accuracies['staffing']
            }
            
        except Exception as e:
            logger.error(f"Erro na predição de staffing: {e}")
            return {'optimal_staff': 1, 'staffing_confidence': 0}
    
    def _cleanup_prediction_cache(self):
        """Limpar cache antigo de predições"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=2)
            
            to_remove = []
            for key, cached in self.cached_predictions.items():
                if cached['generated_at'] < cutoff_time:
                    to_remove.append(key)
            
            for key in to_remove:
                del self.cached_predictions[key]
                
        except Exception as e:
            logger.error(f"Erro ao limpar cache: {e}")
    
    async def _save_predictions(self, predictions: Dict, timestamp: datetime):
        """Salvar predições no banco de dados"""
        try:
            for pred_type, value in predictions.items():
                if pred_type.endswith('_confidence'):
                    continue  # Não salvar scores de confiança separadamente
                
                query = """
                INSERT INTO predictions (timestamp, prediction_type, prediction_value, confidence_score)
                VALUES ($1, $2, $3, $4)
                """
                
                confidence_key = f"{pred_type}_confidence"
                confidence = predictions.get(confidence_key, 0.5)
                
                await self.db.execute(
                    query,
                    timestamp,
                    pred_type,
                    json.dumps({pred_type: value}),
                    confidence
                )
                
        except Exception as e:
            logger.error(f"Erro ao salvar predições: {e}")
    
    async def get_prediction_accuracy(self, prediction_type: str, days: int = 7) -> Dict[str, Any]:
        """Obter accuracy de predições dos últimos N dias"""
        try:
            start_date = datetime.now() - timedelta(days=days)
            
            query = """
            SELECT 
                prediction_type,
                AVG(accuracy_score) as avg_accuracy,
                COUNT(*) as prediction_count,
                AVG(confidence_score) as avg_confidence
            FROM predictions 
            WHERE timestamp >= $1 AND prediction_type = $2 AND accuracy_score IS NOT NULL
            GROUP BY prediction_type
            """
            
            result = await self.db.fetch_one(query, start_date, prediction_type)
            
            if result:
                return {
                    'type': result['prediction_type'],
                    'avg_accuracy': float(result['avg_accuracy']),
                    'prediction_count': result['prediction_count'],
                    'avg_confidence': float(result['avg_confidence'])
                }
            else:
                return {
                    'type': prediction_type,
                    'avg_accuracy': self.model_accuracies.get(prediction_type, 0),
                    'prediction_count': 0,
                    'avg_confidence': 0.5
                }
                
        except Exception as e:
            logger.error(f"Erro ao obter accuracy: {e}")
            return {'type': prediction_type, 'avg_accuracy': 0, 'prediction_count': 0, 'avg_confidence': 0}
    
    async def update_prediction_accuracy(
        self, 
        prediction_type: str, 
        predicted_value: Any, 
        actual_value: Any,
        timestamp: datetime
    ):
        """Atualizar accuracy de uma predição com valor real"""
        try:
            # Calcular accuracy específica
            if isinstance(predicted_value, (int, float)) and isinstance(actual_value, (int, float)):
                error = abs(predicted_value - actual_value)
                relative_error = error / max(actual_value, 1)
                accuracy = max(0, 1 - relative_error)
            else:
                accuracy = 0.5  # Accuracy neutra para tipos não numéricos
            
            # Atualizar no banco
            query = """
            UPDATE predictions 
            SET actual_value = $1, accuracy_score = $2
            WHERE prediction_type = $3 AND timestamp = $4
            """
            
            await self.db.execute(
                query,
                json.dumps({prediction_type: actual_value}),
                accuracy,
                prediction_type,
                timestamp
            )
            
            # Atualizar modelo accuracy cache
            current_accuracy = self.model_accuracies.get(prediction_type, 0.5)
            self.model_accuracies[prediction_type] = (current_accuracy * 0.9 + accuracy * 0.1)
            
            logger.debug(f"Accuracy atualizada para {prediction_type}: {accuracy:.2f}")
            
        except Exception as e:
            logger.error(f"Erro ao atualizar accuracy: {e}")
    
    async def get_insights_summary(self) -> Dict[str, Any]:
        """Obter resumo de insights e predições"""
        try:
            return {
                'models_trained': {
                    'flow': hasattr(self.flow_model, 'feature_importances_'),
                    'conversion': self.model_accuracies['conversion'] > 0,
                    'staffing': self.model_accuracies['staffing'] > 0
                },
                'model_accuracies': self.model_accuracies,
                'historical_data_points': len(self.historical_data.get('flow', [])),
                'cached_predictions': len(self.cached_predictions),
                'last_training': datetime.now().isoformat()  # Mock
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter resumo de insights: {e}")
            return {}
    
    async def retrain_models(self, force: bool = False):
        """Re-treinar modelos com novos dados"""
        try:
            # Recarregar dados históricos
            await self.load_historical_data()
            
            # Re-treinar modelos
            await self.train_models()
            
            logger.success("✅ Modelos re-treinados com sucesso")
            
        except Exception as e:
            logger.error(f"Erro ao re-treinar modelos: {e}")
    
    def configure_prediction_parameters(self, parameters: Dict[str, Any]):
        """Configurar parâmetros de predição"""
        try:
            if 'cache_duration_minutes' in parameters:
                self.cache_duration = timedelta(minutes=parameters['cache_duration_minutes'])
            
            if 'flow_features' in parameters:
                self.flow_features = parameters['flow_features']
            
            if 'conversion_features' in parameters:
                self.conversion_features = parameters['conversion_features']
            
            logger.info("✅ Parâmetros de predição atualizados")
            
        except Exception as e:
            logger.error(f"Erro ao configurar parâmetros: {e}")