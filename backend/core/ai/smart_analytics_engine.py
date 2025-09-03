"""
🧠 SMART ANALYTICS ENGINE - Integração Completa
Motor de análise inteligente que combina todos os módulos de IA
"""

import asyncio
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import json
from loguru import logger

# Importar todos os módulos de IA
from .face_recognition.privacy_first_face_registry import PrivacyFirstFaceRegistry, IdentificationResult
from .temporal_analysis.purchase_analyzer import TemporalPurchaseAnalyzer, CustomerJourney
from .behavior_reid.behavior_signature import BehaviorReID, BehaviorSignature
from .group_detection.group_analyzer import GroupDetector, Group, Person, AgeGroup

@dataclass
class SmartDetection:
    """Detecção inteligente combinada"""
    person_id: str
    timestamp: datetime
    position: Tuple[float, float]
    confidence: float
    
    # Identificação facial
    identity: Optional[IdentificationResult] = None
    
    # Análise comportamental
    behavior_match: Optional[Dict[str, Any]] = None
    customer_type: Optional[str] = None
    
    # Análise de grupo
    group_id: Optional[str] = None
    group_role: Optional[str] = None
    
    # Análise temporal
    journey_state: Optional[str] = None
    purchase_probability: float = 0.0
    
    # Metadados
    is_employee: bool = False
    is_returning_customer: bool = False
    estimated_age_group: Optional[str] = None

@dataclass
class SmartMetrics:
    """Métricas inteligentes combinadas"""
    # Contagem inteligente
    total_visitors: int = 0
    real_customers: int = 0  # Exclui funcionários
    employees_detected: int = 0
    groups_count: int = 0
    
    # Análise de grupos
    groups: Dict[str, int] = None
    
    # Comportamento
    customer_types: Dict[str, int] = None
    
    # Temporal
    purchases: Dict[str, Any] = None
    
    # Re-identificação
    returning_customers: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.groups is None:
            self.groups = {
                'families': 0,
                'couples': 0,
                'friends': 0,
                'average_size': 0.0
            }
        
        if self.customer_types is None:
            self.customer_types = {
                'objective': 0,
                'explorer': 0,
                'economic': 0,
                'casual': 0
            }
        
        if self.purchases is None:
            self.purchases = {
                'confirmed_by_behavior': 0,
                'avg_time_to_purchase': '00:00:00',
                'conversion_rate': 0.0
            }
        
        if self.returning_customers is None:
            self.returning_customers = {
                'count': 0,
                'percentage': 0.0,
                'avg_visits_per_customer': 0.0
            }

