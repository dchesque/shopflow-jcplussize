"""
🎥 ShopFlow Camera Bridge v2.0 - REVISADO
Sistema de captura RTSP para câmera Intelbras Mibo
Compatível com backend EasyPanel em produção
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
import base64
import signal

# Configuração de logging
os.makedirs('logs', exist_ok=True)
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
        self.username = self.config.get('camera', 'username', fallback='admin')
        self.password = self.config.get('camera', 'password', fallback='')
        
        # Configurações do servidor
        self.api_url = self.config.get('server', 'api_url')
        self.api_key = self.config.get('server', 'api_key')
        
        # Configurações gerais
        self.fps = self.config.getint('settings', 'fps', fallback=15)
        self.quality = self.config.get('settings', 'quality', fallback='high')
        self.reconnect_timeout = self.config.getint('settings', 'reconnect_timeout', fallback=10)
        self.bridge_id = self.config.get('settings', 'bridge_id', fallback='BRIDGE-001')
        
        # Estado interno
        self.cap = None
        self.running = False
        self.frame_queue = Queue(maxsize=10)
        self.stats = {
            'frames_captured': 0,
            'frames_sent': 0,
            'errors': 0,
            'last_success': None,
            'start_time': datetime.now(),
            'connection_status': 'disconnected',
            'last_error': None
        }
        
        # Criar diretórios necessários
        os.makedirs('logs', exist_ok=True)
        os.makedirs('cache', exist_ok=True)
        
        # Configurar sinais para shutdown gracioso
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        logging.info(f'🎥 Bridge {self.bridge_id} inicializada - Backend: {self.api_url}')
    
    def _signal_handler(self, sig, frame):
        """Handler para shutdown gracioso"""
        logging.info('🛑 Sinal de parada recebido...')
        self.stop()
        sys.exit(0)
        
    def connect_camera(self):
        """Conecta na câmera Intelbras Mibo via RTSP"""
        try:
            logging.info(f'🔗 Conectando na câmera: {self.rtsp_url.split("@")[-1]}...')
            
            # Monta URL completa com credenciais
            if '@' not in self.rtsp_url and self.username:
                if '://' in self.rtsp_url:
                    protocol, rest = self.rtsp_url.split('://', 1)
                    full_url = f"{protocol}://{self.username}:{self.password}@{rest}"
                else:
                    full_url = self.rtsp_url
            else:
                full_url = self.rtsp_url
            
            # Configurações otimizadas para OpenCV com RTSP
            os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"
            
            # Tenta URL principal
            self.cap = cv2.VideoCapture(full_url, cv2.CAP_FFMPEG)
            
            # Timeout para conexão
            self.cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000)
            self.cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSEC, 5000)
            
            if not self.cap.isOpened() and self.rtsp_fallback:
                logging.warning('⚠️ URL principal falhou, tentando fallback...')
                if '@' not in self.rtsp_fallback and self.username:
                    if '://' in self.rtsp_fallback:
                        protocol, rest = self.rtsp_fallback.split('://', 1)
                        fallback_url = f"{protocol}://{self.username}:{self.password}@{rest}"
                    else:
                        fallback_url = self.rtsp_fallback
                else:
                    fallback_url = self.rtsp_fallback
                    
                self.cap = cv2.VideoCapture(fallback_url, cv2.CAP_FFMPEG)
            
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
                
                # Testa leitura
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    h, w, c = frame.shape
                    logging.info(f'✅ Câmera conectada - Resolução: {w}x{h} | FPS: {self.fps}')
                    self.stats['connection_status'] = 'connected'
                    return True
                else:
                    logging.error('❌ Não foi possível ler frame inicial')
                    self.cap.release()
                    self.cap = None
                    return False
            else:
                logging.error('❌ Falha ao conectar na câmera RTSP')
                self.stats['last_error'] = 'Connection failed'
                return False
                
        except Exception as e:
            logging.error(f'❌ Erro ao conectar câmera: {e}')
            self.stats['last_error'] = str(e)
            if self.cap:
                self.cap.release()
            self.cap = None
            return False
    
    def encode_frame_to_base64(self, frame):
        """Codifica frame para base64"""
        try:
            # Comprimir frame como JPEG
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
            result, encoded = cv2.imencode('.jpg', frame, encode_param)
            
            if result:
                # Converter para base64
                frame_bytes = encoded.tobytes()
                frame_base64 = base64.b64encode(frame_bytes).decode('utf-8')
                return frame_base64, len(frame_bytes)
            return None, 0
            
        except Exception as e:
            logging.error(f'Erro ao codificar frame: {e}')
            return None, 0
    
    def capture_loop(self):
        """Loop de captura de frames"""
        last_frame_time = 0
        frame_interval = 1.0 / self.fps
        consecutive_errors = 0
        
        while self.running:
            try:
                # Verifica conexão
                if not self.cap or not self.cap.isOpened():
                    self.stats['connection_status'] = 'reconnecting'
                    logging.warning('📷 Câmera desconectada, tentando reconectar...')
                    if self.connect_camera():
                        consecutive_errors = 0
                        continue
                    else:
                        time.sleep(self.reconnect_timeout)
                        consecutive_errors += 1
                        if consecutive_errors > 10:
                            logging.error('❌ Muitas tentativas falhadas, aumentando timeout...')
                            time.sleep(30)
                        continue
                
                # Controle de FPS
                current_time = time.time()
                if current_time - last_frame_time < frame_interval:
                    time.sleep(0.01)
                    continue
                
                # Captura frame
                ret, frame = self.cap.read()
                
                if ret and frame is not None:
                    self.stats['frames_captured'] += 1
                    consecutive_errors = 0
                    
                    # Adiciona frame na fila
                    if not self.frame_queue.full():
                        self.frame_queue.put({
                            'frame': frame.copy(),
                            'timestamp': datetime.now().isoformat()
                        })
                        last_frame_time = current_time
                    else:
                        # Remove frame mais antigo se fila cheia
                        try:
                            self.frame_queue.get_nowait()
                            self.frame_queue.put({
                                'frame': frame.copy(),
                                'timestamp': datetime.now().isoformat()
                            })
                        except:
                            pass
                else:
                    consecutive_errors += 1
                    if consecutive_errors > 30:
                        logging.error('❌ Muitos erros de leitura, reconectando...')
                        self.cap.release()
                        self.cap = None
                        
            except Exception as e:
                logging.error(f'❌ Erro no loop de captura: {e}')
                consecutive_errors += 1
                time.sleep(1)
    
    def send_to_api(self, frame_data):
        """Envia frame para API usando multipart/form-data"""
        try:
            frame = frame_data['frame']
            timestamp = frame_data['timestamp']
            
            # Codifica frame como JPEG
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
            result, encoded = cv2.imencode('.jpg', frame, encode_param)
            
            if not result:
                logging.error('Erro ao codificar frame')
                return None
            
            # Prepara dados para envio
            files = {
                'frame': ('frame.jpg', encoded.tobytes(), 'image/jpeg')
            }
            
            data = {
                'timestamp': timestamp,
                'camera_id': self.bridge_id
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}'
            }
            
            # Envia para API
            url = f"{self.api_url}/api/camera/process"
            response = requests.post(
                url,
                files=files,
                data=data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logging.error(f'API retornou status {response.status_code}: {response.text}')
                return None
                
        except Exception as e:
            logging.error(f'Erro ao enviar para API: {e}')
            return None
    
    def send_to_api_base64(self, frame_data):
        """Envia frame para API usando base64 (método alternativo)"""
        try:
            frame = frame_data['frame']
            timestamp = frame_data['timestamp']
            
            # Codifica frame para base64
            frame_base64, frame_size = self.encode_frame_to_base64(frame)
            
            if not frame_base64:
                return None
            
            # Prepara payload
            h, w = frame.shape[:2]
            payload = {
                'timestamp': timestamp,
                'frame_data': frame_base64,
                'frame_size': frame_size,
                'resolution': f'{w}x{h}',
                'bridge_id': self.bridge_id,
                'metadata': {
                    'fps': self.fps,
                    'quality': self.quality
                }
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            # Envia para endpoint de bridge
            url = f"{self.api_url}/api/bridge/frames"
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logging.error(f'API retornou status {response.status_code}')
                return None
                
        except Exception as e:
            logging.error(f'Erro ao enviar frame base64: {e}')
            return None
    
    def send_loop(self):
        """Loop de envio de frames para API"""
        while self.running:
            try:
                if self.frame_queue.empty():
                    time.sleep(0.05)
                    continue
                
                # Pega frame da fila
                frame_data = self.frame_queue.get(timeout=1)
                
                # Tenta enviar primeiro como multipart (método preferido)
                result = self.send_to_api(frame_data)
                
                # Se falhar, tenta com base64
                if not result:
                    result = self.send_to_api_base64(frame_data)
                
                if result:
                    self.stats['frames_sent'] += 1
                    self.stats['last_success'] = datetime.now()
                    
                    # Log de sucesso
                    if result.get('people_count') is not None:
                        logging.info(f'👥 Frame processado - Pessoas: {result.get("people_count")} | Total enviados: {self.stats["frames_sent"]}')
                    elif result.get('detections') is not None:
                        logging.info(f'📊 Frame processado - Detecções: {result.get("detections")} | Total enviados: {self.stats["frames_sent"]}')
                else:
                    self.stats['errors'] += 1
                    
            except Exception as e:
                self.stats['errors'] += 1
                if "timeout" not in str(e).lower():
                    logging.error(f'❌ Erro no envio: {e}')
                time.sleep(0.1)
    
    def heartbeat_loop(self):
        """Envia heartbeat para servidor"""
        while self.running:
            try:
                # Prepara dados do heartbeat
                uptime = (datetime.now() - self.stats['start_time']).total_seconds()
                
                heartbeat_data = {
                    'bridge_id': self.bridge_id,
                    'timestamp': datetime.now().isoformat(),
                    'status': self.stats['connection_status'],
                    'stats': {
                        'frames_captured': self.stats['frames_captured'],
                        'frames_sent': self.stats['frames_sent'],
                        'errors': self.stats['errors'],
                        'uptime_seconds': int(uptime),
                        'queue_size': self.frame_queue.qsize()
                    },
                    'system': {
                        'fps_target': self.fps,
                        'quality': self.quality,
                        'last_error': self.stats.get('last_error')
                    }
                }
                
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                # Envia heartbeat
                url = f"{self.api_url}/api/bridge/heartbeat"
                response = requests.post(
                    url,
                    json=heartbeat_data,
                    headers=headers,
                    timeout=5
                )
                
                if response.status_code == 200:
                    logging.debug('💓 Heartbeat enviado com sucesso')
                    
            except Exception as e:
                logging.debug(f'Erro no heartbeat: {e}')
                
            time.sleep(30)  # Heartbeat a cada 30 segundos
    
    def stats_loop(self):
        """Loop de estatísticas"""
        while self.running:
            try:
                uptime = datetime.now() - self.stats['start_time']
                fps_capture = self.stats['frames_captured'] / max(uptime.total_seconds(), 1)
                fps_send = self.stats['frames_sent'] / max(uptime.total_seconds(), 1)
                success_rate = (self.stats['frames_sent'] / max(self.stats['frames_captured'], 1)) * 100
                
                logging.info(
                    f'📊 Stats | Captura: {self.stats["frames_captured"]} ({fps_capture:.1f} fps) | '
                    f'Enviados: {self.stats["frames_sent"]} ({fps_send:.1f} fps) | '
                    f'Taxa: {success_rate:.1f}% | '
                    f'Erros: {self.stats["errors"]} | '
                    f'Fila: {self.frame_queue.qsize()} | '
                    f'Uptime: {uptime}'
                )
                
            except Exception as e:
                logging.error(f'Erro ao gerar estatísticas: {e}')
                
            time.sleep(60)  # Stats a cada minuto
    
    def start(self):
        """Inicia a bridge"""
        logging.info('🚀 Iniciando ShopFlow Bridge v2.0...')
        logging.info(f'📡 Backend: {self.api_url}')
        logging.info(f'🔑 Bridge ID: {self.bridge_id}')
        
        self.running = True
        
        # Testa conexão com API
        try:
            test_url = f"{self.api_url}/api/camera/test"
            headers = {'Authorization': f'Bearer {self.api_key}'}
            response = requests.post(test_url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                logging.info('✅ Conexão com API verificada')
            else:
                logging.warning(f'⚠️ API retornou status {response.status_code}')
        except Exception as e:
            logging.warning(f'⚠️ Não foi possível verificar API: {e}')
            logging.info('Continuando mesmo assim...')
        
        # Conecta na câmera
        if not self.connect_camera():
            logging.error('❌ Falha ao conectar na câmera - tentando continuar...')
        
        # Inicia threads
        threads = []
        
        # Thread de captura
        capture_thread = threading.Thread(target=self.capture_loop, daemon=True, name="CaptureThread")
        capture_thread.start()
        threads.append(capture_thread)
        
        # Thread de envio
        send_thread = threading.Thread(target=self.send_loop, daemon=True, name="SendThread")
        send_thread.start()
        threads.append(send_thread)
        
        # Thread de heartbeat
        heartbeat_thread = threading.Thread(target=self.heartbeat_loop, daemon=True, name="HeartbeatThread")
        heartbeat_thread.start()
        threads.append(heartbeat_thread)
        
        # Thread de estatísticas
        stats_thread = threading.Thread(target=self.stats_loop, daemon=True, name="StatsThread")
        stats_thread.start()
        threads.append(stats_thread)
        
        logging.info('✅ Bridge iniciada com sucesso!')
        logging.info('Pressione Ctrl+C para parar...')
        
        # Loop principal
        try:
            while self.running:
                # Verifica se threads estão vivas
                for thread in threads:
                    if not thread.is_alive():
                        logging.error(f'❌ Thread {thread.name} morreu! Reiniciando...')
                        # Aqui você poderia reiniciar a thread se necessário
                
                time.sleep(1)
                
        except KeyboardInterrupt:
            logging.info('🛑 Parando bridge...')
            self.stop()
    
    def stop(self):
        """Para a bridge"""
        self.running = False
        
        # Libera câmera
        if self.cap:
            self.cap.release()
            
        # Limpa fila
        while not self.frame_queue.empty():
            try:
                self.frame_queue.get_nowait()
            except:
                pass
        
        logging.info('🛑 Bridge parada com sucesso')

def main():
    """Função principal"""
    print("""
    ╔══════════════════════════════════════╗
    ║   🎥 ShopFlow Camera Bridge v2.0    ║
    ║   Sistema de Captura RTSP           ║
    ║   Compatível com Backend EasyPanel  ║
    ╚══════════════════════════════════════╝
    """)
    
    # Verifica arquivo de configuração
    if not os.path.exists('config.ini'):
        logging.error('❌ Arquivo config.ini não encontrado!')
        logging.info('Criando arquivo de exemplo...')
        
        # Cria config.ini de exemplo
        example_config = """[camera]
# Câmera Intelbras Mibo
rtsp_url = rtsp://192.168.1.52:554/cam/realmonitor?channel=1&subtype=0
rtsp_fallback = rtsp://192.168.1.52:554/cam/realmonitor?channel=1&subtype=1
username = admin
password = sua_senha_aqui

[server]
# Backend EasyPanel
api_url = https://api-shopflow.hshars.easypanel.host
api_key = bridge_api_key_123

[settings]
fps = 15
quality = high
reconnect_timeout = 10
bridge_id = BRIDGE-001
"""
        
        with open('config.ini.example', 'w') as f:
            f.write(example_config)
            
        logging.info('📝 Arquivo config.ini.example criado!')
        logging.info('Copie para config.ini e configure suas credenciais')
        return
    
    # Inicia bridge
    bridge = IntelbrasRTSPBridge()
    
    try:
        bridge.start()
    except Exception as e:
        logging.error(f'❌ Erro fatal: {e}')
        bridge.stop()

if __name__ == "__main__":
    main()c