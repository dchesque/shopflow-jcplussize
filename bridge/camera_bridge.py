#!/usr/bin/env python3
"""
Shop Flow - Camera Bridge
Sistema de captura e streaming de câmera RTSP para o VPS de processamento
"""

import cv2
import json
import time
import os
import threading
import requests
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
from dataclasses import dataclass
from loguru import logger
from dotenv import load_dotenv
from flask import Flask, Response, render_template_string
import base64
import io
from PIL import Image
import subprocess
import queue
import psutil

# Load environment variables
load_dotenv()

@dataclass
class CameraConfig:
    rtsp_url: str
    fps: int
    width: int
    height: int
    reconnect_interval: int
    max_retries: int
    timeout: int

@dataclass
class ServerConfig:
    vps_url: str
    api_key: str
    upload_endpoint: str
    heartbeat_endpoint: str
    heartbeat_interval: int
    max_frame_size: int
    compression_quality: int

class CameraBridge:
    def __init__(self, config_path: str = "config.json"):
        self.config = self._load_config(config_path)
        self.camera_config = self._parse_camera_config()
        self.server_config = self._parse_server_config()
        
        # State management
        self.is_running = False
        self.camera = None
        self.last_frame = None
        self.frame_queue = queue.Queue(maxsize=10)
        self.stats = {
            'frames_captured': 0,
            'frames_sent': 0,
            'errors': 0,
            'last_heartbeat': None,
            'connection_status': 'disconnected'
        }
        
        # Setup logging
        self._setup_logging()
        
        # Flask app for local streaming
        self.app = Flask(__name__)
        self._setup_flask_routes()
        
        logger.info("Camera Bridge inicializado")

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Carrega configuração do arquivo JSON"""
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Override com variáveis de ambiente
            config['camera']['rtsp_url'] = os.getenv('CAMERA_RTSP_URL', config['camera']['rtsp_url'])
            config['server']['vps_url'] = os.getenv('VPS_URL', config['server']['vps_url'])
            config['server']['api_key'] = os.getenv('VPS_API_KEY', config['server']['api_key'])
            
            return config
        except Exception as e:
            logger.error(f"Erro ao carregar configuração: {e}")
            raise

    def _parse_camera_config(self) -> CameraConfig:
        """Parse da configuração da câmera"""
        cam_config = self.config['camera']
        return CameraConfig(
            rtsp_url=cam_config['rtsp_url'],
            fps=cam_config['fps'],
            width=cam_config['resolution']['width'],
            height=cam_config['resolution']['height'],
            reconnect_interval=cam_config['reconnect_interval'],
            max_retries=cam_config['max_retries'],
            timeout=cam_config['timeout']
        )

    def _parse_server_config(self) -> ServerConfig:
        """Parse da configuração do servidor"""
        server_config = self.config['server']
        return ServerConfig(
            vps_url=server_config['vps_url'],
            api_key=server_config['api_key'],
            upload_endpoint=server_config['upload_endpoint'],
            heartbeat_endpoint=server_config['heartbeat_endpoint'],
            heartbeat_interval=server_config['heartbeat_interval'],
            max_frame_size=server_config['max_frame_size'],
            compression_quality=server_config['compression_quality']
        )

    def _setup_logging(self):
        """Configurar sistema de logging"""
        log_config = self.config['logging']
        
        # Criar diretório de logs
        log_path = Path(log_config['file'])
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Configurar loguru
        logger.remove()  # Remove handler padrão
        
        if log_config.get('console', True):
            logger.add(
                lambda msg: print(msg, end=''),
                format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
                level=log_config['level']
            )
        
        logger.add(
            log_config['file'],
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level=log_config['level'],
            rotation=log_config['max_size'],
            retention=f"{log_config['backup_count']} files"
        )

    def _setup_flask_routes(self):
        """Configurar rotas do Flask para streaming local"""
        
        @self.app.route('/')
        def index():
            return render_template_string("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shop Flow - Camera Bridge</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; }
                    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                    .status { background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    .stream { text-align: center; }
                    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                    .stat-card { background: #2d2d2d; padding: 15px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎥 Shop Flow Camera Bridge</h1>
                    
                    <div class="status">
                        <h3>Status: <span id="status">{{ status }}</span></h3>
                        <div class="stats">
                            <div class="stat-card">
                                <h4>Frames Capturados</h4>
                                <p id="frames-captured">{{ stats.frames_captured }}</p>
                            </div>
                            <div class="stat-card">
                                <h4>Frames Enviados</h4>
                                <p id="frames-sent">{{ stats.frames_sent }}</p>
                            </div>
                            <div class="stat-card">
                                <h4>Erros</h4>
                                <p id="errors">{{ stats.errors }}</p>
                            </div>
                            <div class="stat-card">
                                <h4>Último Heartbeat</h4>
                                <p id="heartbeat">{{ stats.last_heartbeat or 'Never' }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stream">
                        <h3>Stream de Vídeo</h3>
                        <img src="/video_feed" style="max-width: 100%; border: 2px solid #555; border-radius: 8px;">
                    </div>
                    
                    <script>
                        // Atualizar stats a cada 5 segundos
                        setInterval(function() {
                            fetch('/api/stats')
                                .then(r => r.json())
                                .then(data => {
                                    document.getElementById('status').textContent = data.connection_status;
                                    document.getElementById('frames-captured').textContent = data.frames_captured;
                                    document.getElementById('frames-sent').textContent = data.frames_sent;
                                    document.getElementById('errors').textContent = data.errors;
                                    document.getElementById('heartbeat').textContent = data.last_heartbeat || 'Never';
                                });
                        }, 5000);
                    </script>
                </div>
            </body>
            </html>
            """, status=self.stats['connection_status'], stats=self.stats)

        @self.app.route('/video_feed')
        def video_feed():
            return Response(self._generate_mjpeg_stream(),
                          mimetype='multipart/x-mixed-replace; boundary=frame')

        @self.app.route('/api/stats')
        def api_stats():
            return self.stats

    def _generate_mjpeg_stream(self):
        """Gerar stream MJPEG para visualização local"""
        while True:
            if self.last_frame is not None:
                try:
                    # Redimensionar frame para streaming local
                    frame = cv2.resize(self.last_frame, (640, 480))
                    
                    # Codificar como JPEG
                    ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    if ret:
                        yield (b'--frame\r\n'
                               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                except Exception as e:
                    logger.error(f"Erro ao gerar stream MJPEG: {e}")
            
            time.sleep(0.1)  # ~10 FPS para streaming local

    def connect_camera(self) -> bool:
        """Conectar à câmera RTSP"""
        try:
            logger.info(f"Conectando à câmera: {self.camera_config.rtsp_url}")
            
            # Configurar OpenCV para RTSP
            self.camera = cv2.VideoCapture(self.camera_config.rtsp_url, cv2.CAP_FFMPEG)
            
            # Configurar propriedades
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.camera_config.width)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.camera_config.height)
            self.camera.set(cv2.CAP_PROP_FPS, self.camera_config.fps)
            self.camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduzir latência
            
            # Testar conexão
            ret, frame = self.camera.read()
            if ret and frame is not None:
                logger.success("Câmera conectada com sucesso")
                self.stats['connection_status'] = 'connected'
                return True
            else:
                raise Exception("Não foi possível capturar frame da câmera")
                
        except Exception as e:
            logger.error(f"Erro ao conectar câmera: {e}")
            self.stats['connection_status'] = 'error'
            self.stats['errors'] += 1
            return False

    def disconnect_camera(self):
        """Desconectar da câmera"""
        if self.camera is not None:
            self.camera.release()
            self.camera = None
            self.stats['connection_status'] = 'disconnected'
            logger.info("Câmera desconectada")

    def capture_frames(self):
        """Thread para captura contínua de frames"""
        frame_skip_count = 0
        
        while self.is_running:
            try:
                if self.camera is None:
                    if not self.connect_camera():
                        time.sleep(self.camera_config.reconnect_interval)
                        continue
                
                ret, frame = self.camera.read()
                
                if not ret or frame is None:
                    logger.warning("Frame vazio recebido, tentando reconectar...")
                    self.disconnect_camera()
                    continue
                
                # Aplicar frame skip se configurado
                frame_skip = self.config['processing'].get('frame_skip', 0)
                if frame_skip > 0:
                    frame_skip_count += 1
                    if frame_skip_count % (frame_skip + 1) != 0:
                        continue
                
                self.last_frame = frame.copy()
                self.stats['frames_captured'] += 1
                
                # Adicionar à queue para processamento
                try:
                    self.frame_queue.put_nowait(frame)
                except queue.Full:
                    # Remove frame mais antigo se queue estiver cheia
                    try:
                        self.frame_queue.get_nowait()
                        self.frame_queue.put_nowait(frame)
                    except queue.Empty:
                        pass
                
            except Exception as e:
                logger.error(f"Erro na captura de frame: {e}")
                self.stats['errors'] += 1
                self.disconnect_camera()
                time.sleep(self.camera_config.reconnect_interval)

    def process_and_send_frames(self):
        """Thread para processar e enviar frames para o VPS"""
        while self.is_running:
            try:
                # Pegar frame da queue (timeout de 1 segundo)
                try:
                    frame = self.frame_queue.get(timeout=1.0)
                except queue.Empty:
                    continue
                
                # Pre-processamento (detecção de movimento se habilitado)
                if self.config['processing']['pre_detection']:
                    if not self._has_significant_motion(frame):
                        continue
                
                # Preparar frame para envio
                frame_data = self._prepare_frame_for_upload(frame)
                if frame_data is None:
                    continue
                
                # Enviar para VPS
                if self._send_frame_to_vps(frame_data):
                    self.stats['frames_sent'] += 1
                
            except Exception as e:
                logger.error(f"Erro no processamento de frame: {e}")
                self.stats['errors'] += 1

    def _has_significant_motion(self, frame) -> bool:
        """Detectar movimento significativo no frame"""
        try:
            # Implementação simples de detecção de movimento
            if not hasattr(self, '_background_model'):
                self._background_model = cv2.createBackgroundSubtractorMOG2()
            
            # Aplicar o modelo de background
            fg_mask = self._background_model.apply(frame)
            
            # Contar pixels em movimento
            motion_pixels = cv2.countNonZero(fg_mask)
            
            threshold = self.config['processing']['motion_threshold']
            return motion_pixels > threshold
            
        except Exception:
            return True  # Em caso de erro, enviar o frame

    def _prepare_frame_for_upload(self, frame) -> Optional[Dict[str, Any]]:
        """Preparar frame para upload (compressão e encoding)"""
        try:
            # Aplicar ROI se configurado
            roi_config = self.config['processing']['roi']
            if roi_config['enabled']:
                h, w = frame.shape[:2]
                x1 = int(w * roi_config['x'] / 100)
                y1 = int(h * roi_config['y'] / 100)
                x2 = int(w * (roi_config['x'] + roi_config['width']) / 100)
                y2 = int(h * (roi_config['y'] + roi_config['height']) / 100)
                frame = frame[y1:y2, x1:x2]
            
            # Redimensionar se necessário para economizar bandwidth
            height, width = frame.shape[:2]
            if width > 1280:  # Redimensionar para HD se muito grande
                scale = 1280 / width
                new_width = int(width * scale)
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            # Comprimir como JPEG
            quality = self.server_config.compression_quality
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
            ret, buffer = cv2.imencode('.jpg', frame, encode_params)
            
            if not ret:
                return None
            
            # Verificar tamanho máximo
            if len(buffer) > self.server_config.max_frame_size:
                logger.warning(f"Frame muito grande: {len(buffer)} bytes")
                return None
            
            # Codificar em base64 para JSON
            frame_b64 = base64.b64encode(buffer).decode('utf-8')
            
            return {
                'timestamp': datetime.now().isoformat(),
                'frame_data': frame_b64,
                'frame_size': len(buffer),
                'resolution': f"{frame.shape[1]}x{frame.shape[0]}",
                'bridge_id': 'main_camera'
            }
            
        except Exception as e:
            logger.error(f"Erro ao preparar frame: {e}")
            return None

    def _send_frame_to_vps(self, frame_data: Dict[str, Any]) -> bool:
        """Enviar frame para o VPS"""
        try:
            url = f"{self.server_config.vps_url}{self.server_config.upload_endpoint}"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.server_config.api_key}'
            }
            
            response = requests.post(
                url, 
                json=frame_data, 
                headers=headers, 
                timeout=10
            )
            
            if response.status_code == 200:
                return True
            else:
                logger.warning(f"VPS retornou status {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao enviar frame para VPS: {e}")
            return False

    def send_heartbeat(self):
        """Enviar heartbeat para o VPS"""
        try:
            url = f"{self.server_config.vps_url}{self.server_config.heartbeat_endpoint}"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.server_config.api_key}'
            }
            
            # Coletar informações do sistema
            system_info = {
                'bridge_id': 'main_camera',
                'timestamp': datetime.now().isoformat(),
                'status': self.stats['connection_status'],
                'stats': self.stats.copy(),
                'system': {
                    'cpu_percent': psutil.cpu_percent(),
                    'memory_percent': psutil.virtual_memory().percent,
                    'disk_percent': psutil.disk_usage('.').percent
                }
            }
            
            response = requests.post(
                url, 
                json=system_info, 
                headers=headers, 
                timeout=5
            )
            
            if response.status_code == 200:
                self.stats['last_heartbeat'] = datetime.now().strftime('%H:%M:%S')
                logger.debug("Heartbeat enviado com sucesso")
            else:
                logger.warning(f"Heartbeat falhou: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Erro ao enviar heartbeat: {e}")

    def heartbeat_worker(self):
        """Worker thread para enviar heartbeats periódicos"""
        while self.is_running:
            self.send_heartbeat()
            time.sleep(self.server_config.heartbeat_interval)

    def start(self):
        """Iniciar o bridge"""
        logger.info("Iniciando Camera Bridge...")
        
        self.is_running = True
        
        # Iniciar threads
        self.capture_thread = threading.Thread(target=self.capture_frames, daemon=True)
        self.process_thread = threading.Thread(target=self.process_and_send_frames, daemon=True)
        self.heartbeat_thread = threading.Thread(target=self.heartbeat_worker, daemon=True)
        
        self.capture_thread.start()
        self.process_thread.start()
        self.heartbeat_thread.start()
        
        # Iniciar servidor Flask
        streaming_config = self.config['streaming']
        flask_port = streaming_config.get('mjpeg_port', 8080)
        
        logger.info(f"Servidor local disponível em http://localhost:{flask_port}")
        self.app.run(host='0.0.0.0', port=flask_port, debug=False, threaded=True)

    def stop(self):
        """Parar o bridge"""
        logger.info("Parando Camera Bridge...")
        self.is_running = False
        self.disconnect_camera()

def main():
    """Função principal"""
    bridge = CameraBridge()
    
    try:
        bridge.start()
    except KeyboardInterrupt:
        logger.info("Interrupção pelo usuário")
    except Exception as e:
        logger.error(f"Erro fatal: {e}")
    finally:
        bridge.stop()

if __name__ == "__main__":
    main()