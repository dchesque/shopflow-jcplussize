"""
Behavior Analyzer - Sistema de análise comportamental do ShopFlow
Analisa padrões de movimento, tempo de permanência e comportamentos
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import deque, defaultdict
import json
import math
from loguru import logger
from scipy import ndimage
from scipy.spatial.distance import euclidean
from sklearn.cluster import DBSCAN
import pandas as pd

from ..config import get_settings
from ..database import DatabaseManager

settings = get_settings()

@dataclass
class PersonTrack:
    """Dados de rastreamento de uma pessoa"""
    person_id: int
    positions: deque  # Últimas posições (x, y, timestamp)
    first_seen: datetime
    last_seen: datetime
    person_type: str  # 'customer', 'employee', 'unknown'
    identity_id: Optional[str]  # ID específico se reconhecido
    
    # Métricas comportamentais
    total_distance: float = 0.0
    avg_speed: float = 0.0
    max_speed: float = 0.0
    dwell_time: float = 0.0  # minutos
    stops_count: int = 0
    zones_visited: List[str] = None
    trajectory_complexity: float = 0.0
    
    def __post_init__(self):
        if self.zones_visited is None:
            self.zones_visited = []

@dataclass
class ZoneInfo:
    """Informações de uma zona da loja"""
    name: str
    polygon: List[Tuple[int, int]]
    zone_type: str  # 'entrance', 'product', 'checkout', 'service'
    visit_count: int = 0
    avg_dwell_time: float = 0.0
    conversion_rate: float = 0.0

class BehaviorAnalyzer:
    """
    Analisador de comportamento principal
    """
    
    def __init__(self):
        self.db = None
        
        # Tracking de pessoas
        self.person_tracks: Dict[int, PersonTrack] = {}
        self.max_track_history = 100  # Máximo de posições por pessoa
        
        # Configurações
        self.movement_threshold = 20  # pixels para considerar movimento
        self.stop_threshold = 5  # segundos parado para considerar "stop"
        self.speed_threshold_fast = 150  # pixels/s para movimento rápido
        self.dwell_time_threshold = 30  # segundos para considerar "dwelling"
        
        # Zonas da loja (configuráveis)
        self.zones: Dict[str, ZoneInfo] = {}
        self.frame_width = 640
        self.frame_height = 480
        
        # Heatmap de movimento
        self.heatmap = None
        self.heatmap_alpha = 0.1
        
        # Estatísticas em tempo real
        self.current_stats = {
            'total_people': 0,
            'avg_dwell_time': 0.0,
            'movement_intensity': 0.0,
            'crowd_density': 0.0,
            'flow_pattern': 'normal'
        }
        
        # Cache de análises
        self.behavior_cache = {}
        
        logger.info("🔍 Behavior Analyzer inicializado")
    
    async def initialize(self):
        """Inicializar o analisador"""
        try:
            # Initialize database connection
            self.db = DatabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            await self.db.initialize()
            await self._load_store_zones()
            self._initialize_heatmap()
            logger.success("✅ Behavior Analyzer pronto")
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Behavior Analyzer: {e}")
            raise
    
    async def _load_store_zones(self):
        """Carregar zonas da loja do banco de dados"""
        try:
            # Por enquanto, criar zonas padrão
            # TODO: Implementar interface para definir zonas customizadas
            
            self.zones = {
                'entrance': ZoneInfo(
                    name='Entrada',
                    polygon=[(0, 0), (200, 0), (200, 100), (0, 100)],
                    zone_type='entrance'
                ),
                'center': ZoneInfo(
                    name='Centro da Loja',
                    polygon=[(200, 100), (440, 100), (440, 300), (200, 300)],
                    zone_type='product'
                ),
                'checkout': ZoneInfo(
                    name='Caixas',
                    polygon=[(440, 300), (640, 300), (640, 480), (440, 480)],
                    zone_type='checkout'
                ),
                'service': ZoneInfo(
                    name='Atendimento',
                    polygon=[(0, 300), (200, 300), (200, 480), (0, 480)],
                    zone_type='service'
                )
            }
            
            logger.info(f"✅ Carregadas {len(self.zones)} zonas da loja")
            
        except Exception as e:
            logger.error(f"Erro ao carregar zonas: {e}")
    
    def _initialize_heatmap(self):
        """Inicializar heatmap de movimento"""
        self.heatmap = np.zeros((self.frame_height, self.frame_width), dtype=np.float32)
    
    async def analyze(
        self,
        detections: List[Dict],
        person_types: Dict[int, Any],
        timestamp: datetime
    ) -> Dict[str, Any]:
        """
        Analisar comportamentos a partir das detecções
        
        Args:
            detections: Lista de detecções do YOLO
            person_types: Mapeamento ID -> tipo de pessoa
            timestamp: Timestamp atual
            
        Returns:
            Dicionário com análises comportamentais
        """
        try:
            # Atualizar tracks das pessoas
            await self._update_person_tracks(detections, person_types, timestamp)
            
            # Analisar movimento individual
            movement_analysis = await self._analyze_movement_patterns()
            
            # Analisar zonas visitadas
            zone_analysis = await self._analyze_zone_interactions()
            
            # Detectar grupos e interações
            group_analysis = await self._analyze_group_behavior(detections)
            
            # Calcular densidade da multidão
            crowd_analysis = await self._analyze_crowd_density(detections)
            
            # Analisar fluxo geral
            flow_analysis = await self._analyze_flow_patterns()
            
            # Atualizar heatmap
            self._update_heatmap(detections)
            
            # Compilar resultados
            behavior_data = {
                'timestamp': timestamp.isoformat(),
                'movement_patterns': movement_analysis,
                'zone_interactions': zone_analysis,
                'group_behavior': group_analysis,
                'crowd_density': crowd_analysis['density'],
                'flow_pattern': flow_analysis['pattern'],
                'total_tracks': len(self.person_tracks),
                
                # Métricas agregadas
                'avg_dwell_time': movement_analysis.get('avg_dwell_time', 0),
                'max_dwell_time': movement_analysis.get('max_dwell_time', 0),
                'movement_intensity': movement_analysis.get('intensity', 0),
                'erratic_movement_score': movement_analysis.get('erratic_score', 0),
                'hot_zones': zone_analysis.get('hot_zones', []),
                'group_rate': group_analysis.get('group_shopping_rate', 0),
                'current_count': len(detections),
                'current_staff': sum(1 for t in person_types.values() if str(t).endswith('EMPLOYEE'))
            }
            
            # Salvar no cache e banco
            await self._save_behavior_data(behavior_data)
            
            # Atualizar estatísticas em tempo real
            self._update_current_stats(behavior_data)
            
            return behavior_data
            
        except Exception as e:
            logger.error(f"Erro na análise comportamental: {e}")
            return {}
    
    async def _update_person_tracks(
        self,
        detections: List[Dict],
        person_types: Dict[int, Any],
        timestamp: datetime
    ):
        """Atualizar rastreamento de pessoas"""
        try:
            current_ids = set()
            
            for detection in detections:
                person_id = detection['id']
                bbox = detection['bbox']
                current_ids.add(person_id)
                
                # Calcular centro da bounding box
                x1, y1, x2, y2 = bbox
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                
                person_type = str(person_types.get(person_id, 'unknown')).split('.')[-1].lower()
                
                if person_id not in self.person_tracks:
                    # Nova pessoa
                    self.person_tracks[person_id] = PersonTrack(
                        person_id=person_id,
                        positions=deque(maxlen=self.max_track_history),
                        first_seen=timestamp,
                        last_seen=timestamp,
                        person_type=person_type,
                        identity_id=None,
                        zones_visited=[]
                    )
                
                # Atualizar track
                track = self.person_tracks[person_id]
                track.last_seen = timestamp
                track.positions.append((center_x, center_y, timestamp))
                
                # Calcular métricas de movimento
                await self._calculate_movement_metrics(track)
                
                # Verificar zonas visitadas
                await self._check_zone_visits(track, center_x, center_y)
            
            # Remover tracks inativos (não vistos há mais de 30 segundos)
            inactive_threshold = timestamp - timedelta(seconds=30)
            to_remove = []
            
            for person_id, track in self.person_tracks.items():
                if track.last_seen < inactive_threshold:
                    to_remove.append(person_id)
            
            for person_id in to_remove:
                await self._finalize_person_track(self.person_tracks[person_id])
                del self.person_tracks[person_id]
                
        except Exception as e:
            logger.error(f"Erro ao atualizar tracks: {e}")
    
    async def _calculate_movement_metrics(self, track: PersonTrack):
        """Calcular métricas de movimento para uma pessoa"""
        try:
            if len(track.positions) < 2:
                return
            
            positions = list(track.positions)
            total_distance = 0
            speeds = []
            
            for i in range(1, len(positions)):
                prev_x, prev_y, prev_time = positions[i-1]
                curr_x, curr_y, curr_time = positions[i]
                
                # Distância euclidiana
                distance = euclidean((prev_x, prev_y), (curr_x, curr_y))
                total_distance += distance
                
                # Velocidade (pixels por segundo)
                time_diff = (curr_time - prev_time).total_seconds()
                if time_diff > 0:
                    speed = distance / time_diff
                    speeds.append(speed)
            
            track.total_distance = total_distance
            
            if speeds:
                track.avg_speed = np.mean(speeds)
                track.max_speed = max(speeds)
            
            # Tempo de permanência (dwell time)
            time_diff = (track.last_seen - track.first_seen).total_seconds() / 60  # minutos
            track.dwell_time = time_diff
            
            # Complexidade da trajetória (sinuosidade)
            if len(positions) >= 3:
                track.trajectory_complexity = self._calculate_trajectory_complexity(positions)
            
            # Contar paradas (baixa velocidade por período prolongado)
            track.stops_count = self._count_stops(positions)
            
        except Exception as e:
            logger.error(f"Erro ao calcular métricas de movimento: {e}")
    
    def _calculate_trajectory_complexity(self, positions: List[Tuple]) -> float:
        """Calcular complexidade da trajetória (0 = linha reta, 1 = muito complexa)"""
        try:
            if len(positions) < 3:
                return 0.0
            
            # Distância total percorrida vs distância direta
            total_distance = 0
            for i in range(1, len(positions)):
                prev_x, prev_y, _ = positions[i-1]
                curr_x, curr_y, _ = positions[i]
                total_distance += euclidean((prev_x, prev_y), (curr_x, curr_y))
            
            # Distância direta (primeiro ao último ponto)
            first_x, first_y, _ = positions[0]
            last_x, last_y, _ = positions[-1]
            direct_distance = euclidean((first_x, first_y), (last_x, last_y))
            
            if direct_distance == 0:
                return 1.0  # Pessoa não se moveu
            
            complexity = (total_distance - direct_distance) / total_distance
            return min(complexity, 1.0)
            
        except Exception as e:
            logger.error(f"Erro ao calcular complexidade: {e}")
            return 0.0
    
    def _count_stops(self, positions: List[Tuple]) -> int:
        """Contar número de paradas significativas"""
        try:
            stops = 0
            consecutive_low_speed = 0
            
            for i in range(1, len(positions)):
                prev_x, prev_y, prev_time = positions[i-1]
                curr_x, curr_y, curr_time = positions[i]
                
                distance = euclidean((prev_x, prev_y), (curr_x, curr_y))
                time_diff = (curr_time - prev_time).total_seconds()
                
                if time_diff > 0:
                    speed = distance / time_diff
                    
                    if speed < self.movement_threshold:  # Movimento muito lento
                        consecutive_low_speed += 1
                    else:
                        if consecutive_low_speed >= self.stop_threshold:
                            stops += 1
                        consecutive_low_speed = 0
            
            return stops
            
        except Exception as e:
            logger.error(f"Erro ao contar paradas: {e}")
            return 0
    
    async def _check_zone_visits(self, track: PersonTrack, x: float, y: float):
        """Verificar se pessoa está em alguma zona específica"""
        try:
            for zone_id, zone_info in self.zones.items():
                if self._point_in_polygon(x, y, zone_info.polygon):
                    if zone_id not in track.zones_visited:
                        track.zones_visited.append(zone_id)
                        zone_info.visit_count += 1
                        logger.debug(f"Pessoa {track.person_id} entrou na zona {zone_id}")
                        
        except Exception as e:
            logger.error(f"Erro ao verificar zonas: {e}")
    
    def _point_in_polygon(self, x: float, y: float, polygon: List[Tuple[int, int]]) -> bool:
        """Verificar se ponto está dentro do polígono"""
        try:
            n = len(polygon)
            inside = False
            
            p1x, p1y = polygon[0]
            for i in range(1, n + 1):
                p2x, p2y = polygon[i % n]
                if y > min(p1y, p2y):
                    if y <= max(p1y, p2y):
                        if x <= max(p1x, p2x):
                            if p1y != p2y:
                                xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                            if p1x == p2x or x <= xinters:
                                inside = not inside
                p1x, p1y = p2x, p2y
                
            return inside
            
        except Exception as e:
            logger.error(f"Erro no cálculo point-in-polygon: {e}")
            return False
    
    async def _analyze_movement_patterns(self) -> Dict[str, Any]:
        """Analisar padrões de movimento geral"""
        try:
            if not self.person_tracks:
                return {'avg_dwell_time': 0, 'max_dwell_time': 0, 'intensity': 0, 'erratic_score': 0}
            
            dwell_times = []
            speeds = []
            complexities = []
            
            for track in self.person_tracks.values():
                if track.dwell_time > 0:
                    dwell_times.append(track.dwell_time)
                if track.avg_speed > 0:
                    speeds.append(track.avg_speed)
                complexities.append(track.trajectory_complexity)
            
            avg_dwell_time = np.mean(dwell_times) if dwell_times else 0
            max_dwell_time = max(dwell_times) if dwell_times else 0
            avg_speed = np.mean(speeds) if speeds else 0
            avg_complexity = np.mean(complexities) if complexities else 0
            
            # Calcular intensidade de movimento (normalizada)
            movement_intensity = min(avg_speed / 100, 1.0) if avg_speed > 0 else 0
            
            # Score de movimento errático (baseado na complexidade)
            erratic_score = avg_complexity
            
            return {
                'avg_dwell_time': float(avg_dwell_time),
                'max_dwell_time': float(max_dwell_time),
                'avg_speed': float(avg_speed),
                'intensity': float(movement_intensity),
                'erratic_score': float(erratic_score),
                'total_tracks': len(self.person_tracks)
            }
            
        except Exception as e:
            logger.error(f"Erro na análise de movimento: {e}")
            return {}
    
    async def _analyze_zone_interactions(self) -> Dict[str, Any]:
        """Analisar interações com zonas da loja"""
        try:
            zone_stats = {}
            hot_zones = []
            
            for zone_id, zone_info in self.zones.items():
                visits = zone_info.visit_count
                zone_stats[zone_id] = {
                    'name': zone_info.name,
                    'type': zone_info.zone_type,
                    'visits': visits,
                    'avg_dwell_time': zone_info.avg_dwell_time
                }
                
                if visits > 0:
                    hot_zones.append({
                        'zone': zone_id,
                        'name': zone_info.name,
                        'visits': visits,
                        'popularity': min(visits / len(self.person_tracks), 1.0) if self.person_tracks else 0
                    })
            
            # Ordenar zonas por popularidade
            hot_zones.sort(key=lambda x: x['visits'], reverse=True)
            
            return {
                'zone_stats': zone_stats,
                'hot_zones': hot_zones[:5],  # Top 5 zonas mais visitadas
                'total_zones': len(self.zones)
            }
            
        except Exception as e:
            logger.error(f"Erro na análise de zonas: {e}")
            return {}
    
    async def _analyze_group_behavior(self, detections: List[Dict]) -> Dict[str, Any]:
        """Analisar comportamento de grupos"""
        try:
            if len(detections) < 2:
                return {'groups': [], 'group_shopping_rate': 0}
            
            # Extrair posições das pessoas
            positions = []
            for detection in detections:
                bbox = detection['bbox']
                x1, y1, x2, y2 = bbox
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                positions.append([center_x, center_y])
            
            positions = np.array(positions)
            
            # Usar DBSCAN para detectar grupos (proximidade espacial)
            if len(positions) >= 2:
                clustering = DBSCAN(eps=100, min_samples=2).fit(positions)  # eps em pixels
                labels = clustering.labels_
                
                # Analisar grupos encontrados
                groups = []
                unique_labels = set(labels)
                
                for label in unique_labels:
                    if label == -1:  # Ruído/pessoas isoladas
                        continue
                    
                    group_mask = labels == label
                    group_size = np.sum(group_mask)
                    
                    if group_size >= 2:
                        group_positions = positions[group_mask]
                        centroid = np.mean(group_positions, axis=0)
                        
                        groups.append({
                            'group_id': int(label),
                            'size': int(group_size),
                            'centroid': [float(centroid[0]), float(centroid[1])],
                            'spread': float(np.std(group_positions))
                        })
                
                # Taxa de compras em grupo
                people_in_groups = sum(group['size'] for group in groups)
                group_shopping_rate = people_in_groups / len(detections) if detections else 0
                
                return {
                    'groups': groups,
                    'group_count': len(groups),
                    'group_shopping_rate': float(group_shopping_rate),
                    'people_in_groups': people_in_groups,
                    'isolated_people': len(detections) - people_in_groups
                }
            
            return {'groups': [], 'group_shopping_rate': 0}
            
        except Exception as e:
            logger.error(f"Erro na análise de grupos: {e}")
            return {}
    
    async def _analyze_crowd_density(self, detections: List[Dict]) -> Dict[str, Any]:
        """Analisar densidade da multidão"""
        try:
            if not detections:
                return {'density': 0, 'congestion_level': 'low'}
            
            # Calcular área ocupada vs área total
            total_area = self.frame_width * self.frame_height
            occupied_area = 0
            
            for detection in detections:
                bbox = detection['bbox']
                x1, y1, x2, y2 = bbox
                box_area = (x2 - x1) * (y2 - y1)
                occupied_area += box_area
            
            density = min(occupied_area / total_area, 1.0)
            
            # Classificar nível de congestionamento
            if density < 0.1:
                congestion_level = 'low'
            elif density < 0.3:
                congestion_level = 'medium'
            elif density < 0.6:
                congestion_level = 'high'
            else:
                congestion_level = 'critical'
            
            return {
                'density': float(density),
                'congestion_level': congestion_level,
                'people_count': len(detections),
                'occupied_area_ratio': float(density)
            }
            
        except Exception as e:
            logger.error(f"Erro na análise de densidade: {e}")
            return {'density': 0, 'congestion_level': 'low'}
    
    async def _analyze_flow_patterns(self) -> Dict[str, Any]:
        """Analisar padrões de fluxo geral"""
        try:
            if not self.person_tracks:
                return {'pattern': 'normal', 'flow_direction': 'neutral'}
            
            # Analisar direção geral do fluxo
            flow_vectors = []
            
            for track in self.person_tracks.values():
                if len(track.positions) >= 2:
                    first_pos = track.positions[0]
                    last_pos = track.positions[-1]
                    
                    flow_x = last_pos[0] - first_pos[0]
                    flow_y = last_pos[1] - first_pos[1]
                    
                    if abs(flow_x) > 10 or abs(flow_y) > 10:  # Movimento significativo
                        flow_vectors.append((flow_x, flow_y))
            
            if flow_vectors:
                avg_flow_x = np.mean([v[0] for v in flow_vectors])
                avg_flow_y = np.mean([v[1] for v in flow_vectors])
                
                # Determinar direção predominante
                if abs(avg_flow_x) > abs(avg_flow_y):
                    flow_direction = 'right' if avg_flow_x > 0 else 'left'
                else:
                    flow_direction = 'down' if avg_flow_y > 0 else 'up'
            else:
                flow_direction = 'neutral'
            
            # Determinar padrão baseado na hora e características
            current_hour = datetime.now().hour
            
            if 8 <= current_hour <= 10:
                pattern = 'morning_rush'
            elif 12 <= current_hour <= 14:
                pattern = 'lunch_peak'
            elif 17 <= current_hour <= 19:
                pattern = 'evening_rush'
            elif current_hour >= 20:
                pattern = 'evening_calm'
            else:
                pattern = 'normal'
            
            return {
                'pattern': pattern,
                'flow_direction': flow_direction,
                'flow_intensity': len(flow_vectors)
            }
            
        except Exception as e:
            logger.error(f"Erro na análise de fluxo: {e}")
            return {'pattern': 'normal', 'flow_direction': 'neutral'}
    
    def _update_heatmap(self, detections: List[Dict]):
        """Atualizar heatmap de movimento"""
        try:
            # Criar máscara temporária
            temp_heatmap = np.zeros_like(self.heatmap)
            
            for detection in detections:
                bbox = detection['bbox']
                x1, y1, x2, y2 = bbox
                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)
                
                # Adicionar gaussian blur em torno do centro
                if 0 <= center_x < self.frame_width and 0 <= center_y < self.frame_height:
                    # Criar gaussian kernel pequeno
                    kernel_size = 21
                    sigma = 7
                    
                    y_min = max(0, center_y - kernel_size//2)
                    y_max = min(self.frame_height, center_y + kernel_size//2 + 1)
                    x_min = max(0, center_x - kernel_size//2)
                    x_max = min(self.frame_width, center_x + kernel_size//2 + 1)
                    
                    temp_heatmap[y_min:y_max, x_min:x_max] += 1
            
            # Aplicar blur
            if np.sum(temp_heatmap) > 0:
                temp_heatmap = ndimage.gaussian_filter(temp_heatmap, sigma=10)
            
            # Atualizar heatmap principal com decay
            self.heatmap = (1 - self.heatmap_alpha) * self.heatmap + self.heatmap_alpha * temp_heatmap
            
        except Exception as e:
            logger.error(f"Erro ao atualizar heatmap: {e}")
    
    async def _save_behavior_data(self, behavior_data: Dict):
        """Salvar dados comportamentais no banco"""
        try:
            # Salvar no cache local
            timestamp = datetime.fromisoformat(behavior_data['timestamp'].replace('Z', '+00:00'))
            self.behavior_cache[timestamp] = behavior_data
            
            # Limpar cache antigo (manter apenas últimas 100 entradas)
            if len(self.behavior_cache) > 100:
                oldest_key = min(self.behavior_cache.keys())
                del self.behavior_cache[oldest_key]
            
            # Salvar principais métricas no banco
            query = """
            INSERT INTO behavior_analytics 
            (timestamp, dwell_time_minutes, zone_visits, behavior_pattern, metadata)
            VALUES ($1, $2, $3, $4, $5)
            """
            
            await self.db.execute(
                query,
                timestamp,
                behavior_data.get('avg_dwell_time', 0),
                json.dumps(behavior_data.get('zone_interactions', {})),
                behavior_data.get('flow_pattern', 'normal'),
                json.dumps({
                    'crowd_density': behavior_data.get('crowd_density', 0),
                    'group_rate': behavior_data.get('group_rate', 0),
                    'movement_intensity': behavior_data.get('movement_intensity', 0),
                    'total_tracks': behavior_data.get('total_tracks', 0)
                })
            )
            
        except Exception as e:
            logger.error(f"Erro ao salvar dados comportamentais: {e}")
    
    def _update_current_stats(self, behavior_data: Dict):
        """Atualizar estatísticas em tempo real"""
        self.current_stats.update({
            'total_people': behavior_data.get('current_count', 0),
            'avg_dwell_time': behavior_data.get('avg_dwell_time', 0),
            'movement_intensity': behavior_data.get('movement_intensity', 0),
            'crowd_density': behavior_data.get('crowd_density', 0),
            'flow_pattern': behavior_data.get('flow_pattern', 'normal')
        })
    
    async def _finalize_person_track(self, track: PersonTrack):
        """Finalizar track de pessoa quando ela sai de cena"""
        try:
            # Salvar dados finais da pessoa no banco
            query = """
            INSERT INTO behavior_analytics 
            (timestamp, person_id, person_type, dwell_time_minutes, trajectory_data, zone_visits, behavior_pattern, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """
            
            trajectory_data = [
                {'x': pos[0], 'y': pos[1], 'timestamp': pos[2].isoformat()}
                for pos in list(track.positions)
            ]
            
            await self.db.execute(
                query,
                track.last_seen,
                str(track.person_id),
                track.person_type,
                track.dwell_time,
                json.dumps(trajectory_data),
                json.dumps(track.zones_visited),
                'completed',
                json.dumps({
                    'total_distance': track.total_distance,
                    'avg_speed': track.avg_speed,
                    'max_speed': track.max_speed,
                    'stops_count': track.stops_count,
                    'trajectory_complexity': track.trajectory_complexity,
                    'identity_id': track.identity_id
                })
            )
            
            logger.debug(f"✅ Track finalizado: Pessoa {track.person_id} ({track.dwell_time:.1f}min)")
            
        except Exception as e:
            logger.error(f"Erro ao finalizar track: {e}")
    
    async def get_behavior_summary(self) -> Dict[str, Any]:
        """Obter resumo comportamental"""
        return {
            'current_stats': self.current_stats,
            'active_tracks': len(self.person_tracks),
            'zones_configured': len(self.zones),
            'behavior_cache_size': len(self.behavior_cache),
            'heatmap_available': self.heatmap is not None
        }
    
    async def get_heatmap_data(self) -> Optional[np.ndarray]:
        """Obter dados do heatmap atual"""
        if self.heatmap is not None:
            # Normalizar heatmap para visualização
            normalized = (self.heatmap / np.max(self.heatmap) * 255).astype(np.uint8) if np.max(self.heatmap) > 0 else self.heatmap.astype(np.uint8)
            return normalized
        return None
    
    def configure_zones(self, zones_config: Dict[str, Any]):
        """Configurar zonas customizadas da loja"""
        try:
            for zone_id, config in zones_config.items():
                self.zones[zone_id] = ZoneInfo(
                    name=config['name'],
                    polygon=config['polygon'],
                    zone_type=config.get('type', 'product')
                )
            
            logger.info(f"✅ Configuradas {len(zones_config)} zonas customizadas")
            
        except Exception as e:
            logger.error(f"Erro ao configurar zonas: {e}")