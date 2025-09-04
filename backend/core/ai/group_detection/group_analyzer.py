"""
👥 DETECÇÃO DE GRUPOS - Famílias e Acompanhantes
Sistema que detecta e analisa grupos de pessoas (famílias, casais, amigos)
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
import json
from loguru import logger
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import euclidean_distances
import cv2

class GroupType(Enum):
    FAMILIA = "familia"
    CASAL = "casal"
    AMIGOS = "amigos"
    COLEGAS = "colegas"
    DESCONHECIDOS = "desconhecidos"
    MISTO = "misto"

class AgeGroup(Enum):
    CRIANCA = "crianca"      # 0-12
    ADOLESCENTE = "adolescente"  # 13-17
    JOVEM = "jovem"          # 18-30
    ADULTO = "adulto"        # 31-60
    IDOSO = "idoso"          # 60+

@dataclass
class Person:
    """Representa uma pessoa individual"""
    person_id: str
    position: Tuple[float, float]  # x, y
    timestamp: datetime
    age_group: AgeGroup
    height_estimate: float
    width_estimate: float
    carrying_bag: bool = False
    holding_child_hand: bool = False
    confidence: float = 1.0
    
    # Características comportamentais
    speed: float = 0.0
    direction: float = 0.0  # ângulo em radianos
    following_someone: bool = False
    leading_group: bool = False
    
    # Interações
    looking_at: Optional[str] = None  # ID de outra pessoa
    talking_to: Optional[str] = None
    
    def distance_to(self, other: 'Person') -> float:
        """Calcula distância até outra pessoa"""
        dx = self.position[0] - other.position[0]
        dy = self.position[1] - other.position[1]
        return np.sqrt(dx*dx + dy*dy)

@dataclass
class GroupMember:
    """Membro de um grupo"""
    person_id: str
    role: str  # 'leader', 'follower', 'child', 'adult', 'elder'
    relationship_probability: Dict[str, float] = field(default_factory=dict)
    join_time: datetime = field(default_factory=datetime.now)
    interactions: List[str] = field(default_factory=list)

@dataclass 
class Group:
    """Representa um grupo de pessoas"""
    group_id: str
    members: List[GroupMember]
    group_type: GroupType
    formation_time: datetime
    dissolution_time: Optional[datetime] = None
    
    # Características do grupo
    size: int = 0
    leader_id: Optional[str] = None
    cohesion_score: float = 0.0  # quão unidos estão (0-1)
    stability_score: float = 0.0  # quão estável é o grupo
    
    # Dinâmica do grupo
    splits: List[Dict[str, Any]] = field(default_factory=list)
    merges: List[Dict[str, Any]] = field(default_factory=list)
    position_history: List[Tuple[datetime, Dict[str, Tuple[float, float]]]] = field(default_factory=list)
    
    # Análise comportamental
    shopping_pattern: str = "unknown"  # 'collaborative', 'independent', 'leader_driven'
    decision_making: str = "unknown"   # 'democratic', 'hierarchical', 'chaotic'
    movement_pattern: str = "unknown"  # 'tight', 'loose', 'following'
    
    def add_member(self, person_id: str, role: str = "member"):
        """Adiciona membro ao grupo"""
        member = GroupMember(person_id=person_id, role=role)
        self.members.append(member)
        self.size = len(self.members)
    
    def remove_member(self, person_id: str) -> bool:
        """Remove membro do grupo"""
        self.members = [m for m in self.members if m.person_id != person_id]
        self.size = len(self.members)
        return True
    
    def get_member_ids(self) -> Set[str]:
        """Retorna IDs de todos os membros"""
        return {m.person_id for m in self.members}
    
    def update_position_history(self, positions: Dict[str, Tuple[float, float]]):
        """Atualiza histórico de posições"""
        self.position_history.append((datetime.now(), positions.copy()))
        
        # Manter apenas últimas 50 posições
        if len(self.position_history) > 50:
            self.position_history = self.position_history[-50:]

class GroupDetector:
    """
    Detecta e analisa grupos de pessoas
    """
    
    def __init__(self, proximity_threshold: float = 1.5, min_group_size: int = 2):
        self.proximity_threshold = proximity_threshold  # metros (em coordenadas da imagem)
        self.min_group_size = min_group_size
        self.groups: Dict[str, Group] = {}
        self.next_group_id = 1
        
        # Configurações de clustering
        self.dbscan = DBSCAN(eps=proximity_threshold, min_samples=min_group_size)
        
        # Thresholds para análise
        self.age_height_mapping = {
            AgeGroup.CRIANCA: (60, 90),      # pixels
            AgeGroup.ADOLESCENTE: (90, 130),
            AgeGroup.JOVEM: (130, 160),
            AgeGroup.ADULTO: (140, 180),
            AgeGroup.IDOSO: (130, 170)
        }
        
        logger.info("Group Detector inicializado")
    
    async def detect_groups(self, people_in_frame: List[Person]) -> List[Group]:
        """
        Detecta grupos de pessoas próximas
        
        Args:
            people_in_frame: Lista de pessoas detectadas
            
        Returns:
            Lista de grupos identificados
        """
        if len(people_in_frame) < self.min_group_size:
            return []
        
        # Extrair posições para clustering
        positions = np.array([list(person.position) for person in people_in_frame])
        person_ids = [person.person_id for person in people_in_frame]
        
        # Aplicar clustering DBSCAN
        cluster_labels = self.dbscan.fit_predict(positions)
        
        detected_groups = []
        
        # Processar cada cluster
        for cluster_id in set(cluster_labels):
            if cluster_id == -1:  # Pessoas sozinhas (ruído no DBSCAN)
                continue
            
            # Obter membros do cluster
            cluster_indices = np.where(cluster_labels == cluster_id)[0]
            cluster_people = [people_in_frame[i] for i in cluster_indices]
            
            if len(cluster_people) >= self.min_group_size:
                # Criar ou atualizar grupo
                group = await self._create_or_update_group(cluster_people)
                if group:
                    detected_groups.append(group)
        
        # Atualizar grupos existentes
        self._update_existing_groups(detected_groups)
        
        return detected_groups
    
    async def _create_or_update_group(self, people: List[Person]) -> Optional[Group]:
        """Cria novo grupo ou atualiza existente"""
        person_ids = {person.person_id for person in people}
        
        # Verificar se é grupo existente
        existing_group = self._find_existing_group(person_ids)
        
        if existing_group:
            # Atualizar grupo existente
            await self._update_group(existing_group, people)
            return existing_group
        else:
            # Criar novo grupo
            return await self._create_new_group(people)
    
    def _find_existing_group(self, person_ids: Set[str]) -> Optional[Group]:
        """Encontra grupo existente com sobreposição de membros"""
        for group in self.groups.values():
            if group.dissolution_time:  # Grupo já dissolvido
                continue
                
            existing_ids = group.get_member_ids()
            
            # Se há 70%+ de sobreposição, considerar mesmo grupo
            overlap = len(person_ids.intersection(existing_ids))
            union = len(person_ids.union(existing_ids))
            
            if union > 0 and (overlap / union) >= 0.7:
                return group
        
        return None
    
    async def _create_new_group(self, people: List[Person]) -> Group:
        """Cria novo grupo"""
        group_id = f"group_{self.next_group_id:04d}"
        self.next_group_id += 1
        
        # Analisar composição do grupo
        group_analysis = await self.analyze_group(people)
        
        # Criar grupo
        group = Group(
            group_id=group_id,
            members=[],
            group_type=group_analysis['type'],
            formation_time=datetime.now(),
            size=len(people)
        )
        
        # Adicionar membros
        for person in people:
            role = group_analysis['roles'].get(person.person_id, 'member')
            group.add_member(person.person_id, role)
        
        # Identificar líder
        group.leader_id = group_analysis.get('leader_id')
        
        # Calcular métricas iniciais
        group.cohesion_score = await self._calculate_cohesion(people)
        group.stability_score = 1.0  # Novo grupo é estável
        
        # Armazenar
        self.groups[group_id] = group
        
        logger.info(f"Novo grupo criado: {group_id} ({group.group_type.value}, {group.size} pessoas)")
        
        return group
    
    async def _update_group(self, group: Group, current_people: List[Person]):
        """Atualiza grupo existente"""
        current_ids = {person.person_id for person in current_people}
        existing_ids = group.get_member_ids()
        
        # Detectar mudanças
        new_members = current_ids - existing_ids
        left_members = existing_ids - current_ids
        
        # Adicionar novos membros
        for person_id in new_members:
            group.add_member(person_id, "member")
            logger.debug(f"Pessoa {person_id} juntou-se ao grupo {group.group_id}")
        
        # Remover membros que saíram
        for person_id in left_members:
            group.remove_member(person_id)
            logger.debug(f"Pessoa {person_id} deixou o grupo {group.group_id}")
        
        # Registrar splits/merges se significativos
        if len(left_members) > 0:
            group.splits.append({
                'time': datetime.now(),
                'members_left': list(left_members),
                'reason': 'detection_gap'
            })
        
        if len(new_members) > 0:
            group.merges.append({
                'time': datetime.now(),
                'members_joined': list(new_members),
                'reason': 'proximity'
            })
        
        # Atualizar métricas
        group.cohesion_score = await self._calculate_cohesion(current_people)
        group.stability_score = await self._calculate_stability(group)
        
        # Atualizar posições
        positions = {person.person_id: person.position for person in current_people}
        group.update_position_history(positions)
    
    async def analyze_group(self, members: List[Person]) -> Dict[str, Any]:
        """
        Analisa composição e dinâmica do grupo
        
        Args:
            members: Lista de membros do grupo
            
        Returns:
            Análise completa do grupo
        """
        analysis = {
            'size': len(members),
            'type': await self.classify_group_type(members),
            'leader_id': await self.identify_leader(members),
            'composition': await self.analyze_composition(members),
            'roles': await self._assign_roles(members),
            'behavior': await self.analyze_group_behavior(members)
        }
        
        return analysis
    
    async def classify_group_type(self, members: List[Person]) -> GroupType:
        """Classifica tipo de grupo baseado na composição"""
        if len(members) < 2:
            return GroupType.DESCONHECIDOS
        
        # Estimar idades baseadas na altura
        ages = [self._estimate_age_group(person.height_estimate) for person in members]
        age_counts = {age: ages.count(age) for age in AgeGroup}
        
        # Família (adultos + crianças)
        if (age_counts.get(AgeGroup.CRIANCA, 0) > 0 and 
            age_counts.get(AgeGroup.ADULTO, 0) > 0):
            return GroupType.FAMILIA
        
        # Casal (2 pessoas, idades compatíveis)
        if (len(members) == 2 and
            all(age in [AgeGroup.JOVEM, AgeGroup.ADULTO] for age in ages)):
            return GroupType.CASAL
        
        # Grupo de amigos (idades similares)
        if len(set(ages)) <= 2 and len(members) >= 3:
            return GroupType.AMIGOS
        
        # Colegas (idade adulta/jovem, grupo médio)
        if (all(age in [AgeGroup.JOVEM, AgeGroup.ADULTO] for age in ages) and
            3 <= len(members) <= 6):
            return GroupType.COLEGAS
        
        # Misto
        return GroupType.MISTO
    
    async def identify_leader(self, members: List[Person]) -> Optional[str]:
        """
        Identifica provável líder do grupo
        
        Args:
            members: Membros do grupo
            
        Returns:
            ID da pessoa que é provável líder
        """
        if not members:
            return None
        
        scores = {}
        
        for person in members:
            score = 0
            
            # Posição: pessoas na frente tendem a ser líderes
            avg_y = np.mean([p.position[1] for p in members])
            if person.position[1] < avg_y:  # mais à frente
                score += 30
            
            # Idade: adultos em grupos com crianças
            person_age = self._estimate_age_group(person.height_estimate)
            if person_age in [AgeGroup.ADULTO, AgeGroup.JOVEM]:
                has_children = any(
                    self._estimate_age_group(p.height_estimate) == AgeGroup.CRIANCA 
                    for p in members
                )
                if has_children:
                    score += 40
            
            # Carregar bolsa/pertences
            if person.carrying_bag:
                score += 20
            
            # Velocidade: líderes tendem a definir o ritmo
            if hasattr(person, 'speed') and person.speed > 0:
                avg_speed = np.mean([getattr(p, 'speed', 0) for p in members])
                if abs(person.speed - avg_speed) < 0.1:  # próximo da média
                    score += 15
            
            # Posição central no grupo
            center_x = np.mean([p.position[0] for p in members])
            center_y = np.mean([p.position[1] for p in members])
            distance_to_center = np.sqrt(
                (person.position[0] - center_x)**2 + 
                (person.position[1] - center_y)**2
            )
            if distance_to_center < self.proximity_threshold * 0.5:
                score += 10
            
            scores[person.person_id] = score
        
        # Retornar pessoa com maior score
        if scores:
            leader_id = max(scores, key=scores.get)
            return leader_id if scores[leader_id] > 20 else None
        
        return None
    
    async def analyze_composition(self, members: List[Person]) -> Dict[str, Any]:
        """Analisa composição demográfica do grupo"""
        ages = [self._estimate_age_group(person.height_estimate) for person in members]
        age_counts = {age.value: ages.count(age) for age in AgeGroup}
        
        # Estatísticas de altura (proxy para idade/gênero)
        heights = [person.height_estimate for person in members]
        
        return {
            'size': len(members),
            'age_distribution': age_counts,
            'has_children': age_counts.get('crianca', 0) > 0,
            'has_elderly': age_counts.get('idoso', 0) > 0,
            'avg_height': np.mean(heights) if heights else 0,
            'height_variance': np.var(heights) if len(heights) > 1 else 0,
            'likely_family': (age_counts.get('crianca', 0) > 0 and 
                            age_counts.get('adulto', 0) > 0),
            'homogeneous_age': len([count for count in age_counts.values() if count > 0]) <= 2
        }
    
    async def _assign_roles(self, members: List[Person]) -> Dict[str, str]:
        """Atribui papéis aos membros do grupo"""
        roles = {}
        
        # Identificar líder
        leader_id = await self.identify_leader(members)
        
        for person in members:
            age_group = self._estimate_age_group(person.height_estimate)
            
            if person.person_id == leader_id:
                roles[person.person_id] = 'leader'
            elif age_group == AgeGroup.CRIANCA:
                roles[person.person_id] = 'child'
            elif age_group == AgeGroup.IDOSO:
                roles[person.person_id] = 'elder'
            elif age_group in [AgeGroup.ADULTO, AgeGroup.JOVEM]:
                roles[person.person_id] = 'adult'
            else:
                roles[person.person_id] = 'member'
        
        return roles
    
    async def analyze_group_behavior(self, members: List[Person]) -> Dict[str, Any]:
        """Analisa comportamento coletivo do grupo"""
        if len(members) < 2:
            return {'pattern': 'individual'}
        
        # Analisar coesão espacial
        positions = np.array([list(person.position) for person in members])
        distances = euclidean_distances(positions)
        avg_distance = np.mean(distances[distances > 0])  # excluir diagonal
        max_distance = np.max(distances)
        
        # Padrão de movimento
        if hasattr(members[0], 'speed'):
            speeds = [getattr(person, 'speed', 0) for person in members]
            speed_variance = np.var(speeds) if len(speeds) > 1 else 0
            
            if speed_variance < 0.1:
                movement_pattern = 'synchronized'
            elif max(speeds) - min(speeds) > 2.0:
                movement_pattern = 'dispersed'
            else:
                movement_pattern = 'coordinated'
        else:
            movement_pattern = 'unknown'
        
        # Formação espacial
        if avg_distance < self.proximity_threshold * 0.5:
            formation = 'tight'
        elif avg_distance < self.proximity_threshold:
            formation = 'normal'
        else:
            formation = 'loose'
        
        return {
            'cohesion': 1.0 / (1.0 + avg_distance),  # 0-1
            'spread': max_distance,
            'formation': formation,
            'movement_pattern': movement_pattern,
            'avg_internal_distance': avg_distance,
            'size_consistency': len(members) >= self.min_group_size
        }
    
    async def track_group_dynamics(self, group_id: str) -> Optional[Dict[str, Any]]:
        """Acompanha mudanças dinâmicas no grupo"""
        if group_id not in self.groups:
            return None
        
        group = self.groups[group_id]
        
        # Analisar histórico de posições
        if len(group.position_history) < 2:
            return None
        
        recent_positions = group.position_history[-10:]  # Últimas 10 observações
        
        # Calcular estabilidade temporal
        stability_scores = []
        for i in range(1, len(recent_positions)):
            prev_positions = recent_positions[i-1][1]
            curr_positions = recent_positions[i][1]
            
            # Calcular mudança nas posições relativas
            common_members = set(prev_positions.keys()).intersection(set(curr_positions.keys()))
            if len(common_members) >= 2:
                position_changes = []
                for member_id in common_members:
                    prev_pos = prev_positions[member_id]
                    curr_pos = curr_positions[member_id]
                    change = np.sqrt((curr_pos[0] - prev_pos[0])**2 + (curr_pos[1] - prev_pos[1])**2)
                    position_changes.append(change)
                
                stability_scores.append(1.0 / (1.0 + np.mean(position_changes)))
        
        avg_stability = np.mean(stability_scores) if stability_scores else 0.5
        
        return {
            'group_id': group_id,
            'stability': avg_stability,
            'duration': (datetime.now() - group.formation_time).total_seconds(),
            'splits_count': len(group.splits),
            'merges_count': len(group.merges),
            'current_cohesion': group.cohesion_score,
            'member_count_history': [len(pos[1]) for pos in recent_positions]
        }
    
    async def _calculate_cohesion(self, people: List[Person]) -> float:
        """Calcula score de coesão do grupo"""
        if len(people) < 2:
            return 1.0
        
        positions = np.array([list(person.position) for person in people])
        distances = euclidean_distances(positions)
        
        # Distância média entre membros
        avg_distance = np.mean(distances[distances > 0])
        
        # Converter para score de coesão (0-1)
        cohesion = 1.0 / (1.0 + avg_distance / self.proximity_threshold)
        
        return min(1.0, max(0.0, cohesion))
    
    async def _calculate_stability(self, group: Group) -> float:
        """Calcula estabilidade do grupo baseada no histórico"""
        if len(group.position_history) < 5:
            return 1.0  # Grupo novo é considerado estável
        
        # Analisar mudanças de tamanho
        recent_sizes = [len(pos[1]) for pos in group.position_history[-10:]]
        size_variance = np.var(recent_sizes) if len(recent_sizes) > 1 else 0
        
        # Penalizar muitas mudanças
        splits_penalty = len(group.splits) * 0.1
        merges_bonus = len(group.merges) * 0.05  # Merges podem ser positivos
        
        # Score base
        stability = 1.0 - size_variance * 0.1 - splits_penalty + merges_bonus
        
        return min(1.0, max(0.0, stability))
    
    def _estimate_age_group(self, height: float) -> AgeGroup:
        """Estima grupo etário baseado na altura"""
        for age_group, (min_height, max_height) in self.age_height_mapping.items():
            if min_height <= height <= max_height:
                return age_group
        
        # Se não se encaixa em nenhum, usar altura para decidir
        if height < 90:
            return AgeGroup.CRIANCA
        elif height > 160:
            return AgeGroup.ADULTO
        else:
            return AgeGroup.JOVEM
    
    async def _update_existing_groups(self, detected_groups: List[Group]):
        """Atualiza lista de grupos, removendo grupos dissolvidos"""
        current_time = datetime.now()
        
        # Marcar grupos que não foram detectados como dissolvidos
        active_group_ids = {group.group_id for group in detected_groups}
        
        for group_id, group in self.groups.items():
            if (group_id not in active_group_ids and 
                group.dissolution_time is None):
                
                # Marcar como dissolvido se não foi visto por um tempo
                time_since_formation = (current_time - group.formation_time).total_seconds()
                if time_since_formation > 30:  # 30 segundos sem detecção
                    group.dissolution_time = current_time
                    logger.debug(f"Grupo {group_id} marcado como dissolvido")
    
    def get_active_groups(self) -> List[Group]:
        """Retorna grupos atualmente ativos"""
        return [
            group for group in self.groups.values()
            if group.dissolution_time is None
        ]
    
    def get_group_statistics(self) -> Dict[str, Any]:
        """Estatísticas gerais dos grupos"""
        active_groups = self.get_active_groups()
        all_groups = list(self.groups.values())
        
        if not all_groups:
            return {'total_groups': 0, 'active_groups': 0}
        
        # Análise por tipo
        type_counts = {}
        for group in all_groups:
            group_type = group.group_type.value
            type_counts[group_type] = type_counts.get(group_type, 0) + 1
        
        # Tamanhos de grupo
        sizes = [group.size for group in active_groups]
        
        return {
            'total_groups_detected': len(all_groups),
            'active_groups': len(active_groups),
            'group_types': type_counts,
            'avg_group_size': np.mean(sizes) if sizes else 0,
            'max_group_size': max(sizes) if sizes else 0,
            'avg_duration': np.mean([
                (group.dissolution_time or datetime.now() - group.formation_time).total_seconds()
                for group in all_groups
            ]) if all_groups else 0
        }
    
    def cleanup_old_groups(self, max_age_hours: int = 24):
        """Remove grupos antigos da memória"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        to_remove = []
        for group_id, group in self.groups.items():
            dissolution_time = group.dissolution_time or datetime.now()
            if dissolution_time < cutoff_time:
                to_remove.append(group_id)
        
        for group_id in to_remove:
            del self.groups[group_id]
        
        if to_remove:
            logger.info(f"Removidos {len(to_remove)} grupos antigos")
        
        return len(to_remove)