class SmartAnalyticsEngine:
    """
    Motor principal que combina todos os módulos de IA para análise inteligente
    """
    
    def __init__(self, enable_face_recognition: bool = True):
        # Inicializar módulos de IA
        self.face_registry = PrivacyFirstFaceRegistry() if enable_face_recognition else None
        self.purchase_analyzer = TemporalPurchaseAnalyzer()
        self.behavior_reid = BehaviorReID()
        self.group_detector = GroupDetector()
        
        # Estado interno
        self.current_detections: Dict[str, SmartDetection] = {}
        self.active_people: Dict[str, Person] = {}
        self.processing_queue = asyncio.Queue()
        
        # Configurações
        self.face_recognition_enabled = enable_face_recognition and (self.face_registry is not None)
        self.min_track_length = 5  # Mínimo de pontos para análise comportamental
        
        # Cache para otimização
        self._metrics_cache = None
        self._cache_expiry = datetime.now()
        self._cache_duration = timedelta(seconds=2)
        
        logger.info(f"Smart Analytics Engine inicializado (Face Recognition: {self.face_recognition_enabled})")
    
    async def process_frame_detections(self, detections: List[Dict[str, Any]], frame: np.ndarray = None) -> List[SmartDetection]:
        """
        Processa detecções de um frame através de todos os módulos de IA
        
        Args:
            detections: Lista de detecções do YOLOv8
            frame: Frame original (opcional, para reconhecimento facial)
            
        Returns:
            Lista de detecções inteligentes processadas
        """
        try:
            smart_detections = []
            people_in_frame = []
            
            for detection in detections:
                # Extrair informações básicas
                person_id = detection.get('tracking_id', f"person_{len(smart_detections)}")
                position = detection.get('center', (0, 0))
                confidence = detection.get('confidence', 0.0)
                bbox = detection.get('bbox', [0, 0, 100, 100])
                
                # Criar detecção inteligente base
                smart_detection = SmartDetection(
                    person_id=person_id,
                    timestamp=datetime.now(),
                    position=position,
                    confidence=confidence
                )
                
                # Criar objeto Person para análise de grupo
                height_estimate = bbox[3] - bbox[1] if len(bbox) >= 4 else 100
                width_estimate = bbox[2] - bbox[0] if len(bbox) >= 4 else 50
                
                person = Person(
                    person_id=person_id,
                    position=position,
                    timestamp=datetime.now(),
                    age_group=self._estimate_age_from_height(height_estimate),
                    height_estimate=height_estimate,
                    width_estimate=width_estimate,
                    confidence=confidence
                )
                
                people_in_frame.append(person)
                self.active_people[person_id] = person
                
                # 1. RECONHECIMENTO FACIAL (se habilitado e frame disponível)
                if self.face_recognition_enabled and frame is not None:
                    try:
                        face_region = self._extract_face_region(frame, bbox)
                        if face_region is not None:
                            identity = await self.face_registry.identify_person(face_region)
                            smart_detection.identity = identity
                            smart_detection.is_employee = (identity.type == 'employee')
                            smart_detection.is_returning_customer = (identity.type == 'frequent_customer')
                    except Exception as e:
                        logger.debug(f"Erro no reconhecimento facial: {e}")
                
                # 2. ANÁLISE TEMPORAL (jornada do cliente)
                try:
                    journey = await self.purchase_analyzer.track_customer_journey(
                        person_id=person_id,
                        timestamp=smart_detection.timestamp,
                        position=position,
                        observations=detection.get('observations', {})
                    )
                    
                    if journey:
                        smart_detection.journey_state = self._get_journey_state(journey)
                        smart_detection.purchase_probability = journey.purchase_probability
                        smart_detection.customer_type = journey.customer_type
                except Exception as e:
                    logger.debug(f"Erro na análise temporal: {e}")
                
                smart_detections.append(smart_detection)
            
            # 3. DETECÇÃO DE GRUPOS
            try:
                detected_groups = await self.group_detector.detect_groups(people_in_frame)
                
                # Atualizar detecções com informações de grupo
                for group in detected_groups:
                    for member in group.members:
                        for detection in smart_detections:
                            if detection.person_id == member.person_id:
                                detection.group_id = group.group_id
                                detection.group_role = member.role
                                break
            except Exception as e:
                logger.debug(f"Erro na detecção de grupos: {e}")
            
            # 4. ANÁLISE COMPORTAMENTAL (Re-ID)
            await self._process_behavior_analysis(smart_detections)
            
            # Atualizar cache de detecções
            for detection in smart_detections:
                self.current_detections[detection.person_id] = detection
            
            # Limpar cache de métricas
            self._metrics_cache = None
            
            return smart_detections
            
        except Exception as e:
            logger.error(f"Erro no processamento inteligente: {e}")
            return []
    
    async def _process_behavior_analysis(self, detections: List[SmartDetection]):
        """Processa análise comportamental para re-identificação"""
        for detection in detections:
            try:
                # Obter histórico de tracking da pessoa (simulado)
                person_track = self._get_person_track_history(detection.person_id)
                
                if len(person_track) >= self.min_track_length:
                    # Extrair assinatura comportamental
                    behavior_signature = self.behavior_reid.extract_behavior_signature(person_track)
                    
                    # Verificar se é cliente retornando
                    match_result = self.behavior_reid.match_returning_customer(behavior_signature)
                    
                    detection.behavior_match = match_result
                    detection.is_returning_customer = match_result['is_returning']
                    detection.customer_type = self.behavior_reid.classify_customer_type(behavior_signature)
                    
            except Exception as e:
                logger.debug(f"Erro na análise comportamental para {detection.person_id}: {e}")
    
    def _get_person_track_history(self, person_id: str) -> List[Dict]:
        """Obtém histórico de tracking de uma pessoa (simulado)"""
        # Em implementação real, isso viria do tracker
        # Aqui vamos simular com dados básicos
        if person_id in self.active_people:
            person = self.active_people[person_id]
            return [{
                'center': person.position,
                'timestamp': person.timestamp.timestamp(),
                'height': person.height_estimate,
                'width': person.width_estimate,
                'confidence': person.confidence,
                'zone': 'products'  # seria calculado baseado na posição
            }]
        return []
    
    def _extract_face_region(self, frame: np.ndarray, bbox: List[int]) -> Optional[np.ndarray]:
        """Extrai região da face do frame"""
        try:
            if len(bbox) < 4:
                return None
            
            x1, y1, x2, y2 = bbox
            
            # Expandir bbox para incluir mais contexto facial
            height = y2 - y1
            width = x2 - x1
            
            # Ajustar para região da cabeça (terço superior do bbox)
            face_y1 = max(0, y1)
            face_y2 = min(frame.shape[0], y1 + int(height * 0.4))
            face_x1 = max(0, x1)
            face_x2 = min(frame.shape[1], x2)
            
            face_region = frame[face_y1:face_y2, face_x1:face_x2]
            
            # Verificar se a região é válida
            if face_region.size == 0 or min(face_region.shape[:2]) < 32:
                return None
            
            return face_region
            
        except Exception as e:
            logger.debug(f"Erro ao extrair região facial: {e}")
            return None
    
    def _estimate_age_from_height(self, height: float) -> AgeGroup:
        """Estima idade baseada na altura"""
        if height < 80:
            return AgeGroup.CRIANCA
        elif height < 120:
            return AgeGroup.ADOLESCENTE
        elif height < 150:
            return AgeGroup.JOVEM
        elif height < 180:
            return AgeGroup.ADULTO
        else:
            return AgeGroup.IDOSO
    
    def _get_journey_state(self, journey: CustomerJourney) -> str:
        """Obtém estado atual da jornada do cliente"""
        if journey.exit_time:
            return 'completed'
        elif journey.cashier_time > 10:
            return 'at_cashier'
        elif len(journey.zones_visited) > 2:
            return 'browsing'
        else:
            return 'exploring'
    
    async def get_smart_metrics(self) -> SmartMetrics:
        """
        Obtém métricas inteligentes combinadas
        
        Returns:
            SmartMetrics com análise completa
        """
        # Verificar cache
        if (self._metrics_cache and 
            datetime.now() < self._cache_expiry):
            return self._metrics_cache
        
        try:
            metrics = SmartMetrics()
            
            # Análise das detecções atuais
            current_detections = list(self.current_detections.values())
            
            # Contagem inteligente
            metrics.total_visitors = len(current_detections)
            metrics.employees_detected = sum(1 for d in current_detections if d.is_employee)
            metrics.real_customers = metrics.total_visitors - metrics.employees_detected
            
            # Análise de grupos
            active_groups = self.group_detector.get_active_groups()
            metrics.groups_count = len(active_groups)
            
            group_types = {'families': 0, 'couples': 0, 'friends': 0}
            total_group_size = 0
            
            for group in active_groups:
                if group.group_type.value in group_types:
                    group_types[group.group_type.value] += 1
                total_group_size += group.size
            
            metrics.groups = group_types
            metrics.groups['average_size'] = (total_group_size / len(active_groups) 
                                            if active_groups else 0.0)
            
            # Análise por tipo de cliente
            customer_types = {'objective': 0, 'explorer': 0, 'economic': 0, 'casual': 0}
            for detection in current_detections:
                if detection.customer_type and detection.customer_type in customer_types:
                    customer_types[detection.customer_type] += 1
            
            metrics.customer_types = customer_types
            
            # Análise de compras (últimas 24h)
            purchase_stats = self.purchase_analyzer.get_purchase_statistics(timedelta(hours=24))
            if 'error' not in purchase_stats:
                metrics.purchases = {
                    'confirmed_by_behavior': purchase_stats.get('likely_purchases', 0),
                    'avg_time_to_purchase': self._format_duration(purchase_stats.get('avg_journey_time', 0)),
                    'conversion_rate': purchase_stats.get('conversion_rate', 0.0)
                }
            
            # Re-identificação de clientes
            behavior_stats = self.behavior_reid.get_statistics()
            if 'total_customers' in behavior_stats:
                total_customers = behavior_stats['total_customers']
                frequent_customers = behavior_stats.get('frequent_customers', 0)
                
                metrics.returning_customers = {
                    'count': frequent_customers,
                    'percentage': (frequent_customers / max(1, total_customers)) * 100,
                    'avg_visits_per_customer': behavior_stats.get('avg_visits_per_customer', 0.0)
                }
            
            # Cache do resultado
            self._metrics_cache = metrics
            self._cache_expiry = datetime.now() + self._cache_duration
            
            return metrics
            
        except Exception as e:
            logger.error(f"Erro ao calcular métricas inteligentes: {e}")
            return SmartMetrics()
    
    def _format_duration(self, seconds: float) -> str:
        """Formata duração em segundos para string legível"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    
    async def register_employee_face(self, image_path: str, employee_id: str, name: str) -> Dict[str, Any]:
        """
        Registra funcionário no sistema de reconhecimento facial
        
        Args:
            image_path: Caminho para foto temporária
            employee_id: ID único do funcionário
            name: Nome do funcionário
            
        Returns:
            Resultado do registro
        """
        if not self.face_recognition_enabled:
            return {'success': False, 'error': 'Reconhecimento facial desabilitado'}
        
        return await self.face_registry.register_employee(image_path, employee_id, name)
    
    async def remove_employee_face(self, employee_id: str) -> bool:
        """Remove funcionário do sistema"""
        if not self.face_recognition_enabled:
            return False
        
        return self.face_registry.remove_employee(employee_id)
    
    def get_employee_list(self) -> List[Dict[str, Any]]:
        """Lista funcionários cadastrados"""
        if not self.face_recognition_enabled:
            return []
        
        return self.face_registry.get_employee_list()
    
    async def get_detailed_analytics(self) -> Dict[str, Any]:
        """
        Obtém análise detalhada combinando todos os módulos
        
        Returns:
            Análise completa com insights de todos os sistemas
        """
        try:
            # Métricas gerais
            smart_metrics = await self.get_smart_metrics()
            
            # Estatísticas detalhadas de cada módulo
            face_stats = (self.face_registry.get_statistics() 
                         if self.face_recognition_enabled else {})
            purchase_stats = self.purchase_analyzer.get_purchase_statistics()
            behavior_stats = self.behavior_reid.get_statistics()
            group_stats = self.group_detector.get_group_statistics()
            
            # Análise de tendências
            trends = await self._analyze_trends()
            
            # Insights automatizados
            insights = await self._generate_insights()
            
            return {
                'timestamp': datetime.now().isoformat(),
                'smart_metrics': smart_metrics,
                'detailed_stats': {
                    'face_recognition': face_stats,
                    'purchase_analysis': purchase_stats,
                    'behavior_reid': behavior_stats,
                    'group_detection': group_stats
                },
                'trends': trends,
                'insights': insights,
                'system_status': {
                    'face_recognition': self.face_recognition_enabled,
                    'modules_active': 4,
                    'processing_queue_size': self.processing_queue.qsize()
                }
            }
            
        except Exception as e:
            logger.error(f"Erro ao gerar análise detalhada: {e}")
            return {'error': str(e)}
    
    async def _analyze_trends(self) -> Dict[str, Any]:
        """Analisa tendências nos dados"""
        # Placeholder para análise de tendências
        # Em implementação real, analisaria dados históricos
        return {
            'visitor_trend': 'stable',
            'conversion_trend': 'improving',
            'group_size_trend': 'increasing',
            'return_customer_trend': 'stable'
        }
    
    async def _generate_insights(self) -> List[Dict[str, str]]:
        """Gera insights automatizados"""
        insights = []
        
        try:
            metrics = await self.get_smart_metrics()
            
            # Insight sobre funcionários detectados
            if metrics.employees_detected > 0:
                insights.append({
                    'type': 'info',
                    'title': 'Funcionários na Loja',
                    'message': f'{metrics.employees_detected} funcionários detectados atualmente'
                })
            
            # Insight sobre conversão
            if metrics.purchases['conversion_rate'] > 15:
                insights.append({
                    'type': 'positive',
                    'title': 'Boa Taxa de Conversão',
                    'message': f'Taxa de conversão atual: {metrics.purchases["conversion_rate"]:.1f}%'
                })
            
            # Insight sobre grupos
            if metrics.groups['families'] > metrics.groups['couples']:
                insights.append({
                    'type': 'info',
                    'title': 'Perfil de Visitantes',
                    'message': 'Muitas famílias visitando - considere produtos infantis'
                })
            
            # Insight sobre clientes retornando
            if metrics.returning_customers['percentage'] > 30:
                insights.append({
                    'type': 'positive',
                    'title': 'Fidelização Alta',
                    'message': f'{metrics.returning_customers["percentage"]:.1f}% são clientes retornando'
                })
                
        except Exception as e:
            logger.error(f"Erro ao gerar insights: {e}")
        
        return insights
    
    def cleanup_old_data(self):
        """Remove dados antigos da memória"""
        try:
            # Limpar detecções antigas (>5 minutos)
            cutoff_time = datetime.now() - timedelta(minutes=5)
            to_remove = [
                person_id for person_id, detection in self.current_detections.items()
                if detection.timestamp < cutoff_time
            ]
            
            for person_id in to_remove:
                del self.current_detections[person_id]
                if person_id in self.active_people:
                    del self.active_people[person_id]
            
            # Limpar dados dos módulos
            self.purchase_analyzer.cleanup_old_journeys()
            self.group_detector.cleanup_old_groups()
            
            if to_remove:
                logger.debug(f"Limpeza: removidos {len(to_remove)} registros antigos")
                
        except Exception as e:
            logger.error(f"Erro na limpeza de dados: {e}")
    
    async def get_person_details(self, person_id: str) -> Optional[Dict[str, Any]]:
        """Obtém detalhes completos sobre uma pessoa específica"""
        if person_id not in self.current_detections:
            return None
        
        detection = self.current_detections[person_id]
        
        # Obter jornada do cliente
        journey = self.purchase_analyzer.get_journey(person_id)
        
        # Obter insights comportamentais
        behavior_insights = None
        if detection.behavior_match:
            customer_id = detection.behavior_match.get('customer_id')
            if customer_id:
                behavior_insights = self.behavior_reid.get_customer_insights(customer_id)
        
        return {
            'person_id': person_id,
            'detection': {
                'timestamp': detection.timestamp.isoformat(),
                'position': detection.position,
                'confidence': detection.confidence,
                'is_employee': detection.is_employee,
                'is_returning_customer': detection.is_returning_customer,
                'customer_type': detection.customer_type,
                'estimated_age_group': detection.estimated_age_group
            },
            'identity': detection.identity.__dict__ if detection.identity else None,
            'group_info': {
                'group_id': detection.group_id,
                'role': detection.group_role
            } if detection.group_id else None,
            'journey': journey.__dict__ if journey else None,
            'behavior_insights': behavior_insights
        }