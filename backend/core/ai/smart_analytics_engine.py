"""
Smart Analytics Engine - Cérebro do ShopFlow
Integra todas as funcionalidades de IA avançada
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
import cv2
from datetime import datetime, timedelta
import asyncio
import json
from loguru import logger
import hashlib
from enum import Enum

# Importar módulos de IA
from .face_recognition import FaceRecognitionManager
from .behavior_analyzer import BehaviorAnalyzer
from .customer_segmentation import CustomerSegmentation
from .predictive_insights import PredictiveEngine
from .privacy_config import PrivacyManager

class PersonType(Enum):
    CUSTOMER = "customer"
    EMPLOYEE = "employee"
    UNKNOWN = "unknown"

@dataclass
class SmartMetrics:
    """Métricas inteligentes geradas pela IA"""
    # Contagem básica
    total_people: int
    customers: int
    employees: int
    
    # Análise comportamental
    avg_dwell_time: float  # Tempo médio na loja (minutos)
    hot_zones: List[Dict[str, float]]  # Zonas mais visitadas
    customer_flow_pattern: str  # Padrão de fluxo (ex: "morning_rush")
    
    # Segmentação
    customer_segments: Dict[str, int]  # Ex: {"regular": 5, "new": 3, "vip": 1}
    group_shopping_rate: float  # Taxa de compras em grupo
    
    # Predições
    next_hour_prediction: int  # Previsão de visitantes próxima hora
    conversion_probability: float  # Probabilidade de conversão atual
    optimal_staff_needed: int  # Funcionários ideais para o momento
    
    # Insights
    anomalies_detected: List[str]  # Comportamentos anômalos
    recommendations: List[str]  # Recomendações em tempo real
    
    # Metadata
    timestamp: datetime
    confidence_score: float

class SmartAnalyticsEngine:
    """
    Motor principal de IA do ShopFlow
    Coordena todos os módulos de inteligência artificial
    """
    
    def __init__(self, enable_face_recognition: bool = True):
        self.enabled = True
        self.enable_face_recognition = enable_face_recognition
        
        # Inicializar módulos
        self.face_manager = None
        self.behavior_analyzer = None
        self.segmentation = None
        self.predictive = None
        self.privacy = None
        
        # Cache e estado
        self.person_registry = {}  # ID -> PersonData
        self.employee_faces = {}  # employee_id -> face_encoding
        self.last_metrics = None
        
        logger.info("🧠 Smart Analytics Engine inicializado")
    
    async def initialize(self):
        """Inicializar todos os módulos de IA"""
        try:
            # Face Recognition
            if self.enable_face_recognition:
                self.face_manager = FaceRecognitionManager()
                await self.face_manager.initialize()
                await self.face_manager.load_employee_faces()
            
            # Behavior Analysis
            self.behavior_analyzer = BehaviorAnalyzer()
            await self.behavior_analyzer.initialize()
            
            # Customer Segmentation
            self.segmentation = CustomerSegmentation()
            await self.segmentation.initialize()
            
            # Predictive Insights
            self.predictive = PredictiveEngine()
            await self.predictive.initialize()
            
            # Privacy Manager
            self.privacy = PrivacyManager()
            
            logger.success("✅ Todos os módulos de IA inicializados")
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar IA: {e}")
            raise
    
    async def process_frame(
        self,
        frame: np.ndarray,
        detections: List[Dict],
        timestamp: datetime
    ) -> SmartMetrics:
        """
        Processar frame com todas as análises de IA
        
        Args:
            frame: Frame de vídeo
            detections: Lista de detecções do YOLO
            timestamp: Timestamp do frame
            
        Returns:
            SmartMetrics com todas as análises
        """
        
        # 1. Identificar pessoas (funcionários vs clientes)
        person_types = await self._identify_people(frame, detections)
        
        # 2. Analisar comportamento
        behavior_data = await self.behavior_analyzer.analyze(
            detections, person_types, timestamp
        )
        
        # 3. Segmentar clientes
        segments = await self.segmentation.segment_customers(
            self.person_registry, behavior_data
        )
        
        # 4. Gerar predições
        historical_data = await self._get_historical_data()
        predictions = await self.predictive.generate_predictions(
            historical_data=historical_data,
            current_state=behavior_data,
            timestamp=timestamp
        )
        
        # 5. Detectar anomalias
        anomalies = await self._detect_anomalies(behavior_data)
        
        # 6. Gerar recomendações
        recommendations = await self._generate_recommendations(
            behavior_data, predictions, anomalies
        )
        
        # 7. Compilar métricas
        metrics = SmartMetrics(
            total_people=len(detections),
            customers=sum(1 for p in person_types.values() if p == PersonType.CUSTOMER),
            employees=sum(1 for p in person_types.values() if p == PersonType.EMPLOYEE),
            avg_dwell_time=behavior_data.get('avg_dwell_time', 0),
            hot_zones=behavior_data.get('hot_zones', []),
            customer_flow_pattern=behavior_data.get('flow_pattern', 'normal'),
            customer_segments=segments,
            group_shopping_rate=behavior_data.get('group_rate', 0),
            next_hour_prediction=predictions.get('next_hour', 0),
            conversion_probability=predictions.get('conversion_prob', 0),
            optimal_staff_needed=predictions.get('optimal_staff', 1),
            anomalies_detected=anomalies,
            recommendations=recommendations,
            timestamp=timestamp,
            confidence_score=self._calculate_confidence(detections)
        )
        
        self.last_metrics = metrics
        return metrics
    
    async def _identify_people(
        self,
        frame: np.ndarray,
        detections: List[Dict]
    ) -> Dict[int, PersonType]:
        """
        Identificar se cada pessoa é funcionário ou cliente
        """
        person_types = {}
        
        if not self.face_manager or not self.enable_face_recognition:
            # Sem face recognition, todos são clientes
            return {d['id']: PersonType.CUSTOMER for d in detections}
        
        for detection in detections:
            bbox = detection['bbox']
            person_id = detection['id']
            
            # Extrair face da detecção
            face_img = self._extract_face(frame, bbox)
            
            if face_img is not None:
                # Verificar se é funcionário
                is_employee, employee_id = await self.face_manager.is_employee(face_img)
                
                if is_employee:
                    person_types[person_id] = PersonType.EMPLOYEE
                    self._update_person_registry(person_id, 'employee', employee_id)
                else:
                    # Tentar re-identificar cliente conhecido
                    customer_id = await self.face_manager.identify_customer(face_img)
                    person_types[person_id] = PersonType.CUSTOMER
                    self._update_person_registry(person_id, 'customer', customer_id)
            else:
                person_types[person_id] = PersonType.UNKNOWN
        
        return person_types
    
    async def register_employee(
        self,
        name: str,
        face_image: np.ndarray,
        employee_id: Optional[str] = None
    ) -> str:
        """
        Registrar novo funcionário no sistema
        """
        if not self.face_manager:
            raise Exception("Face recognition não está habilitado")
        
        employee_id = await self.face_manager.register_employee(
            name, face_image, employee_id
        )
        
        logger.info(f"✅ Funcionário {name} registrado com ID {employee_id}")
        return employee_id
    
    async def remove_employee(self, employee_id: str) -> bool:
        """
        Remover funcionário do sistema
        """
        if not self.face_manager:
            return False
        
        success = await self.face_manager.remove_employee(employee_id)
        if success:
            logger.info(f"✅ Funcionário {employee_id} removido")
        
        return success
    
    def _extract_face(self, frame: np.ndarray, bbox: List[int]) -> Optional[np.ndarray]:
        """
        Extrair região da face de uma bounding box
        """
        try:
            x1, y1, x2, y2 = bbox
            
            # Expandir bbox para pegar mais contexto da face
            height, width = frame.shape[:2]
            padding = 20
            
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(width, x2 + padding)
            y2 = min(height, y2 + padding)
            
            face_img = frame[y1:y2, x1:x2]
            
            if face_img.size == 0:
                return None
            
            # Aplicar blur para privacidade se necessário
            if self.privacy and self.privacy.should_blur_face():
                face_img = cv2.GaussianBlur(face_img, (99, 99), 30)
            
            return face_img
            
        except Exception as e:
            logger.error(f"Erro ao extrair face: {e}")
            return None
    
    def _update_person_registry(
        self,
        person_id: int,
        person_type: str,
        identity_id: Optional[str]
    ):
        """
        Atualizar registro de pessoas
        """
        if person_id not in self.person_registry:
            self.person_registry[person_id] = {
                'first_seen': datetime.now(),
                'last_seen': datetime.now(),
                'type': person_type,
                'identity_id': identity_id,
                'visit_count': 1,
                'total_time': 0,
                'behavior_profile': {}
            }
        else:
            self.person_registry[person_id]['last_seen'] = datetime.now()
            self.person_registry[person_id]['visit_count'] += 1
    
    async def _detect_anomalies(self, behavior_data: Dict) -> List[str]:
        """
        Detectar comportamentos anômalos
        """
        anomalies = []
        
        # Exemplo: Pessoa parada muito tempo
        if behavior_data.get('max_dwell_time', 0) > 30:  # minutos
            anomalies.append("Cliente parado há mais de 30 minutos")
        
        # Exemplo: Movimento errático
        if behavior_data.get('erratic_movement_score', 0) > 0.8:
            anomalies.append("Movimento errático detectado")
        
        # Exemplo: Aglomeração
        if behavior_data.get('crowd_density', 0) > 0.7:
            anomalies.append("Alta densidade de pessoas detectada")
        
        return anomalies
    
    async def _generate_recommendations(
        self,
        behavior_data: Dict,
        predictions: Dict,
        anomalies: List[str]
    ) -> List[str]:
        """
        Gerar recomendações baseadas em IA
        """
        recommendations = []
        
        # Recomendações de staffing
        current_staff = behavior_data.get('current_staff', 0)
        optimal_staff = predictions.get('optimal_staff', 1)
        
        if optimal_staff > current_staff:
            recommendations.append(f"📈 Adicionar {optimal_staff - current_staff} funcionário(s)")
        elif optimal_staff < current_staff:
            recommendations.append(f"📉 Reduzir {current_staff - optimal_staff} funcionário(s)")
        
        # Recomendações de conversão
        conv_prob = predictions.get('conversion_prob', 0)
        if conv_prob > 0.7:
            recommendations.append("🎯 Alta probabilidade de conversão - momento ideal para abordagem")
        elif conv_prob < 0.3:
            recommendations.append("⚠️ Baixa conversão - revisar estratégia de vendas")
        
        # Recomendações baseadas em anomalias
        if "Alta densidade" in str(anomalies):
            recommendations.append("🚨 Abrir mais caixas ou áreas de atendimento")
        
        # Recomendações de horário
        next_hour = predictions.get('next_hour', 0)
        if next_hour > behavior_data.get('current_count', 0) * 1.5:
            recommendations.append("📊 Pico previsto na próxima hora - preparar equipe")
        
        return recommendations
    
    def _calculate_confidence(self, detections: List[Dict]) -> float:
        """
        Calcular score de confiança geral
        """
        if not detections:
            return 1.0
        
        confidences = [d.get('confidence', 0.5) for d in detections]
        return sum(confidences) / len(confidences)
    
    async def _get_historical_data(self) -> Dict:
        """
        Obter dados históricos reais do banco de dados
        """
        try:
            from core.database import SupabaseManager
            from core.config import settings
            from datetime import datetime, timedelta

            # Usar gerenciador do banco se disponível globalmente
            supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            await supabase.initialize()

            # Buscar dados da última hora
            last_hour = datetime.now() - timedelta(hours=1)
            current_stats = await supabase.get_current_stats()
            camera_stats = await supabase.get_camera_stats(hours=1)
            conversion_data = await supabase.get_conversion_rate()

            # Calcular métricas reais
            last_hour_visitors = camera_stats.get('total_people', 0)
            last_hour_sales = conversion_data.get('sales_count', 0)
            avg_daily_visitors = camera_stats.get('total_people', 0) * 24  # Estimativa
            avg_conversion_rate = conversion_data.get('conversion_rate', 0) / 100

            return {
                'last_hour_visitors': last_hour_visitors,
                'last_hour_sales': last_hour_sales,
                'avg_daily_visitors': avg_daily_visitors,
                'avg_conversion_rate': avg_conversion_rate
            }

        except Exception as e:
            logger.error(f"Erro ao buscar dados históricos: {e}")
            # Fallback para dados vazios em caso de erro
            return {
                'last_hour_visitors': 0,
                'last_hour_sales': 0,
                'avg_daily_visitors': 0,
                'avg_conversion_rate': 0.0
            }
    
    async def get_analytics_summary(self) -> Dict:
        """
        Obter resumo analítico completo
        """
        if not self.last_metrics:
            return {}
        
        return {
            'metrics': self.last_metrics.__dict__,
            'registry_size': len(self.person_registry),
            'employees_detected': len([
                p for p in self.person_registry.values()
                if p['type'] == 'employee'
            ]),
            'customers_detected': len([
                p for p in self.person_registry.values()
                if p['type'] == 'customer'
            ]),
            'ai_modules_status': {
                'face_recognition': self.face_manager is not None,
                'behavior_analysis': self.behavior_analyzer is not None,
                'segmentation': self.segmentation is not None,
                'predictive': self.predictive is not None
            }
        }