"""
Sistema de tracking de pessoas para contagem de entrada/saída
"""

import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from collections import defaultdict, deque
from dataclasses import dataclass
from loguru import logger
import time
import uuid

@dataclass
class TrackedPerson:
    id: str
    positions: deque
    last_seen: float
    confidence_history: deque
    crossed_line: bool = False
    direction: Optional[str] = None  # 'up' or 'down'
    
    def update_position(self, center: Tuple[int, int], confidence: float):
        self.positions.append(center)
        self.confidence_history.append(confidence)
        self.last_seen = time.time()
        
        # Manter apenas últimas N posições
        if len(self.positions) > 10:
            self.positions.popleft()
            self.confidence_history.popleft()

class PersonTracker:
    def __init__(self, max_disappeared: int = 30, max_distance: float = 50.0):
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance
        self.tracked_persons: Dict[str, TrackedPerson] = {}
        self.next_id = 0
        self.crossings_buffer = []
        
    def update(self, detections: List[Dict[str, Any]]) -> Dict[str, TrackedPerson]:
        """Atualizar tracker com novas detecções"""
        try:
            current_time = time.time()
            
            # Se não há detecções, apenas atualizar disappeared timer
            if not detections:
                self._cleanup_disappeared_persons(current_time)
                return self.tracked_persons.copy()
            
            # Extrair centros das detecções
            detection_centers = [det['center'] for det in detections]
            detection_confidences = [det['confidence'] for det in detections]
            
            # Associar detecções com pessoas já tracked
            matched_persons, unmatched_detections = self._associate_detections(
                detection_centers, detection_confidences
            )
            
            # Atualizar pessoas matched
            for person_id, (detection_idx, distance) in matched_persons.items():
                center = detection_centers[detection_idx]
                confidence = detection_confidences[detection_idx]
                self.tracked_persons[person_id].update_position(center, confidence)
            
            # Criar novas pessoas para detecções não matched
            for det_idx in unmatched_detections:
                person_id = self._generate_person_id()
                center = detection_centers[det_idx]
                confidence = detection_confidences[det_idx]
                
                self.tracked_persons[person_id] = TrackedPerson(
                    id=person_id,
                    positions=deque([center], maxlen=10),
                    last_seen=current_time,
                    confidence_history=deque([confidence], maxlen=10)
                )
                
                logger.debug(f"Nova pessoa tracked: {person_id}")
            
            # Limpar pessoas que desapareceram
            self._cleanup_disappeared_persons(current_time)
            
            return self.tracked_persons.copy()
            
        except Exception as e:
            logger.error(f"Erro no tracking: {e}")
            return self.tracked_persons.copy()
    
    def _associate_detections(self, centers: List[Tuple[int, int]], 
                            confidences: List[float]) -> Tuple[Dict[str, Tuple[int, float]], List[int]]:
        """Associar detecções com pessoas já tracked"""
        if not self.tracked_persons:
            return {}, list(range(len(centers)))
        
        # Calcular distâncias entre todas as detecções e pessoas tracked
        distances = {}
        for person_id, person in self.tracked_persons.items():
            if not person.positions:
                continue
                
            last_pos = person.positions[-1]
            
            for det_idx, center in enumerate(centers):
                dist = self._calculate_distance(last_pos, center)
                if dist <= self.max_distance:
                    distances[(person_id, det_idx)] = dist
        
        # Resolver associações usando algoritmo greedy simples
        matched = {}
        used_detections = set()
        
        # Ordenar por distância
        sorted_distances = sorted(distances.items(), key=lambda x: x[1])
        
        for (person_id, det_idx), distance in sorted_distances:
            if person_id not in matched and det_idx not in used_detections:
                matched[person_id] = (det_idx, distance)
                used_detections.add(det_idx)
        
        # Detecções não matched
        unmatched = [i for i in range(len(centers)) if i not in used_detections]
        
        return matched, unmatched
    
    def _calculate_distance(self, pos1: Tuple[int, int], pos2: Tuple[int, int]) -> float:
        """Calcular distância euclidiana entre duas posições"""
        return np.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)
    
    def _cleanup_disappeared_persons(self, current_time: float):
        """Remover pessoas que desapareceram há muito tempo"""
        to_remove = []
        
        for person_id, person in self.tracked_persons.items():
            time_since_seen = current_time - person.last_seen
            if time_since_seen > self.max_disappeared:
                to_remove.append(person_id)
                logger.debug(f"Removendo pessoa perdida: {person_id}")
        
        for person_id in to_remove:
            del self.tracked_persons[person_id]
    
    def _generate_person_id(self) -> str:
        """Gerar ID único para nova pessoa"""
        self.next_id += 1
        return f"person_{self.next_id:04d}"
    
    def check_line_crossings(self, line_position: float, frame_height: int = None) -> List[Dict[str, Any]]:
        """Verificar cruzamentos da linha de contagem"""
        crossings = []
        
        try:
            # Se frame_height não fornecido, usar valor padrão
            if frame_height is None:
                frame_height = 720  # HD padrão
            
            line_y = int(frame_height * line_position)
            
            for person_id, person in self.tracked_persons.items():
                if len(person.positions) < 2:
                    continue
                
                # Verificar se a pessoa cruzou a linha
                prev_pos = person.positions[-2]
                curr_pos = person.positions[-1]
                
                crossed, direction = self._check_line_crossing(
                    prev_pos, curr_pos, line_y
                )
                
                if crossed and not person.crossed_line:
                    person.crossed_line = True
                    person.direction = direction
                    
                    # Determinar ação baseada na direção
                    action = "ENTER" if direction == "down" else "EXIT"
                    
                    crossing = {
                        'person_id': person_id,
                        'action': action,
                        'direction': direction,
                        'position': curr_pos,
                        'confidence': np.mean(list(person.confidence_history)),
                        'timestamp': time.time()
                    }
                    
                    crossings.append(crossing)
                    logger.info(f"Cruzamento detectado: {person_id} - {action}")
            
            return crossings
            
        except Exception as e:
            logger.error(f"Erro ao verificar cruzamentos: {e}")
            return []
    
    def _check_line_crossing(self, pos1: Tuple[int, int], pos2: Tuple[int, int], 
                           line_y: int) -> Tuple[bool, Optional[str]]:
        """Verificar se houve cruzamento da linha"""
        y1, y2 = pos1[1], pos2[1]
        
        # Verificar se cruzou a linha
        if (y1 <= line_y <= y2) or (y2 <= line_y <= y1):
            # Determinar direção
            if y1 < line_y and y2 > line_y:
                return True, "down"  # Movimento para baixo (entrada)
            elif y1 > line_y and y2 < line_y:
                return True, "up"    # Movimento para cima (saída)
        
        return False, None
    
    def get_tracking_stats(self) -> Dict[str, Any]:
        """Obter estatísticas do tracking"""
        try:
            active_persons = len(self.tracked_persons)
            total_positions = sum(len(person.positions) for person in self.tracked_persons.values())
            avg_confidence = 0
            
            if self.tracked_persons:
                all_confidences = []
                for person in self.tracked_persons.values():
                    all_confidences.extend(list(person.confidence_history))
                
                if all_confidences:
                    avg_confidence = np.mean(all_confidences)
            
            return {
                'active_persons': active_persons,
                'total_positions_tracked': total_positions,
                'average_confidence': round(float(avg_confidence), 3),
                'max_disappeared_time': self.max_disappeared,
                'max_tracking_distance': self.max_distance,
                'next_id': self.next_id
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter stats do tracking: {e}")
            return {}
    
    def reset(self):
        """Resetar o tracker"""
        self.tracked_persons.clear()
        self.next_id = 0
        self.crossings_buffer.clear()
        logger.info("Tracker resetado")
    
    def get_person_trajectory(self, person_id: str) -> List[Tuple[int, int]]:
        """Obter trajetória de uma pessoa específica"""
        if person_id in self.tracked_persons:
            return list(self.tracked_persons[person_id].positions)
        return []
    
    def draw_tracks(self, frame: np.ndarray, line_position: float = 0.5) -> np.ndarray:
        """Desenhar tracks no frame"""
        try:
            annotated_frame = frame.copy()
            h, w = frame.shape[:2]
            line_y = int(h * line_position)
            
            # Desenhar linha de contagem
            cv2.line(annotated_frame, (0, line_y), (w, line_y), (0, 255, 255), 3)
            
            # Desenhar trajetórias
            colors = [
                (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0),
                (255, 0, 255), (0, 255, 255), (128, 0, 128), (255, 165, 0)
            ]
            
            for i, (person_id, person) in enumerate(self.tracked_persons.items()):
                if len(person.positions) < 2:
                    continue
                
                color = colors[i % len(colors)]
                
                # Desenhar trajetória
                positions = list(person.positions)
                for j in range(1, len(positions)):
                    cv2.line(annotated_frame, positions[j-1], positions[j], color, 2)
                
                # Desenhar posição atual
                if positions:
                    last_pos = positions[-1]
                    cv2.circle(annotated_frame, last_pos, 8, color, -1)
                    
                    # Label da pessoa
                    label = f"ID: {person_id.split('_')[-1]}"
                    cv2.putText(annotated_frame, label, 
                              (last_pos[0] + 10, last_pos[1] - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # Info do tracking
            info = f"Pessoas ativas: {len(self.tracked_persons)}"
            cv2.putText(annotated_frame, info, (10, h - 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            return annotated_frame
            
        except Exception as e:
            logger.error(f"Erro ao desenhar tracks: {e}")
            return frame