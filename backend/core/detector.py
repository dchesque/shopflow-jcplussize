"""
Detector de pessoas usando YOLO11
"""

import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple, Any
from loguru import logger
import torch
from pathlib import Path

class YOLOPersonDetector:
    def __init__(self, model_path: str = "yolo11n.pt", confidence: float = 0.6, iou: float = 0.45):
        self.model_path = model_path
        self.confidence = confidence
        self.iou = iou
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    async def load_model(self):
        """Carregar modelo YOLO11"""
        try:
            logger.info(f"Carregando YOLO11: {self.model_path} no {self.device}")
            
            # Verificar se o modelo existe localmente
            model_file = Path(self.model_path)
            if not model_file.exists():
                logger.info(f"Modelo não encontrado localmente, fazendo download...")
            
            # Carregar modelo
            self.model = YOLO(self.model_path)
            self.model.to(self.device)
            
            # Fazer uma predição de teste para "aquecer" o modelo
            test_frame = np.zeros((640, 640, 3), dtype=np.uint8)
            _ = self.model(test_frame, verbose=False)
            
            logger.success(f"YOLO11 carregado com sucesso no {self.device}")
            
        except Exception as e:
            logger.error(f"Erro ao carregar YOLO11: {e}")
            raise
    
    async def detect_persons(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """Detectar pessoas no frame"""
        try:
            if self.model is None:
                raise Exception("Modelo não foi carregado")
            
            # Executar inferência
            results = self.model(
                frame,
                conf=self.confidence,
                iou=self.iou,
                classes=[0],  # Apenas classe "person"
                verbose=False
            )
            
            detections = []
            
            # Processar resultados
            for result in results:
                if result.boxes is not None:
                    boxes = result.boxes.xyxy.cpu().numpy()  # x1, y1, x2, y2
                    confidences = result.boxes.conf.cpu().numpy()
                    
                    for i, (box, conf) in enumerate(zip(boxes, confidences)):
                        x1, y1, x2, y2 = box
                        
                        # Calcular centro e dimensões
                        center_x = int((x1 + x2) / 2)
                        center_y = int((y1 + y2) / 2)
                        width = int(x2 - x1)
                        height = int(y2 - y1)
                        
                        detection = {
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'center': [center_x, center_y],
                            'confidence': float(conf),
                            'width': width,
                            'height': height,
                            'area': width * height,
                            'class': 'person'
                        }
                        
                        detections.append(detection)
            
            return detections
            
        except Exception as e:
            logger.error(f"Erro na detecção: {e}")
            return []