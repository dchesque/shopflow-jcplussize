"""
Funções utilitárias para o backend
"""

import cv2
import numpy as np
import base64
import io
from PIL import Image
from typing import Optional, Tuple, Dict, Any, List
from datetime import datetime, timedelta
import os
import json
from pathlib import Path
from loguru import logger

def decode_frame_from_bytes(frame_bytes: bytes) -> Optional[np.ndarray]:
    """Decodificar frame de bytes para array numpy"""
    try:
        # Converter bytes para numpy array
        nparr = np.frombuffer(frame_bytes, np.uint8)
        
        # Decodificar imagem
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            logger.error("Falha ao decodificar frame")
            return None
        
        return frame
        
    except Exception as e:
        logger.error(f"Erro ao decodificar frame: {e}")
        return None

def encode_frame_to_base64(frame: np.ndarray, quality: int = 85) -> Optional[str]:
    """Codificar frame para base64"""
    try:
        # Codificar como JPEG
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
        ret, buffer = cv2.imencode('.jpg', frame, encode_params)
        
        if not ret:
            return None
        
        # Converter para base64
        frame_b64 = base64.b64encode(buffer).decode('utf-8')
        return frame_b64
        
    except Exception as e:
        logger.error(f"Erro ao codificar frame: {e}")
        return None

def resize_frame(frame: np.ndarray, target_width: int = None, target_height: int = None, 
                maintain_aspect: bool = True) -> np.ndarray:
    """Redimensionar frame mantendo proporção"""
    try:
        h, w = frame.shape[:2]
        
        if target_width is None and target_height is None:
            return frame
        
        if maintain_aspect:
            if target_width is not None:
                scale = target_width / w
                new_width = target_width
                new_height = int(h * scale)
            elif target_height is not None:
                scale = target_height / h
                new_height = target_height
                new_width = int(w * scale)
        else:
            new_width = target_width or w
            new_height = target_height or h
        
        resized_frame = cv2.resize(frame, (new_width, new_height))
        return resized_frame
        
    except Exception as e:
        logger.error(f"Erro ao redimensionar frame: {e}")
        return frame

def apply_roi(frame: np.ndarray, roi: Dict[str, float]) -> np.ndarray:
    """Aplicar Region of Interest no frame"""
    try:
        h, w = frame.shape[:2]
        
        x1 = int(w * roi.get('x', 0) / 100)
        y1 = int(h * roi.get('y', 0) / 100)
        x2 = int(w * (roi.get('x', 0) + roi.get('width', 100)) / 100)
        y2 = int(h * (roi.get('y', 0) + roi.get('height', 100)) / 100)
        
        # Garantir que as coordenadas estejam dentro dos limites
        x1 = max(0, min(x1, w))
        y1 = max(0, min(y1, h))
        x2 = max(x1, min(x2, w))
        y2 = max(y1, min(y2, h))
        
        roi_frame = frame[y1:y2, x1:x2]
        return roi_frame
        
    except Exception as e:
        logger.error(f"Erro ao aplicar ROI: {e}")
        return frame

def calculate_frame_quality(frame: np.ndarray) -> Dict[str, float]:
    """Calcular métricas de qualidade do frame"""
    try:
        # Converter para escala de cinza
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Calcular sharpness (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calcular brightness
        brightness = np.mean(gray)
        
        # Calcular contrast (desvio padrão)
        contrast = np.std(gray)
        
        return {
            'sharpness': float(laplacian_var),
            'brightness': float(brightness),
            'contrast': float(contrast)
        }
        
    except Exception as e:
        logger.error(f"Erro ao calcular qualidade: {e}")
        return {'sharpness': 0, 'brightness': 0, 'contrast': 0}

def create_thumbnail(frame: np.ndarray, size: Tuple[int, int] = (150, 100)) -> Optional[str]:
    """Criar thumbnail do frame e retornar em base64"""
    try:
        # Redimensionar
        thumbnail = cv2.resize(frame, size)
        
        # Codificar como JPEG com qualidade reduzida
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, 60]
        ret, buffer = cv2.imencode('.jpg', thumbnail, encode_params)
        
        if not ret:
            return None
        
        # Converter para base64
        thumbnail_b64 = base64.b64encode(buffer).decode('utf-8')
        return thumbnail_b64
        
    except Exception as e:
        logger.error(f"Erro ao criar thumbnail: {e}")
        return None

def validate_rtsp_url(rtsp_url: str) -> bool:
    """Validar URL RTSP"""
    try:
        # Verificação básica de formato
        if not rtsp_url.startswith('rtsp://'):
            return False
        
        # Tentar conectar (timeout curto)
        cap = cv2.VideoCapture(rtsp_url)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        # Tentar ler um frame
        ret, frame = cap.read()
        cap.release()
        
        return ret and frame is not None
        
    except Exception as e:
        logger.error(f"Erro ao validar RTSP: {e}")
        return False

