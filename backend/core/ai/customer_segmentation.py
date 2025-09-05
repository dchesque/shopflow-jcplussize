"""
Customer Segmentation - Sistema de segmentação inteligente de clientes
Classifica clientes em diferentes perfis e analisa padrões de comportamento
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
from loguru import logger
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import asyncio

from ..config import get_settings
from ..database import DatabaseManager

settings = get_settings()

@dataclass
class CustomerProfile:
    """Perfil de um cliente"""
    customer_id: str
    segment: str  # 'new', 'regular', 'vip', 'occasional', 'at_risk'
    visit_count: int
    avg_dwell_time: float  # minutos
    last_visit: datetime
    first_visit: datetime
    total_value: float = 0.0  # valor estimado de compras
    conversion_rate: float = 0.0
    preferred_zones: List[str] = None
    visit_frequency_days: float = 0.0  # média de dias entre visitas
    loyalty_score: float = 0.0
    risk_score: float = 0.0  # probabilidade de não retornar
    
    def __post_init__(self):
        if self.preferred_zones is None:
            self.preferred_zones = []

@dataclass
class SegmentAnalysis:
    """Análise de um segmento"""
    segment_name: str
    customer_count: int
    avg_visit_frequency: float
    avg_dwell_time: float
    avg_conversion_rate: float
    total_value: float
    growth_rate: float  # crescimento do segmento
    characteristics: List[str]

class CustomerSegmentation:
    """
    Sistema principal de segmentação de clientes
    """
    
    def __init__(self):
        self.db = None
        
        # Cache de perfis
        self.customer_profiles: Dict[str, CustomerProfile] = {}
        
        # Configurações de segmentação
        self.segment_rules = {
            'new': {
                'visit_count_max': 1,
                'days_since_first_visit_max': 7
            },
            'regular': {
                'visit_count_min': 5,
                'visit_count_max': 15,
                'avg_frequency_days_max': 14
            },
            'vip': {
                'visit_count_min': 15,
                'avg_frequency_days_max': 7,
                'conversion_rate_min': 0.7
            },
            'occasional': {
                'visit_count_min': 2,
                'visit_count_max': 10,
                'avg_frequency_days_min': 30
            },
            'at_risk': {
                'days_since_last_visit_min': 30,
                'visit_count_min': 2
            }
        }
        
        # Modelos de ML
        self.clustering_model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'visit_count', 'avg_dwell_time', 'days_between_visits',
            'conversion_rate', 'preferred_zone_count', 'recency_score'
        ]
        
        # Cache de análises
        self.segment_analytics = {}
        self.last_analysis_time = None
        
        logger.info("👥 Customer Segmentation inicializado")
    
    async def initialize(self):
        """Inicializar o sistema de segmentação"""
        try:
            # Initialize database connection
            from ..config import get_settings
            settings = get_settings()
            self.db = DatabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            await self.db.initialize()
            await self.load_customer_profiles()
            await self.update_segmentation()
            
            logger.success("✅ Customer Segmentation pronto")
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Customer Segmentation: {e}")
            raise
    
    async def load_customer_profiles(self):
        """Carregar perfis de clientes do banco de dados"""
        try:
            query = """
            SELECT 
                customer_id, segment, first_visit, last_visit, 
                visit_count, avg_dwell_time, conversion_rate, profile_data
            FROM customer_segments
            WHERE last_visit > $1
            ORDER BY last_visit DESC
            """
            
            # Carregar apenas clientes dos últimos 90 dias
            cutoff_date = datetime.now() - timedelta(days=90)
            results = await self.db.fetch_all(query, cutoff_date)
            
            self.customer_profiles.clear()
            
            for row in results:
                profile_data = json.loads(row['profile_data'] or '{}')
                
                profile = CustomerProfile(
                    customer_id=row['customer_id'],
                    segment=row['segment'],
                    visit_count=row['visit_count'],
                    avg_dwell_time=row['avg_dwell_time'] or 0.0,
                    last_visit=row['last_visit'],
                    first_visit=row['first_visit'],
                    total_value=profile_data.get('total_value', 0.0),
                    conversion_rate=row['conversion_rate'] or 0.0,
                    preferred_zones=profile_data.get('preferred_zones', []),
                    visit_frequency_days=profile_data.get('visit_frequency_days', 0.0),
                    loyalty_score=profile_data.get('loyalty_score', 0.0),
                    risk_score=profile_data.get('risk_score', 0.0)
                )
                
                self.customer_profiles[row['customer_id']] = profile
            
            logger.info(f"✅ Carregados {len(self.customer_profiles)} perfis de clientes")
            
        except Exception as e:
            logger.error(f"Erro ao carregar perfis: {e}")
    
    async def segment_customers(
        self, 
        person_registry: Dict[int, Any], 
        behavior_data: Dict[str, Any]
    ) -> Dict[str, int]:
        """
        Segmentar clientes baseado no registro atual e dados comportamentais
        
        Args:
            person_registry: Registro de pessoas detectadas
            behavior_data: Dados comportamentais atuais
            
        Returns:
            Contagem de clientes por segmento
        """
        try:
            # Atualizar perfis baseado no registro atual
            await self._update_profiles_from_registry(person_registry, behavior_data)
            
            # Executar re-segmentação se necessário
            if self._should_re_segment():
                await self.update_segmentation()
            
            # Contar clientes por segmento
            segment_counts = {}
            for profile in self.customer_profiles.values():
                segment = profile.segment
                segment_counts[segment] = segment_counts.get(segment, 0) + 1
            
            return segment_counts
            
        except Exception as e:
            logger.error(f"Erro na segmentação: {e}")
            return {}
    
    async def _update_profiles_from_registry(
        self, 
        person_registry: Dict[int, Any], 
        behavior_data: Dict[str, Any]
    ):
        """Atualizar perfis de clientes baseado no registro atual"""
        try:
            for person_id, person_data in person_registry.items():
                if person_data.get('type') == 'customer' and person_data.get('identity_id'):
                    customer_id = person_data['identity_id']
                    
                    # Criar ou atualizar perfil
                    if customer_id not in self.customer_profiles:
                        # Novo cliente
                        profile = CustomerProfile(
                            customer_id=customer_id,
                            segment='new',
                            visit_count=1,
                            avg_dwell_time=person_data.get('total_time', 0) / 60,  # converter para minutos
                            last_visit=person_data.get('last_seen', datetime.now()),
                            first_visit=person_data.get('first_seen', datetime.now())
                        )
                        self.customer_profiles[customer_id] = profile
                    else:
                        # Cliente conhecido - atualizar
                        profile = self.customer_profiles[customer_id]
                        profile.visit_count += 1
                        profile.last_visit = person_data.get('last_seen', datetime.now())
                        
                        # Atualizar tempo médio de permanência
                        current_dwell = person_data.get('total_time', 0) / 60
                        profile.avg_dwell_time = (profile.avg_dwell_time * (profile.visit_count - 1) + current_dwell) / profile.visit_count
                    
                    # Calcular métricas adicionais
                    await self._calculate_customer_metrics(profile)
                    
                    # Re-classificar segmento
                    new_segment = await self._classify_customer_segment(profile)
                    if new_segment != profile.segment:
                        logger.info(f"Cliente {customer_id} movido de {profile.segment} para {new_segment}")
                        profile.segment = new_segment
                        
                        # Atualizar no banco
                        await self._save_customer_profile(profile)
                        
        except Exception as e:
            logger.error(f"Erro ao atualizar perfis: {e}")
    
    async def _calculate_customer_metrics(self, profile: CustomerProfile):
        """Calcular métricas avançadas do cliente"""
        try:
            # Frequência de visitas (dias entre visitas)
            if profile.visit_count > 1:
                total_days = (profile.last_visit - profile.first_visit).days
                profile.visit_frequency_days = total_days / (profile.visit_count - 1) if profile.visit_count > 1 else 0
            
            # Score de lealdade (0-1)
            recency_days = (datetime.now() - profile.last_visit).days
            frequency_score = min(profile.visit_count / 20, 1.0)  # normalizar para max 20 visitas
            recency_score = max(0, 1 - (recency_days / 30))  # decai após 30 dias
            dwell_score = min(profile.avg_dwell_time / 60, 1.0)  # normalizar para max 60 min
            
            profile.loyalty_score = (frequency_score * 0.4 + recency_score * 0.4 + dwell_score * 0.2)
            
            # Score de risco de churn (0-1)
            if profile.visit_count >= 2:
                expected_return_days = profile.visit_frequency_days * 1.5  # margem de 50%
                days_overdue = max(0, recency_days - expected_return_days)
                profile.risk_score = min(days_overdue / 30, 1.0)  # risco máximo após 30 dias de atraso
            else:
                # Novos clientes têm risco baseado apenas no tempo desde primeira visita
                days_since_first = (datetime.now() - profile.first_visit).days
                profile.risk_score = min(days_since_first / 14, 1.0)  # risco aumenta após 14 dias
                
        except Exception as e:
            logger.error(f"Erro ao calcular métricas do cliente: {e}")
    
    async def _classify_customer_segment(self, profile: CustomerProfile) -> str:
        """Classificar cliente em segmento baseado em regras"""
        try:
            days_since_first = (datetime.now() - profile.first_visit).days
            days_since_last = (datetime.now() - profile.last_visit).days
            
            # Verificar segmento "at_risk" primeiro
            if (profile.visit_count >= self.segment_rules['at_risk']['visit_count_min'] and
                days_since_last >= self.segment_rules['at_risk']['days_since_last_visit_min']):
                return 'at_risk'
            
            # Verificar "new"
            if (profile.visit_count <= self.segment_rules['new']['visit_count_max'] and
                days_since_first <= self.segment_rules['new']['days_since_first_visit_max']):
                return 'new'
            
            # Verificar "vip"
            vip_rules = self.segment_rules['vip']
            if (profile.visit_count >= vip_rules['visit_count_min'] and
                profile.visit_frequency_days <= vip_rules['avg_frequency_days_max'] and
                profile.conversion_rate >= vip_rules.get('conversion_rate_min', 0)):
                return 'vip'
            
            # Verificar "regular"
            regular_rules = self.segment_rules['regular']
            if (regular_rules['visit_count_min'] <= profile.visit_count <= regular_rules['visit_count_max'] and
                profile.visit_frequency_days <= regular_rules['avg_frequency_days_max']):
                return 'regular'
            
            # Verificar "occasional"
            occasional_rules = self.segment_rules['occasional']
            if (occasional_rules['visit_count_min'] <= profile.visit_count <= occasional_rules.get('visit_count_max', float('inf')) and
                profile.visit_frequency_days >= occasional_rules['avg_frequency_days_min']):
                return 'occasional'
            
            # Default para "new" se não se encaixar em nenhum
            return 'new'
            
        except Exception as e:
            logger.error(f"Erro ao classificar segmento: {e}")
            return 'new'
    
    async def update_segmentation(self, use_ml: bool = True):
        """
        Executar re-segmentação completa usando ML
        
        Args:
            use_ml: Se deve usar algoritmos de ML além das regras
        """
        try:
            if not self.customer_profiles:
                return
            
            # Aplicar segmentação baseada em regras primeiro
            for profile in self.customer_profiles.values():
                await self._calculate_customer_metrics(profile)
                profile.segment = await self._classify_customer_segment(profile)
            
            # Aplicar ML clustering se solicitado e há dados suficientes
            if use_ml and len(self.customer_profiles) >= 10:
                await self._apply_ml_clustering()
            
            # Analisar segmentos
            await self._analyze_segments()
            
            # Salvar todos os perfis atualizados
            for profile in self.customer_profiles.values():
                await self._save_customer_profile(profile)
            
            self.last_analysis_time = datetime.now()
            logger.success(f"✅ Segmentação atualizada para {len(self.customer_profiles)} clientes")
            
        except Exception as e:
            logger.error(f"Erro na re-segmentação: {e}")
    
    async def _apply_ml_clustering(self):
        """Aplicar clustering ML para refinar segmentação"""
        try:
            # Preparar dados para clustering
            data_rows = []
            customer_ids = []
            
            for customer_id, profile in self.customer_profiles.items():
                # Criar features numéricas
                recency_score = max(0, 1 - ((datetime.now() - profile.last_visit).days / 30))
                
                row = [
                    profile.visit_count,
                    profile.avg_dwell_time,
                    profile.visit_frequency_days,
                    profile.conversion_rate,
                    len(profile.preferred_zones),
                    recency_score
                ]
                
                data_rows.append(row)
                customer_ids.append(customer_id)
            
            if len(data_rows) < 3:
                return
            
            df = pd.DataFrame(data_rows, columns=self.feature_columns)
            
            # Normalizar dados
            X_scaled = self.scaler.fit_transform(df)
            
            # Determinar número ótimo de clusters
            n_clusters = min(len(self.segment_rules), max(2, len(data_rows) // 5))
            
            # Aplicar K-means
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            ml_clusters = kmeans.fit_predict(X_scaled)
            
            # Mapear clusters ML para segmentos existentes
            cluster_to_segment = await self._map_clusters_to_segments(
                ml_clusters, customer_ids, X_scaled
            )
            
            # Aplicar refinamentos baseados em ML
            for i, customer_id in enumerate(customer_ids):
                ml_cluster = ml_clusters[i]
                suggested_segment = cluster_to_segment.get(ml_cluster)
                
                if suggested_segment:
                    profile = self.customer_profiles[customer_id]
                    current_segment = profile.segment
                    
                    # Só alterar se ML sugerir mudança significativa
                    if self._should_accept_ml_suggestion(profile, suggested_segment):
                        profile.segment = suggested_segment
                        logger.debug(f"ML moveu cliente {customer_id}: {current_segment} -> {suggested_segment}")
            
            self.clustering_model = kmeans
            logger.info("✅ Clustering ML aplicado com sucesso")
            
        except Exception as e:
            logger.error(f"Erro no clustering ML: {e}")
    
    async def _map_clusters_to_segments(
        self, 
        clusters: np.ndarray, 
        customer_ids: List[str],
        features: np.ndarray
    ) -> Dict[int, str]:
        """Mapear clusters ML para segmentos de negócio"""
        try:
            cluster_mapping = {}
            unique_clusters = np.unique(clusters)
            
            for cluster_id in unique_clusters:
                cluster_mask = clusters == cluster_id
                cluster_customers = [customer_ids[i] for i in range(len(customer_ids)) if cluster_mask[i]]
                cluster_features = features[cluster_mask]
                
                # Analisar características do cluster
                avg_visit_count = np.mean([self.customer_profiles[c].visit_count for c in cluster_customers])
                avg_frequency = np.mean([self.customer_profiles[c].visit_frequency_days for c in cluster_customers])
                avg_loyalty = np.mean([self.customer_profiles[c].loyalty_score for c in cluster_customers])
                avg_risk = np.mean([self.customer_profiles[c].risk_score for c in cluster_customers])
                
                # Mapear para segmento baseado nas características
                if avg_risk > 0.7:
                    cluster_mapping[cluster_id] = 'at_risk'
                elif avg_visit_count >= 15 and avg_frequency <= 7 and avg_loyalty > 0.7:
                    cluster_mapping[cluster_id] = 'vip'
                elif avg_visit_count >= 5 and avg_frequency <= 14:
                    cluster_mapping[cluster_id] = 'regular'
                elif avg_frequency >= 30:
                    cluster_mapping[cluster_id] = 'occasional'
                else:
                    cluster_mapping[cluster_id] = 'new'
            
            return cluster_mapping
            
        except Exception as e:
            logger.error(f"Erro ao mapear clusters: {e}")
            return {}
    
    def _should_accept_ml_suggestion(self, profile: CustomerProfile, suggested_segment: str) -> bool:
        """Determinar se deve aceitar sugestão do ML"""
        try:
            current_segment = profile.segment
            
            # Regras para aceitar mudanças
            transitions_allowed = {
                'new': ['regular', 'occasional'],
                'regular': ['vip', 'occasional', 'at_risk'],
                'occasional': ['regular', 'at_risk'],
                'vip': ['at_risk'],  # VIPs raramente mudam
                'at_risk': ['regular', 'occasional']  # podem voltar se reativaram
            }
            
            return suggested_segment in transitions_allowed.get(current_segment, [])
            
        except Exception as e:
            logger.error(f"Erro ao avaliar sugestão ML: {e}")
            return False
    
    async def _analyze_segments(self):
        """Analisar características de cada segmento"""
        try:
            self.segment_analytics.clear()
            
            # Agrupar por segmento
            segment_groups = {}
            for profile in self.customer_profiles.values():
                segment = profile.segment
                if segment not in segment_groups:
                    segment_groups[segment] = []
                segment_groups[segment].append(profile)
            
            # Analisar cada segmento
            for segment_name, profiles in segment_groups.items():
                if not profiles:
                    continue
                
                # Calcular métricas
                avg_frequency = np.mean([p.visit_frequency_days for p in profiles if p.visit_frequency_days > 0])
                avg_dwell_time = np.mean([p.avg_dwell_time for p in profiles])
                avg_conversion = np.mean([p.conversion_rate for p in profiles if p.conversion_rate > 0])
                total_value = sum([p.total_value for p in profiles])
                
                # Determinar características principais
                characteristics = []
                if avg_frequency <= 7:
                    characteristics.append("Visitas frequentes")
                elif avg_frequency >= 30:
                    characteristics.append("Visitas esparsas")
                
                if avg_dwell_time >= 30:
                    characteristics.append("Alto tempo de permanência")
                elif avg_dwell_time <= 10:
                    characteristics.append("Visitas rápidas")
                
                if avg_conversion >= 0.7:
                    characteristics.append("Alta conversão")
                elif avg_conversion <= 0.3:
                    characteristics.append("Baixa conversão")
                
                # Calcular crescimento (simplificado)
                recent_count = len([p for p in profiles if (datetime.now() - p.first_visit).days <= 30])
                growth_rate = recent_count / len(profiles) if profiles else 0
                
                analysis = SegmentAnalysis(
                    segment_name=segment_name,
                    customer_count=len(profiles),
                    avg_visit_frequency=float(avg_frequency) if not np.isnan(avg_frequency) else 0,
                    avg_dwell_time=float(avg_dwell_time),
                    avg_conversion_rate=float(avg_conversion) if not np.isnan(avg_conversion) else 0,
                    total_value=float(total_value),
                    growth_rate=float(growth_rate),
                    characteristics=characteristics
                )
                
                self.segment_analytics[segment_name] = analysis
            
            logger.info(f"✅ Analisados {len(self.segment_analytics)} segmentos")
            
        except Exception as e:
            logger.error(f"Erro na análise de segmentos: {e}")
    
    async def _save_customer_profile(self, profile: CustomerProfile):
        """Salvar perfil de cliente no banco de dados"""
        try:
            profile_data = {
                'total_value': profile.total_value,
                'preferred_zones': profile.preferred_zones,
                'visit_frequency_days': profile.visit_frequency_days,
                'loyalty_score': profile.loyalty_score,
                'risk_score': profile.risk_score
            }
            
            query = """
            INSERT INTO customer_segments 
            (customer_id, segment, first_visit, last_visit, visit_count, avg_dwell_time, conversion_rate, profile_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (customer_id) 
            DO UPDATE SET
                segment = EXCLUDED.segment,
                last_visit = EXCLUDED.last_visit,
                visit_count = EXCLUDED.visit_count,
                avg_dwell_time = EXCLUDED.avg_dwell_time,
                conversion_rate = EXCLUDED.conversion_rate,
                profile_data = EXCLUDED.profile_data
            """
            
            await self.db.execute(
                query,
                profile.customer_id,
                profile.segment,
                profile.first_visit,
                profile.last_visit,
                profile.visit_count,
                profile.avg_dwell_time,
                profile.conversion_rate,
                json.dumps(profile_data)
            )
            
        except Exception as e:
            logger.error(f"Erro ao salvar perfil do cliente: {e}")
    
    def _should_re_segment(self) -> bool:
        """Determinar se deve executar re-segmentação"""
        if not self.last_analysis_time:
            return True
        
        # Re-segmentar a cada 1 hora ou se há muitos clientes novos
        time_threshold = datetime.now() - timedelta(hours=1)
        return self.last_analysis_time < time_threshold
    
    async def get_segment_summary(self) -> Dict[str, Any]:
        """Obter resumo da segmentação atual"""
        try:
            return {
                'total_customers': len(self.customer_profiles),
                'segments': {
                    segment: analysis.__dict__ 
                    for segment, analysis in self.segment_analytics.items()
                },
                'last_analysis': self.last_analysis_time.isoformat() if self.last_analysis_time else None,
                'ml_clustering_active': self.clustering_model is not None
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter resumo de segmentação: {e}")
            return {}
    
    async def get_customer_profile(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Obter perfil detalhado de um cliente"""
        try:
            if customer_id not in self.customer_profiles:
                return None
            
            profile = self.customer_profiles[customer_id]
            return {
                'customer_id': profile.customer_id,
                'segment': profile.segment,
                'visit_count': profile.visit_count,
                'avg_dwell_time': profile.avg_dwell_time,
                'first_visit': profile.first_visit.isoformat(),
                'last_visit': profile.last_visit.isoformat(),
                'visit_frequency_days': profile.visit_frequency_days,
                'loyalty_score': profile.loyalty_score,
                'risk_score': profile.risk_score,
                'conversion_rate': profile.conversion_rate,
                'preferred_zones': profile.preferred_zones,
                'total_value': profile.total_value
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter perfil do cliente: {e}")
            return None
    
    async def predict_customer_behavior(self, customer_id: str) -> Dict[str, Any]:
        """Prever comportamento futuro do cliente"""
        try:
            if customer_id not in self.customer_profiles:
                return {}
            
            profile = self.customer_profiles[customer_id]
            
            # Predições simples baseadas no perfil
            predictions = {}
            
            # Probabilidade de retorno
            if profile.risk_score < 0.3:
                return_probability = 0.9
            elif profile.risk_score < 0.6:
                return_probability = 0.6
            else:
                return_probability = 0.3
                
            predictions['return_probability'] = return_probability
            
            # Próxima visita prevista
            if profile.visit_frequency_days > 0:
                days_until_next = profile.visit_frequency_days
                next_visit = profile.last_visit + timedelta(days=days_until_next)
                predictions['predicted_next_visit'] = next_visit.isoformat()
            
            # Valor potencial da próxima visita
            base_value = profile.total_value / profile.visit_count if profile.visit_count > 0 else 0
            predictions['predicted_value'] = base_value * profile.conversion_rate
            
            # Recomendações
            recommendations = []
            if profile.risk_score > 0.6:
                recommendations.append("Cliente em risco - considerar campanha de retenção")
            if profile.loyalty_score > 0.8:
                recommendations.append("Cliente leal - candidato a programa VIP")
            if profile.conversion_rate < 0.3:
                recommendations.append("Baixa conversão - revisar experiência na loja")
                
            predictions['recommendations'] = recommendations
            
            return predictions
            
        except Exception as e:
            logger.error(f"Erro ao prever comportamento: {e}")
            return {}
    
    def configure_segment_rules(self, new_rules: Dict[str, Dict[str, Any]]):
        """Configurar regras de segmentação customizadas"""
        try:
            self.segment_rules.update(new_rules)
            logger.info("✅ Regras de segmentação atualizadas")
            
        except Exception as e:
            logger.error(f"Erro ao configurar regras: {e}")
    
    async def export_segmentation_data(self) -> Dict[str, Any]:
        """Exportar dados de segmentação para análise externa"""
        try:
            export_data = {
                'timestamp': datetime.now().isoformat(),
                'total_customers': len(self.customer_profiles),
                'segments': self.segment_analytics,
                'customers': [
                    {
                        'customer_id': profile.customer_id,
                        'segment': profile.segment,
                        'metrics': {
                            'visit_count': profile.visit_count,
                            'avg_dwell_time': profile.avg_dwell_time,
                            'loyalty_score': profile.loyalty_score,
                            'risk_score': profile.risk_score,
                            'conversion_rate': profile.conversion_rate
                        }
                    }
                    for profile in self.customer_profiles.values()
                ]
            }
            
            return export_data
            
        except Exception as e:
            logger.error(f"Erro ao exportar dados: {e}")
            return {}