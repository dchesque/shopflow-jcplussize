"""
🎥 ShopFlow Camera Bridge v1.0
Sistema de captura RTSP para câmera Intelbras Mibo
Envia frames para processamento YOLO11 no servidor
"""

import cv2
import requests
import numpy as np
from datetime import datetime
import time
import json
import threading
import os
from queue import Queue
import configparser
import logging
from PIL import Image
import io
import sys

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/bridge.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class IntelbrasRTSPBridge:
    def __init__(self, config_file='config.ini'):
        """Inicializa bridge com configurações"""
        self.config = configparser.ConfigParser()
        self.config.read(config_file)
        
        # Configurações da câmera
        self.rtsp_url = self.config.get('camera', 'rtsp_url')
        self.rtsp_fallback = self.config.get('camera', 'rtsp_fallback', fallback=None)
        self.username = self.config.get('camera', 'username')
        self.password = self.config.get('camera', 'password')
        
        # Configurações do servidor
        self.api_url = self.config.get('server', 'api_url')
        self.api_key = self.config.get('server', 'api_key')
        
        # Configurações gerais
        self.fps = self.config.getint('settings', 'fps', fallback=15)
        self.quality = self.config.get('settings', 'quality', fallback='high')
        self.reconnect_timeout = self.config.getint('settings', 'reconnect_timeout', fallback=10)
        
        # Estado interno
        self.cap = None
        self.running = False
        self.frame_queue = Queue(maxsize=5)
        self.stats = {
            'frames_sent': 0,
            'errors': 0,
            'last_success': None,
            'start_time': datetime.now()
        }
        
        # Criar diretórios necessários
        os.makedirs('logs', exist_ok=True)
        os.makedirs('cache', exist_ok=True)
        
        logging.info('🎥 Bridge inicializada - Câmera: 192.168.1.52')
        
    def connect_camera(self):
        """Conecta na câmera Intelbras Mibo via RTSP"""
        try:
            logging.info('🔗 Conectando na câmera...')
            
            # Monta URL completa com credenciais
            if '://' in self.rtsp_url:
                protocol, rest = self.rtsp_url.split('://', 1)
                full_url = f"{protocol}://{self.username}:{self.password}@{rest}"
            else:
                full_url = self.rtsp_url
            
            # Tenta URL principal
            self.cap = cv2.VideoCapture(full_url)
            
            if not self.cap.isOpened() and self.rtsp_fallback:
                logging.warning('⚠️ URL principal falhou, tentando fallback...')
                if '://' in self.rtsp_fallback:
                    protocol, rest = self.rtsp_fallback.split('://', 1)
                    fallback_url = f"{protocol}://{self.username}:{self.password}@{rest}"
                else:
                    fallback_url = self.rtsp_fallback
                self.cap = cv2.VideoCapture(fallback_url)
            
            if self.cap.isOpened():
                # Otimizações para RTSP
                self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                self.cap.set(cv2.CAP_PROP_FPS, self.fps)
                
                # Configurações de qualidade
                if self.quality == 'high':
                    self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
                    self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
                elif self.quality == 'medium':
                    self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                    self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                else:  # low
                    self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                
                ret, frame = self.cap.read()
                if ret:
                    h, w, c = frame.shape
                    logging.info(f'✅ Câmera conectada - Resolução: {w}x{h}')
                    return True
                else:
                    logging.error('❌ Não foi possível ler frame inicial')
                    self.cap.release()
                    self.cap = None
                    return False
            else:
                logging.error('❌ Falha ao conectar na câmera RTSP')
                return False
                
        except Exception as e:
            logging.error(f'❌ Erro ao conectar câmera: {e}')
            if self.cap:
                self.cap.release()
            self.cap = None
            return False
    
    def capture_loop(self):
        """Loop de captura de frames"""
        last_frame_time = 0
        frame_interval = 1.0 / self.fps
        
        while self.running:
            try:
                if not self.cap or not self.cap.isOpened():
                    logging.warning('📷 Câmera desconectada, tentando reconectar...')
                    if self.connect_camera():
                        continue
                    else:
                        time.sleep(self.reconnect_timeout)
                        continue
                
                current_time = time.time()
                if current_time - last_frame_time < frame_interval:
                    time.sleep(0.01)
                    continue
                
                ret, frame = self.cap.read()
                          
                if ret and frame is not None:
                    # Adiciona frame na fila
                    if not self.frame_queue.full():
                        self.frame_queue.put({
                            'frame': frame,
                            'timestamp': datetime.now()
                        })
                        last_frame_time = current_time
                    else:
                        # Remove frame antigo se fila cheia
                        try:
                            self.frame_queue.get_nowait()
                        except:
                            pass
                        
                        self.frame_queue.put({
                            'frame': frame,
                            'timestamp': datetime.now()
                        })
                else:
                    logging.warning('⚠️ Frame perdido, reconectando...')
                    self.cap.release()
                    self.cap = None
                    
            except Exception as e:
                logging.error(f'❌ Erro na captura: {e}')
                if self.cap:
                    self.cap.release()
                self.cap = None
                time.sleep(2)
    
    def send_loop(self):
        """Envia frames para o servidor"""
        session = requests.Session()
        session.headers.update({'Authorization': f'Bearer {self.api_key}'})
        
        while self.running:
            try:
                if self.frame_queue.empty():
                    time.sleep(0.01)
                    continue
                
                # Pega frame da fila
                frame_data = self.frame_queue.get()
                frame = frame_data['frame']
                timestamp = frame_data['timestamp']
                
                # Converte para JPEG
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                _, buffer = cv2.imencode('.jpg', frame, encode_param)
                
                # Prepara dados para envio
                files = {
                    'frame': ('frame.jpg', buffer.tobytes(), 'image/jpeg')
                }
                
                payload = {
                    'timestamp': timestamp.isoformat(),
                    'camera_id': 'intelbras_mibo_192_168_1_52'
                }
                
                # Envia para o servidor
                response = session.post(
                    f'{self.api_url}/api/camera/process',
                    files=files,
                    data=payload,
                    timeout=5
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('people_count') is not None:
                        self.stats['frames_sent'] += 1
                        self.stats['last_success'] = datetime.now()
                        logging.info(f'👥 Pessoas detectadas: {result["people_count"]} | Frames enviados: {self.stats["frames_sent"]}')
                else:
                    self.stats['errors'] += 1
                    logging.error(f'❌ Erro HTTP {response.status_code}: {response.text}')
                
            except requests.exceptions.RequestException as e:
                self.stats['errors'] += 1
                logging.error(f'🌐 Erro de rede: {e}')
            except Exception as e:
                self.stats['errors'] += 1
                logging.error(f'❌ Erro no envio: {e}')
            
            time.sleep(0.05)  # ~20 FPS max
    
    def stats_loop(self):
        """Loop de estatísticas"""
        while self.running:
            uptime = datetime.now() - self.stats['start_time']
            fps_atual = self.stats['frames_sent'] / max(uptime.total_seconds(), 1)
            
            logging.info(f'📊 Stats: {self.stats["frames_sent"]} frames | {fps_atual:.1f} fps | {self.stats["errors"]} erros | Uptime: {uptime}')
            time.sleep(30)  # Stats a cada 30s
    
    def start(self):
        """Inicia a bridge"""
        logging.info('🚀 Iniciando ShopFlow Bridge...')
        self.running = True
        
        # Conecta na câmera
        if not self.connect_camera():
            logging.error('❌ Falha crítica: não foi possível conectar na câmera')
            return False
        
        # Thread de captura
        capture_thread = threading.Thread(target=self.capture_loop, daemon=True)
        capture_thread.start()
        
        # Thread de envio
        send_thread = threading.Thread(target=self.send_loop, daemon=True)
        send_thread.start()
        
        # Thread de estatísticas
        stats_thread = threading.Thread(target=self.stats_loop, daemon=True)
        stats_thread.start()
        
        logging.info('✅ Bridge iniciada com sucesso!')
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            logging.info('🛑 Parando bridge...')
            self.stop()
        
        return True
    
    def stop(self):
        """Para a bridge"""
        self.running = False
        if self.cap:
            self.cap.release()
        logging.info('🛑 Bridge parada')

def main():
    """Função principal"""
    print("""
    =====================================
      🎥 ShopFlow Camera Bridge v1.0
      Câmera: Intelbras Mibo 192.168.1.52
    =====================================
    """)
    
    # Verifica se arquivo de configuração existe
    if not os.path.exists('config.ini'):
        logging.error('❌ Arquivo config.ini não encontrado!')
        logging.error('💡 Execute install_windows.bat primeiro')
        input('Pressione Enter para sair...')
        return
    
    # Inicia bridge
    bridge = IntelbrasRTSPBridge()
    
    try:
        bridge.start()
    except Exception as e:
        logging.error(f'❌ Erro fatal: {e}')
        input('Pressione Enter para sair...')
    finally:
        bridge.stop()

if __name__ == '__main__':
    main()