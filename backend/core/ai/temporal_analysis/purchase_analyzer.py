"""
⏰ ANÁLISE TEMPORAL - Detecção de Compras
Sistema que analisa jornada temporal para identificar quem realmente comprou
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json
from loguru import logger
import asyncio

class ZoneType(Enum):
    ENTRANCE = "entrance"
    PRODUCTS = "products"
    CASHIER = "cashier"
    EXIT = "exit"
    BATHROOM = "bathroom"
    CAFE = "cafe"
    FITTING_ROOM = "fitting_room"
    OTHER = "other"

@dataclass
class StoreZone:
    """Definição de zona da loja"""
    name: str
    type: ZoneType
    coordinates: Dict[str, float]  # x1, y1, x2, y2 em percentual
    weight: float = 1.0  # Peso para cálculo de probabilidade
    
@dataclass
class PathPoint:
    """Ponto na jornada do cliente"""
    timestamp: datetime
    position: Tuple[float, float]  # x, y em percentual
    zone: str
    observations: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 1.0

@dataclass
class ProductInteraction:
    """Interação com produtos"""
    timestamp: datetime
    product_zone: str
    interaction_type: str  # 'picked_up', 'examined', 'returned'
    duration: float  # segundos
    confidence: float

@dataclass
class CustomerJourney:
    """Jornada completa do cliente"""
    person_id: str
    entry_time: datetime
    exit_time: Optional[datetime] = None
    path: List[PathPoint] = field(default_factory=list)
    zones_visited: set = field(default_factory=set)
    product_interactions: List[ProductInteraction] = field(default_factory=list)
    cashier_time: float = 0.0
    total_time: float = 0.0
    purchase_probability: float = 0.0
    purchase_indicators: Dict[str, Any] = field(default_factory=dict)
    likely_purchased: bool = False
    purchase_score: float = 0.0
    customer_type: Optional[str] = None

class TemporalPurchaseAnalyzer:
    """
    Detecta quem realmente comprou analisando jornada temporal
    """
    
    def __init__(self):
        self.journeys: Dict[str, CustomerJourney] = {}
        self.store_zones = self._initialize_store_zones()
        
        # Indicadores de compra com pesos
        self.purchase_indicators = {
            'min_time_in_store': {'threshold': 60, 'weight': 0.1},  # 1 minuto mínimo
            'visited_cashier': {'threshold': 15, 'weight': 0.5},    # 15s no caixa
            'carried_products': {'weight': 0.3},
            'exit_with_bag': {'weight': 0.4},
            'product_interaction_time': {'threshold': 30, 'weight': 0.2},
            'visited_product_zones': {'threshold': 2, 'weight': 0.15},
            'path_coherence': {'weight': 0.1}  # Caminho lógico de compra
        }
        
        # Configurações
        self.min_journey_time = 30  # segundos
        self.max_journey_time = 3600  # 1 hora
        self.cashier_zone_threshold = 0.05  # 5% da área da loja
        
        logger.info("Purchase Analyzer inicializado")
    
    def _initialize_store_zones(self) -> Dict[str, StoreZone]:
        """Inicializa zonas padrão da loja"""
        return {
            'entrance': StoreZone('Entrada', ZoneType.ENTRANCE, {'x1': 0, 'y1': 0, 'x2': 100, 'y2': 15}, 0.1),
            'products_electronics': StoreZone('Eletrônicos', ZoneType.PRODUCTS, {'x1': 10, 'y1': 20, 'x2': 40, 'y2': 60}, 1.0),
            'products_clothing': StoreZone('Roupas', ZoneType.PRODUCTS, {'x1': 45, 'y1': 20, 'x2': 80, 'y2': 60}, 1.0),
            'products_food': StoreZone('Alimentação', ZoneType.PRODUCTS, {'x1': 85, 'y1': 20, 'x2': 100, 'y2': 70}, 1.0),
            'cashier': StoreZone('Caixa', ZoneType.CASHIER, {'x1': 30, 'y1': 70, 'x2': 70, 'y2': 85}, 2.0),
            'exit': StoreZone('Saída', ZoneType.EXIT, {'x1': 0, 'y1': 85, 'x2': 100, 'y2': 100}, 0.1),
            'bathroom': StoreZone('Banheiro', ZoneType.BATHROOM, {'x1': 5, 'y1': 5, 'x2': 15, 'y2': 15}, -0.1),
        }
    
    def get_zone(self, position: Tuple[float, float]) -> str:
        """Identifica zona baseada na posição (x, y em percentual)"""
        x, y = position
        
        for zone_id, zone in self.store_zones.items():
            coords = zone.coordinates
            if (coords['x1'] <= x <= coords['x2'] and 
                coords['y1'] <= y <= coords['y2']):
                return zone_id
        
        return 'other'
    
    async def start_journey(self, person_id: str, entry_position: Tuple[float, float]) -> CustomerJourney:
        """Inicia nova jornada de cliente"""
        now = datetime.now()
        entry_zone = self.get_zone(entry_position)
        
        journey = CustomerJourney(
            person_id=person_id,
            entry_time=now,
            path=[PathPoint(now, entry_position, entry_zone)],
            zones_visited={entry_zone}
        )
        
        self.journeys[person_id] = journey
        logger.debug(f"Jornada iniciada para {person_id} na zona {entry_zone}")
        
        return journey
    
    async def track_customer_journey(
        self, 
        person_id: str, 
        timestamp: datetime, 
        position: Tuple[float, float], 
        observations: Dict[str, Any] = None
    ) -> Optional[CustomerJourney]:
        """
        Atualiza jornada do cliente com nova posição e observações
        
        Args:
            person_id: ID único da pessoa
            timestamp: Momento da observação
            position: Posição (x, y) em percentual da imagem
            observations: Observações adicionais (holding_items, has_bag, etc.)
            
        Returns:
            CustomerJourney atualizada ou None se não existe
        """
        if person_id not in self.journeys:
            # Criar jornada se não existe
            return await self.start_journey(person_id, position)
        
        journey = self.journeys[person_id]
        observations = observations or {}
        
        # Adicionar ponto ao caminho
        zone = self.get_zone(position)
        path_point = PathPoint(timestamp, position, zone, observations)
        journey.path.append(path_point)
        journey.zones_visited.add(zone)
        
        # Atualizar tempo total
        journey.total_time = (timestamp - journey.entry_time).total_seconds()
        
        # Análise específica por zona
        await self._analyze_zone_behavior(journey, zone, observations, timestamp)
        
        # Detectar interações com produtos
        if observations.get('holding_items') or observations.get('examining_product'):
            await self._record_product_interaction(journey, zone, observations, timestamp)
        
        # Atualizar probabilidade de compra continuamente
        journey.purchase_probability = await self._calculate_purchase_probability(journey)
        
        logger.debug(f"Jornada atualizada: {person_id} em {zone} (prob: {journey.purchase_probability:.2f})")
        
        return journey
    
    async def _analyze_zone_behavior(
        self, 
        journey: CustomerJourney, 
        zone: str, 
        observations: Dict[str, Any], 
        timestamp: datetime
    ):
        """Analisa comportamento específico por zona"""
        
        if zone == 'cashier':
            # Tempo no caixa (forte indicador de compra)
            if len(journey.path) > 1:
                prev_point = journey.path[-2]
                if prev_point.zone == 'cashier':
                    time_diff = (timestamp - prev_point.timestamp).total_seconds()
                    journey.cashier_time += time_diff
            
            # Se passou muito tempo no caixa, provavelmente comprou
            if journey.cashier_time > self.purchase_indicators['visited_cashier']['threshold']:
                journey.purchase_indicators['visited_cashier'] = True
                journey.purchase_probability = min(0.9, journey.purchase_probability + 0.5)
                logger.debug(f"Cliente {journey.person_id}: tempo no caixa {journey.cashier_time:.1f}s")
        
        elif zone.startswith('products_'):
            # Zona de produtos
            journey.purchase_indicators['visited_product_zones'] = len([
                z for z in journey.zones_visited if z.startswith('products_')
            ])
        
        elif zone == 'exit':
            # Análise final na saída
            await self._analyze_exit(journey, observations, timestamp)
    
    async def _record_product_interaction(
        self, 
        journey: CustomerJourney, 
        zone: str, 
        observations: Dict[str, Any], 
        timestamp: datetime
    ):
        """Registra interação com produtos"""
        
        interaction_type = 'examined'
        if observations.get('holding_items'):
            interaction_type = 'picked_up'
        elif observations.get('returned_item'):
            interaction_type = 'returned'
        
        # Calcular duração (tempo na mesma zona)
        duration = 5.0  # padrão
        if len(journey.path) > 1:
            prev_point = journey.path[-2]
            if prev_point.zone == zone:
                duration = (timestamp - prev_point.timestamp).total_seconds()
        
        interaction = ProductInteraction(
            timestamp=timestamp,
            product_zone=zone,
            interaction_type=interaction_type,
            duration=duration,
            confidence=observations.get('confidence', 1.0)
        )
        
        journey.product_interactions.append(interaction)
        
        # Atualizar indicadores
        total_interaction_time = sum(pi.duration for pi in journey.product_interactions)
        journey.purchase_indicators['product_interaction_time'] = total_interaction_time
        
        if observations.get('holding_items'):
            journey.purchase_indicators['carried_products'] = True
    
    async def _analyze_exit(
        self, 
        journey: CustomerJourney, 
        exit_observations: Dict[str, Any], 
        timestamp: datetime
    ):
        """Análise final quando cliente sai da loja"""
        
        journey.exit_time = timestamp
        
        # Detectar sacola/produtos na saída
        if exit_observations.get('has_bag') or exit_observations.get('carrying_items'):
            journey.purchase_indicators['exit_with_bag'] = True
            journey.purchase_probability += 0.4
        
        # Análise final de compra
        final_score = await self._calculate_final_purchase_score(journey)
        journey.purchase_score = final_score
        journey.likely_purchased = final_score > 0.6
        
        # Classificar tipo de cliente
        journey.customer_type = await self._classify_customer_type(journey)
        
        logger.info(
            f"Cliente {journey.person_id} saiu: "
            f"compra={journey.likely_purchased} "
            f"score={final_score:.2f} "
            f"tempo={journey.total_time:.0f}s "
            f"tipo={journey.customer_type}"
        )
        
        return journey
    
    async def _calculate_purchase_probability(self, journey: CustomerJourney) -> float:
        """Calcula probabilidade de compra em tempo real"""
        score = 0.0
        
        # Tempo mínimo na loja
        if journey.total_time > self.purchase_indicators['min_time_in_store']['threshold']:
            score += self.purchase_indicators['min_time_in_store']['weight']
        
        # Tempo no caixa
        if journey.cashier_time > self.purchase_indicators['visited_cashier']['threshold']:
            cashier_score = min(1.0, journey.cashier_time / 60) * self.purchase_indicators['visited_cashier']['weight']
            score += cashier_score
        
        # Produtos carregados
        if journey.purchase_indicators.get('carried_products'):
            score += self.purchase_indicators['carried_products']['weight']
        
        # Tempo de interação com produtos
        interaction_time = journey.purchase_indicators.get('product_interaction_time', 0)
        if interaction_time > self.purchase_indicators['product_interaction_time']['threshold']:
            interaction_score = min(1.0, interaction_time / 120) * self.purchase_indicators['product_interaction_time']['weight']
            score += interaction_score
        
        # Zonas de produtos visitadas
        product_zones = journey.purchase_indicators.get('visited_product_zones', 0)
        if product_zones >= self.purchase_indicators['visited_product_zones']['threshold']:
            score += self.purchase_indicators['visited_product_zones']['weight']
        
        return min(1.0, score)
    
    async def _calculate_final_purchase_score(self, journey: CustomerJourney) -> float:
        """Calcula score final de compra"""
        score = journey.purchase_probability
        
        # Bonus por saída com sacola
        if journey.purchase_indicators.get('exit_with_bag'):
            score += self.purchase_indicators['exit_with_bag']['weight']
        
        # Coerência do caminho (entrada -> produtos -> caixa -> saída)
        path_coherence = await self._analyze_path_coherence(journey)
        score += path_coherence * self.purchase_indicators['path_coherence']['weight']
        
        # Penalidade por tempo muito curto (turista/perdido)
        if journey.total_time < 30:  # 30 segundos
            score *= 0.3
        
        # Penalidade por nunca ter ido ao caixa
        if journey.cashier_time == 0 and 'cashier' not in journey.zones_visited:
            score *= 0.4
        
        return min(1.0, max(0.0, score))
    
    async def _analyze_path_coherence(self, journey: CustomerJourney) -> float:
        """Analisa se o caminho faz sentido para uma compra"""
        zones_sequence = [point.zone for point in journey.path]
        
        # Sequência ideal: entrada -> produtos -> caixa -> saída
        coherence_score = 0.0
        
        # Verificar se passou pelos produtos antes do caixa
        product_zones = [z for z in zones_sequence if z.startswith('products_')]
        cashier_indices = [i for i, z in enumerate(zones_sequence) if z == 'cashier']
        
        if product_zones and cashier_indices:
            product_indices = [i for i, z in enumerate(zones_sequence) if z.startswith('products_')]
            if any(pi < ci for pi in product_indices for ci in cashier_indices):
                coherence_score += 0.5
        
        # Verificar se terminou na saída
        if zones_sequence and zones_sequence[-1] in ['exit', 'entrance']:
            coherence_score += 0.3
        
        # Penalizar muito vai-e-vem
        zone_changes = len(set(zones_sequence))
        if zone_changes > 8:  # Muito indeciso
            coherence_score -= 0.2
        
        return max(0.0, min(1.0, coherence_score))
    
    async def _classify_customer_type(self, journey: CustomerJourney) -> str:
        """Classifica tipo de cliente baseado no comportamento"""
        
        # Cliente objetivo - compra rápida
        if (journey.total_time < 300 and  # 5 minutos
            journey.cashier_time > 20 and
            len(journey.zones_visited) <= 4):
            return 'objetivo'
        
        # Explorador - visita muitas zonas, tempo longo
        elif (len(journey.zones_visited) > 5 and 
              journey.total_time > 600 and  # 10 minutos
              len(journey.product_interactions) > 3):
            return 'explorador'
        
        # Econômico - tempo médio, foca em uma zona
        elif (300 < journey.total_time < 900 and  # 5-15 minutos
              any(zone.endswith('promocoes') for zone in journey.zones_visited)):
            return 'economico'
        
        # Turista/perdido - pouco tempo, sem compra
        elif (journey.total_time < 120 and  # 2 minutos
              not journey.likely_purchased):
            return 'turista'
        
        # Cliente casual
        else:
            return 'casual'
    
    def get_journey(self, person_id: str) -> Optional[CustomerJourney]:
        """Obtém jornada de um cliente"""
        return self.journeys.get(person_id)
    
    def get_active_journeys(self) -> Dict[str, CustomerJourney]:
        """Obtém todas as jornadas ativas (sem exit_time)"""
        return {
            pid: journey for pid, journey in self.journeys.items()
            if journey.exit_time is None
        }
    
    def get_completed_journeys(self, since: datetime = None) -> List[CustomerJourney]:
        """Obtém jornadas completadas"""
        completed = [
            journey for journey in self.journeys.values()
            if journey.exit_time is not None
        ]
        
        if since:
            completed = [j for j in completed if j.exit_time >= since]
        
        return completed
    
    def get_purchase_statistics(self, time_period: timedelta = None) -> Dict[str, Any]:
        """Obtém estatísticas de compra"""
        if time_period is None:
            time_period = timedelta(hours=24)
        
        since = datetime.now() - time_period
        completed = self.get_completed_journeys(since)
        
        if not completed:
            return {'error': 'Nenhuma jornada completada no período'}
        
        total_customers = len(completed)
        likely_purchases = sum(1 for j in completed if j.likely_purchased)
        conversion_rate = (likely_purchases / total_customers) * 100 if total_customers > 0 else 0
        
        # Análise por tipo de cliente
        customer_types = {}
        for journey in completed:
            if journey.customer_type:
                if journey.customer_type not in customer_types:
                    customer_types[journey.customer_type] = {'count': 0, 'purchases': 0}
                customer_types[journey.customer_type]['count'] += 1
                if journey.likely_purchased:
                    customer_types[journey.customer_type]['purchases'] += 1
        
        # Calcular conversão por tipo
        for customer_type in customer_types:
            data = customer_types[customer_type]
            data['conversion_rate'] = (data['purchases'] / data['count']) * 100 if data['count'] > 0 else 0
        
        return {
            'period': time_period.total_seconds() / 3600,  # horas
            'total_customers': total_customers,
            'likely_purchases': likely_purchases,
            'conversion_rate': round(conversion_rate, 2),
            'avg_journey_time': round(sum(j.total_time for j in completed) / total_customers, 1) if completed else 0,
            'avg_purchase_score': round(sum(j.purchase_score for j in completed) / total_customers, 3) if completed else 0,
            'customer_types': customer_types,
            'most_visited_zones': self._get_most_visited_zones(completed)
        }
    
    def _get_most_visited_zones(self, journeys: List[CustomerJourney]) -> Dict[str, int]:
        """Obtém zonas mais visitadas"""
        zone_counts = {}
        for journey in journeys:
            for zone in journey.zones_visited:
                zone_counts[zone] = zone_counts.get(zone, 0) + 1
        
        # Ordenar por frequência
        return dict(sorted(zone_counts.items(), key=lambda x: x[1], reverse=True))
    
    def cleanup_old_journeys(self, max_age: timedelta = None):
        """Remove jornadas antigas da memória"""
        if max_age is None:
            max_age = timedelta(days=1)
        
        cutoff_time = datetime.now() - max_age
        to_remove = []
        
        for person_id, journey in self.journeys.items():
            # Remove jornadas completadas há mais tempo que max_age
            if (journey.exit_time and journey.exit_time < cutoff_time):
                to_remove.append(person_id)
            # Remove jornadas ativas muito antigas (provavelmente erro de tracking)
            elif (not journey.exit_time and journey.entry_time < cutoff_time):
                to_remove.append(person_id)
        
        for person_id in to_remove:
            del self.journeys[person_id]
        
        if to_remove:
            logger.info(f"Removidas {len(to_remove)} jornadas antigas da memória")
        
        return len(to_remove)