def format_duration(seconds: float) -> str:
    """Formatar duração em formato legível"""
    try:
        if seconds < 60:
            return f"{seconds:.1f}s"
        elif seconds < 3600:
            minutes = int(seconds // 60)
            secs = int(seconds % 60)
            return f"{minutes}m {secs}s"
        else:
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            return f"{hours}h {minutes}m"
            
    except Exception:
        return "0s"

def format_bytes(bytes_value: int) -> str:
    """Formatar tamanho em bytes"""
    try:
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f} TB"
        
    except Exception:
        return "0 B"

def cleanup_old_files(directory: str, max_age_days: int = 7, pattern: str = "*"):
    """Limpar arquivos antigos de um diretório"""
    try:
        directory_path = Path(directory)
        if not directory_path.exists():
            return 0
        
        cutoff_time = datetime.now() - timedelta(days=max_age_days)
        deleted_count = 0
        
        for file_path in directory_path.glob(pattern):
            if file_path.is_file():
                file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                if file_mtime < cutoff_time:
                    try:
                        file_path.unlink()
                        deleted_count += 1
                        logger.debug(f"Arquivo removido: {file_path}")
                    except Exception as e:
                        logger.error(f"Erro ao remover {file_path}: {e}")
        
        logger.info(f"Cleanup concluído: {deleted_count} arquivos removidos")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Erro no cleanup: {e}")
        return 0

def save_config(config: Dict[str, Any], file_path: str) -> bool:
    """Salvar configuração em arquivo JSON"""
    try:
        config_path = Path(file_path)
        config_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False, default=str)
        
        logger.info(f"Configuração salva: {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao salvar config: {e}")
        return False

def load_config(file_path: str, default_config: Dict[str, Any] = None) -> Dict[str, Any]:
    """Carregar configuração de arquivo JSON"""
    try:
        config_path = Path(file_path)
        
        if not config_path.exists():
            if default_config:
                save_config(default_config, file_path)
                return default_config.copy()
            return {}
        
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        return config
        
    except Exception as e:
        logger.error(f"Erro ao carregar config: {e}")
        return default_config.copy() if default_config else {}

def generate_report_filename(report_type: str, start_date: str, end_date: str, 
                           format_type: str = "json") -> str:
    """Gerar nome de arquivo para relatório"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"shopflow_{report_type}_{start_date}_to_{end_date}_{timestamp}.{format_type}"
        return filename
        
    except Exception:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"shopflow_report_{timestamp}.{format_type}"

def calculate_fps(frame_count: int, duration: float) -> float:
    """Calcular FPS baseado em contagem de frames e duração"""
    try:
        if duration <= 0:
            return 0.0
        return frame_count / duration
        
    except Exception:
        return 0.0

def get_system_info() -> Dict[str, Any]:
    """Obter informações do sistema"""
    try:
        import psutil
        import platform
        
        return {
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'memory_available': psutil.virtual_memory().available,
            'disk_usage': psutil.disk_usage('.').percent,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter info do sistema: {e}")
        return {'error': str(e)}

def validate_detection_zone(zone: Dict[str, float]) -> bool:
    """Validar zona de detecção"""
    try:
        required_keys = ['x', 'y', 'width', 'height']
        
        # Verificar se todas as chaves existem
        if not all(key in zone for key in required_keys):
            return False
        
        # Verificar se os valores são válidos
        x, y, width, height = zone['x'], zone['y'], zone['width'], zone['height']
        
        # Valores devem ser entre 0 e 100 (percentuais)
        if not (0 <= x <= 100 and 0 <= y <= 100):
            return False
        
        if not (0 < width <= 100 and 0 < height <= 100):
            return False
        
        # Verificar se a zona não ultrapassa os limites
        if x + width > 100 or y + height > 100:
            return False
        
        return True
        
    except Exception:
        return False

def create_detection_overlay(frame: np.ndarray, detections: List[Dict], 
                           line_position: float = 0.5) -> np.ndarray:
    """Criar overlay com detecções no frame"""
    try:
        overlay = frame.copy()
        h, w = frame.shape[:2]
        
        # Desenhar linha de contagem
        line_y = int(h * line_position)
        cv2.line(overlay, (0, line_y), (w, line_y), (0, 255, 255), 2)
        
        # Desenhar detecções
        for detection in detections:
            bbox = detection.get('bbox', [])
            confidence = detection.get('confidence', 0)
            
            if len(bbox) == 4:
                x1, y1, x2, y2 = bbox
                
                # Cor baseada na confiança
                if confidence > 0.8:
                    color = (0, 255, 0)  # Verde
                elif confidence > 0.6:
                    color = (0, 255, 255)  # Amarelo
                else:
                    color = (0, 165, 255)  # Laranja
                
                # Retângulo
                cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 2)
                
                # Label
                label = f"Pessoa {confidence:.2f}"
                cv2.putText(overlay, label, (x1, y1 - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        return overlay
        
    except Exception as e:
        logger.error(f"Erro ao criar overlay: {e}")
        return frame