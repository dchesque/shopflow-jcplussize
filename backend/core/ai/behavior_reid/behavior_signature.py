"""
🧬 ANÁLISE DE COMPORTAMENTO - Re-Identification
Sistema que re-identifica pessoas por padrões comportamentais únicos
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json
import hashlib
from loguru import logger
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import cv2

@dataclass 
class GaitPattern:
    """Padrão de caminhada único"""
    step_frequency: float  # passos por segundo
    stride_length: float   # comprimento da passada
    body_sway: float      # oscilação lateral
    speed_variation: float # variação de velocidade
    symmetry: float       # simetria da caminhada
    
@dataclass
class BodyMetrics:
    """Métricas corporais estimadas"""
    height_estimate: float        # altura em pixels
    width_estimate: float         # largura em pixels
    body_ratio: float            # proporção altura/largura
    shoulder_width: float        # largura dos ombros
    head_body_ratio: float       # proporção cabeça/corpo
    posture_angle: float         # ângulo da postura

@dataclass
class MovementBehavior:
    """Padrões de movimento"""
    avg_speed: float             # velocidade média
    max_speed: float             # velocidade máxima
    acceleration_pattern: List[float]  # padrão de aceleração
    direction_changes: int       # mudanças de direção
    stopping_frequency: float   # frequência de paradas
    path_smoothness: float      # suavidade do caminho
    preferred_routes: List[str]  # rotas preferidas

@dataclass
class ShoppingBehavior:
    """Comportamento de compras"""
    browsing_style: str          # 'quick', 'methodical', 'wandering'
    interest_zones: List[str]    # zonas de maior interesse
    interaction_style: str       # 'toucher', 'observer', 'picker'
    decision_time: float         # tempo para tomar decisões
    product_comparison: bool     # se compara produtos
    price_sensitivity: float    # sensibilidade a preços (estimada)
    
@dataclass
class TemporalBehavior:
    """Padrões temporais"""
    visit_duration_avg: float      # duração média das visitas
    visit_frequency: float          # frequência de visitas
    preferred_times: List[int]      # horários preferidos (0-23)
    day_of_week_pattern: List[int]  # dias da semana preferidos
    seasonal_pattern: Dict[str, float]  # padrões sazonais

@dataclass
class BehaviorSignature:
    """Assinatura comportamental completa"""
    signature_id: str
    gait_pattern: GaitPattern
    body_metrics: BodyMetrics
    movement_behavior: MovementBehavior
    shopping_behavior: ShoppingBehavior
    temporal_behavior: TemporalBehavior
    confidence: float = 1.0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    visit_count: int = 1
    
    def to_vector(self) -> np.ndarray:
        """Converte assinatura para vetor numérico para comparação"""
        vector = np.array([
            # Gait pattern
            self.gait_pattern.step_frequency,
            self.gait_pattern.stride_length,
            self.gait_pattern.body_sway,
            self.gait_pattern.speed_variation,
            self.gait_pattern.symmetry,
            
            # Body metrics
            self.body_metrics.height_estimate,
            self.body_metrics.width_estimate,
            self.body_metrics.body_ratio,
            self.body_metrics.shoulder_width,
            self.body_metrics.head_body_ratio,
            self.body_metrics.posture_angle,
            
            # Movement behavior
            self.movement_behavior.avg_speed,
            self.movement_behavior.max_speed,
            self.movement_behavior.direction_changes,
            self.movement_behavior.stopping_frequency,
            self.movement_behavior.path_smoothness,
            
            # Shopping behavior (encoded)
            self._encode_browsing_style(),
            len(self.shopping_behavior.interest_zones),
            self._encode_interaction_style(),
            self.shopping_behavior.decision_time,
            float(self.shopping_behavior.product_comparison),
            self.shopping_behavior.price_sensitivity,
            
            # Temporal behavior
            self.temporal_behavior.visit_duration_avg,
            self.temporal_behavior.visit_frequency,
            len(self.temporal_behavior.preferred_times),
        ])
        
        return vector
    
    def _encode_browsing_style(self) -> float:
        """Codifica estilo de navegação"""
        styles = {'quick': 0.0, 'methodical': 0.5, 'wandering': 1.0}
        return styles.get(self.shopping_behavior.browsing_style, 0.5)
    
    def _encode_interaction_style(self) -> float:
        """Codifica estilo de interação"""
        styles = {'observer': 0.0, 'toucher': 0.5, 'picker': 1.0}
        return styles.get(self.shopping_behavior.interaction_style, 0.5)

class GaitAnalyzer:
    """Analisador de padrão de caminhada"""
    
    def __init__(self):
        self.min_track_points = 10
        self.fps = 25  # frames por segundo
        
    def extract_pattern(self, person_track: List[Dict]) -> GaitPattern:
        """Extrai padrão de caminhada de um tracking"""
        if len(person_track) < self.min_track_points:
            return self._default_gait_pattern()
        
        # Extrair posições e timestamps
        positions = [(point['center'][0], point['center'][1]) for point in person_track]
        timestamps = [point.get('timestamp', i/self.fps) for i, point in enumerate(person_track)]
        
        # Calcular velocidades
        velocities = self._calculate_velocities(positions, timestamps)
        
        # Analisar frequência de passos (através de oscilações na velocidade)
        step_frequency = self._analyze_step_frequency(velocities)
        
        # Calcular comprimento da passada
        stride_length = self._calculate_stride_length(positions, step_frequency, timestamps)
        
        # Analisar oscilação lateral
        body_sway = self._analyze_body_sway(positions)
        
        # Variação de velocidade
        speed_variation = np.std(velocities) if velocities else 0
        
        # Simetria (análise de regularidade do movimento)
        symmetry = self._analyze_symmetry(positions, velocities)
        
        return GaitPattern(
            step_frequency=step_frequency,
            stride_length=stride_length,
            body_sway=body_sway,
            speed_variation=speed_variation,
            symmetry=symmetry
        )
    
    def _calculate_velocities(self, positions: List[Tuple], timestamps: List[float]) -> List[float]:
        """Calcula velocidades entre pontos consecutivos"""
        velocities = []
        for i in range(1, len(positions)):
            dx = positions[i][0] - positions[i-1][0]
            dy = positions[i][1] - positions[i-1][1]
            dt = timestamps[i] - timestamps[i-1]
            
            if dt > 0:
                velocity = np.sqrt(dx*dx + dy*dy) / dt
                velocities.append(velocity)
        
        return velocities
    
    def _analyze_step_frequency(self, velocities: List[float]) -> float:
        """Analisa frequência de passos através de FFT nas velocidades"""
        if len(velocities) < 10:
            return 2.0  # frequência padrão
        
        # FFT para encontrar periodicidade
        fft = np.fft.fft(velocities)
        freqs = np.fft.fftfreq(len(velocities), 1/self.fps)
        
        # Encontrar pico dominante na faixa de frequência de passos humanos (1-4 Hz)
        valid_indices = np.where((freqs >= 1) & (freqs <= 4))[0]
        if len(valid_indices) > 0:
            peak_idx = valid_indices[np.argmax(np.abs(fft[valid_indices]))]
            return abs(freqs[peak_idx])
        
        return 2.0  # padrão
    
    def _calculate_stride_length(self, positions: List[Tuple], step_frequency: float, timestamps: List[float]) -> float:
        """Calcula comprimento médio da passada"""
        if len(positions) < 2 or len(timestamps) < 2:
            return 60.0  # padrão
        
        total_distance = 0
        for i in range(1, len(positions)):
            dx = positions[i][0] - positions[i-1][0]
            dy = positions[i][1] - positions[i-1][1]
            total_distance += np.sqrt(dx*dx + dy*dy)
        
        total_time = timestamps[-1] - timestamps[0]
        if total_time > 0 and step_frequency > 0:
            avg_speed = total_distance / total_time
            stride_length = avg_speed / step_frequency
            return stride_length
        
        return 60.0
    
    def _analyze_body_sway(self, positions: List[Tuple]) -> float:
        """Analisa oscilação lateral do corpo"""
        if len(positions) < 5:
            return 0.0
        
        x_positions = [pos[0] for pos in positions]
        
        # Calcular desvio padrão das posições X (oscilação lateral)
        sway = np.std(x_positions)
        return float(sway)
    
    def _analyze_symmetry(self, positions: List[Tuple], velocities: List[float]) -> float:
        """Analisa simetria do movimento"""
        if len(velocities) < 10:
            return 1.0
        
        # Analisar regularidade das velocidades
        velocity_regularity = 1.0 / (1.0 + np.std(velocities))
        
        # Analisar suavidade do caminho
        if len(positions) >= 3:
            direction_changes = 0
            for i in range(1, len(positions) - 1):
                prev_angle = np.arctan2(positions[i][1] - positions[i-1][1], 
                                      positions[i][0] - positions[i-1][0])
                next_angle = np.arctan2(positions[i+1][1] - positions[i][1], 
                                      positions[i+1][0] - positions[i][0])
                angle_diff = abs(prev_angle - next_angle)
                if angle_diff > 0.5:  # mudança significativa
                    direction_changes += 1
            
            smoothness = 1.0 / (1.0 + direction_changes / len(positions))
            return (velocity_regularity + smoothness) / 2
        
        return velocity_regularity
    
    def _default_gait_pattern(self) -> GaitPattern:
        """Retorna padrão padrão quando não há dados suficientes"""
        return GaitPattern(
            step_frequency=2.0,
            stride_length=60.0,
            body_sway=5.0,
            speed_variation=10.0,
            symmetry=0.8
        )

class BehaviorReID:
    """
    Sistema de Re-identificação baseado em comportamento
    Re-identifica pessoas por padrões comportamentais únicos
    """
    
    def __init__(self, similarity_threshold: float = 0.75):
        self.behavior_signatures: Dict[str, BehaviorSignature] = {}
        self.gait_analyzer = GaitAnalyzer()
        self.similarity_threshold = similarity_threshold
        self.scaler = StandardScaler()
        self.next_customer_id = 1
        
        logger.info("Behavior ReID inicializado")
    
    def extract_behavior_signature(self, person_track: List[Dict]) -> BehaviorSignature:
        """
        Cria assinatura comportamental única de um tracking
        
        Args:
            person_track: Lista de observações da pessoa
            
        Returns:
            BehaviorSignature única
        """
        # Extrair características físicas estimadas
        body_metrics = self._extract_body_metrics(person_track)
        
        # Analisar padrão de caminhada
        gait_pattern = self.gait_analyzer.extract_pattern(person_track)
        
        # Analisar movimento geral
        movement_behavior = self._analyze_movement_behavior(person_track)
        
        # Analisar comportamento de compras
        shopping_behavior = self._analyze_shopping_behavior(person_track)
        
        # Analisar padrões temporais
        temporal_behavior = self._analyze_temporal_behavior(person_track)
        
        # Gerar ID único
        signature_id = self._generate_signature_id(gait_pattern, body_metrics)
        
        signature = BehaviorSignature(
            signature_id=signature_id,
            gait_pattern=gait_pattern,
            body_metrics=body_metrics,
            movement_behavior=movement_behavior,
            shopping_behavior=shopping_behavior,
            temporal_behavior=temporal_behavior
        )
        
        return signature
    
    def _extract_body_metrics(self, person_track: List[Dict]) -> BodyMetrics:
        """Extrai métricas corporais estimadas"""
        if not person_track:
            return self._default_body_metrics()
        
        # Coletar dimensões dos bounding boxes
        heights = [track.get('height', 100) for track in person_track if 'height' in track]
        widths = [track.get('width', 50) for track in person_track if 'width' in track]
        
        # Estatísticas
        height_estimate = np.median(heights) if heights else 100
        width_estimate = np.median(widths) if widths else 50
        body_ratio = height_estimate / width_estimate if width_estimate > 0 else 2.0
        
        # Estimativas adicionais (baseadas em proporções típicas)
        shoulder_width = width_estimate * 0.8
        head_body_ratio = 0.125  # cabeça ≈ 1/8 do corpo
        posture_angle = 0.0  # seria calculado com pose estimation
        
        return BodyMetrics(
            height_estimate=height_estimate,
            width_estimate=width_estimate,
            body_ratio=body_ratio,
            shoulder_width=shoulder_width,
            head_body_ratio=head_body_ratio,
            posture_angle=posture_angle
        )
    
    def _analyze_movement_behavior(self, person_track: List[Dict]) -> MovementBehavior:
        """Analisa padrões de movimento"""
        if len(person_track) < 2:
            return self._default_movement_behavior()
        
        # Extrair posições e calcular velocidades
        positions = [(track['center'][0], track['center'][1]) for track in person_track if 'center' in track]
        
        velocities = []
        direction_changes = 0
        stopping_count = 0
        
        for i in range(1, len(positions)):
            dx = positions[i][0] - positions[i-1][0]
            dy = positions[i][1] - positions[i-1][1]
            velocity = np.sqrt(dx*dx + dy*dy)
            velocities.append(velocity)
            
            # Contar paradas (velocidade muito baixa)
            if velocity < 2.0:
                stopping_count += 1
            
            # Contar mudanças de direção
            if i > 1:
                prev_dx = positions[i-1][0] - positions[i-2][0]
                prev_dy = positions[i-1][1] - positions[i-2][1]
                
                if abs(dx) > 0 and abs(prev_dx) > 0:
                    angle_change = abs(np.arctan2(dy, dx) - np.arctan2(prev_dy, prev_dx))
                    if angle_change > 0.5:  # mudança significativa
                        direction_changes += 1
        
        # Calcular métricas
        avg_speed = np.mean(velocities) if velocities else 0
        max_speed = np.max(velocities) if velocities else 0
        stopping_frequency = stopping_count / len(person_track) if person_track else 0
        
        # Calcular suavidade do caminho
        path_smoothness = 1.0 / (1.0 + direction_changes / max(1, len(positions))) if positions else 0.5
        
        # Padrão de aceleração (simplificado)
        acceleration_pattern = []
        if len(velocities) > 1:
            for i in range(1, len(velocities)):
                accel = velocities[i] - velocities[i-1]
                acceleration_pattern.append(accel)
        
        return MovementBehavior(
            avg_speed=avg_speed,
            max_speed=max_speed,
            acceleration_pattern=acceleration_pattern[:10],  # últimas 10
            direction_changes=direction_changes,
            stopping_frequency=stopping_frequency,
            path_smoothness=path_smoothness,
            preferred_routes=[]  # seria analisado com múltiplas visitas
        )
    
    def _analyze_shopping_behavior(self, person_track: List[Dict]) -> ShoppingBehavior:
        """Analisa comportamento de compras"""
        # Classificar estilo de navegação baseado em movimento
        avg_stops = sum(1 for track in person_track if track.get('velocity', 5) < 2) / max(1, len(person_track))
        
        if avg_stops > 0.3:
            browsing_style = 'methodical'  # para muito
        elif avg_stops < 0.1:
            browsing_style = 'quick'       # passa rápido
        else:
            browsing_style = 'wandering'   # meio termo
        
        # Analisar zonas de interesse
        zones = [track.get('zone', 'unknown') for track in person_track if 'zone' in track]
        interest_zones = list(set(zones))
        
        # Estilo de interação (simplificado)
        interaction_style = 'observer'  # seria detectado com pose estimation
        
        # Tempo de decisão (tempo em cada zona)
        zone_times = {}
        for zone in interest_zones:
            zone_count = zones.count(zone)
            zone_times[zone] = zone_count / max(1, len(person_track))
        
        decision_time = np.mean(list(zone_times.values())) * 10 if zone_times else 5.0
        
        return ShoppingBehavior(
            browsing_style=browsing_style,
            interest_zones=interest_zones,
            interaction_style=interaction_style,
            decision_time=decision_time,
            product_comparison=len(interest_zones) > 2,
            price_sensitivity=0.5  # seria inferido com análise de zona
        )
    
    def _analyze_temporal_behavior(self, person_track: List[Dict]) -> TemporalBehavior:
        """Analisa padrões temporais"""
        # Duração da visita atual
        visit_duration = len(person_track) * (1/25)  # assumindo 25fps
        
        current_time = datetime.now()
        
        return TemporalBehavior(
            visit_duration_avg=visit_duration,
            visit_frequency=0.0,  # seria calculado com histórico
            preferred_times=[current_time.hour],
            day_of_week_pattern=[current_time.weekday()],
            seasonal_pattern={'current': 1.0}
        )
    
    def match_returning_customer(self, current_signature: BehaviorSignature) -> Dict[str, Any]:
        """
        Identifica se é cliente que já veio antes
        
        Args:
            current_signature: Assinatura atual
            
        Returns:
            Dict com informações sobre match
        """
        if not self.behavior_signatures:
            # Primeiro cliente, salvar assinatura
            customer_id = self._generate_customer_id()
            self.behavior_signatures[customer_id] = current_signature
            return {
                'is_returning': False,
                'customer_id': customer_id,
                'confidence': 1.0
            }
        
        # Comparar com assinaturas existentes
        best_match = None
        best_score = 0
        
        current_vector = current_signature.to_vector()
        
        for customer_id, prev_signature in self.behavior_signatures.items():
            try:
                prev_vector = prev_signature.to_vector()
                
                # Garantir que os vetores tenham o mesmo tamanho
                min_len = min(len(current_vector), len(prev_vector))
                current_vec = current_vector[:min_len]
                prev_vec = prev_vector[:min_len]
                
                # Calcular similaridade
                similarity = self._calculate_similarity(current_vec, prev_vec)
                
                if similarity > best_score and similarity > self.similarity_threshold:
                    best_match = customer_id
                    best_score = similarity
                    
            except Exception as e:
                logger.error(f"Erro ao comparar assinaturas: {e}")
                continue
        
        if best_match:
            # Cliente retornando - atualizar assinatura
            self._update_signature(best_match, current_signature)
            
            return {
                'is_returning': True,
                'customer_id': best_match,
                'confidence': best_score,
                'previous_visits': self.behavior_signatures[best_match].visit_count - 1
            }
        else:
            # Novo cliente
            customer_id = self._generate_customer_id()
            self.behavior_signatures[customer_id] = current_signature
            
            return {
                'is_returning': False,
                'customer_id': customer_id,
                'confidence': 1.0
            }
    
    def _calculate_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calcula similaridade entre duas assinaturas"""
        try:
            # Normalizar vetores
            vec1_norm = vec1 / (np.linalg.norm(vec1) + 1e-8)
            vec2_norm = vec2 / (np.linalg.norm(vec2) + 1e-8)
            
            # Similaridade coseno
            similarity = np.dot(vec1_norm, vec2_norm)
            
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Erro ao calcular similaridade: {e}")
            return 0.0
    
    def _update_signature(self, customer_id: str, new_signature: BehaviorSignature):
        """Atualiza assinatura existente com nova observação"""
        prev_signature = self.behavior_signatures[customer_id]
        
        # Média ponderada das características
        weight = 0.7  # peso da assinatura existente
        new_weight = 1.0 - weight
        
        try:
            # Atualizar métricas corporais (média)
            prev_signature.body_metrics.height_estimate = (
                weight * prev_signature.body_metrics.height_estimate +
                new_weight * new_signature.body_metrics.height_estimate
            )
            
            # Atualizar comportamento temporal
            prev_signature.temporal_behavior.visit_frequency = (
                weight * prev_signature.temporal_behavior.visit_frequency + new_weight * 1.0
            )
            
            # Incrementar contador de visitas
            prev_signature.visit_count += 1
            prev_signature.updated_at = datetime.now()
            
            logger.debug(f"Assinatura atualizada para cliente {customer_id} (visita #{prev_signature.visit_count})")
            
        except Exception as e:
            logger.error(f"Erro ao atualizar assinatura: {e}")
    
    def classify_customer_type(self, signature: BehaviorSignature) -> str:
        """Classifica tipo de cliente baseado em comportamento"""
        shopping = signature.shopping_behavior
        movement = signature.movement_behavior
        temporal = signature.temporal_behavior
        
        # Cliente objetivo - compra rápida, poucos locais
        if (shopping.browsing_style == 'quick' and 
            temporal.visit_duration_avg < 300 and
            len(shopping.interest_zones) <= 2):
            return 'objetivo'
        
        # Explorador - visita muito, tempo longo
        elif (len(shopping.interest_zones) > 4 and
              temporal.visit_duration_avg > 600 and
              movement.stopping_frequency > 0.3):
            return 'explorador'
        
        # Econômico - foca em promoções/ofertas
        elif any('promocao' in zone.lower() or 'oferta' in zone.lower() 
               for zone in shopping.interest_zones):
            return 'economico'
        
        # Casual - padrão médio
        else:
            return 'casual'
    
    def get_customer_insights(self, customer_id: str) -> Dict[str, Any]:
        """Obtém insights sobre um cliente específico"""
        if customer_id not in self.behavior_signatures:
            return {'error': 'Cliente não encontrado'}
        
        signature = self.behavior_signatures[customer_id]
        customer_type = self.classify_customer_type(signature)
        
        return {
            'customer_id': customer_id,
            'customer_type': customer_type,
            'visit_count': signature.visit_count,
            'avg_visit_duration': signature.temporal_behavior.visit_duration_avg,
            'favorite_zones': signature.shopping_behavior.interest_zones,
            'shopping_style': signature.shopping_behavior.browsing_style,
            'movement_pattern': {
                'avg_speed': signature.movement_behavior.avg_speed,
                'stopping_frequency': signature.movement_behavior.stopping_frequency
            },
            'first_seen': signature.created_at.isoformat(),
            'last_seen': signature.updated_at.isoformat()
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Estatísticas gerais do sistema"""
        if not self.behavior_signatures:
            return {'total_customers': 0}
        
        # Análise por tipo de cliente
        customer_types = {}
        for signature in self.behavior_signatures.values():
            customer_type = self.classify_customer_type(signature)
            customer_types[customer_type] = customer_types.get(customer_type, 0) + 1
        
        # Clientes frequentes (mais de 1 visita)
        frequent_customers = sum(1 for sig in self.behavior_signatures.values() if sig.visit_count > 1)
        
        return {
            'total_customers': len(self.behavior_signatures),
            'frequent_customers': frequent_customers,
            'customer_types': customer_types,
            'avg_visits_per_customer': sum(sig.visit_count for sig in self.behavior_signatures.values()) / len(self.behavior_signatures),
            'similarity_threshold': self.similarity_threshold
        }
    
    # Métodos auxiliares
    
    def _generate_signature_id(self, gait: GaitPattern, body: BodyMetrics) -> str:
        """Gera ID único baseado em características"""
        unique_string = f"{gait.step_frequency:.2f}_{body.height_estimate:.1f}_{body.body_ratio:.2f}_{datetime.now().timestamp()}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:12]
    
    def _generate_customer_id(self) -> str:
        """Gera ID sequencial para cliente"""
        customer_id = f"customer_{self.next_customer_id:06d}"
        self.next_customer_id += 1
        return customer_id
    
    def _default_body_metrics(self) -> BodyMetrics:
        """Métricas corporais padrão"""
        return BodyMetrics(
            height_estimate=100,
            width_estimate=50,
            body_ratio=2.0,
            shoulder_width=40,
            head_body_ratio=0.125,
            posture_angle=0.0
        )
    
    def _default_movement_behavior(self) -> MovementBehavior:
        """Comportamento de movimento padrão"""
        return MovementBehavior(
            avg_speed=10.0,
            max_speed=20.0,
            acceleration_pattern=[],
            direction_changes=0,
            stopping_frequency=0.2,
            path_smoothness=0.8,
            preferred_routes=[]
        )