"""
ShopFlow Multi-Camera Bridge v3.0 - COMPLETO
Sistema avançado de captura RTSP com suporte multi-câmera, frame skip e dashboard web
Compatível com backend EasyPanel e otimizado para ambiente comercial
"""

import cv2
import requests
import numpy as np
from datetime import datetime, timedelta
import time
import json
import threading
import os
from queue import Queue
import logging
from PIL import Image
import io
import sys
import base64
import signal
from flask import Flask, render_template, jsonify, request, Response, send_file
from flask_cors import CORS
import socket
from threading import Lock
from collections import defaultdict
import psutil
from dotenv import load_dotenv

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

class CameraHandler:
    """Classe para gerenciar uma câmera individual"""

    def __init__(self, camera_id, api_url, api_key, bridge_id):
        self.camera_id = camera_id
        self.camera_num = camera_id.replace('camera', '')
        self.api_url = api_url
        self.api_key = api_key
        self.bridge_id = bridge_id

        # Configurações da câmera via .env
        camera_prefix = f'CAMERA{self.camera_num}_'
        self.enabled = os.getenv(f'{camera_prefix}ENABLED', 'false').lower() == 'true'
        self.rtsp_url = os.getenv(f'{camera_prefix}RTSP_URL', '')
        self.rtsp_fallback = os.getenv(f'{camera_prefix}RTSP_FALLBACK')
        self.username = os.getenv(f'{camera_prefix}USERNAME', 'admin')
        self.password = os.getenv(f'{camera_prefix}PASSWORD', '')
        self.location = os.getenv(f'{camera_prefix}LOCATION', f'Camera {self.camera_num}')
        self.fps = int(os.getenv(f'{camera_prefix}FPS', '10'))
        self.quality = os.getenv(f'{camera_prefix}QUALITY', 'medium')
        self.frame_skip = int(os.getenv(f'{camera_prefix}FRAME_SKIP', '1'))
        
        # Estado interno
        self.cap = None
        self.running = False
        self.frame_queue = Queue(maxsize=5)
        self.stats_lock = Lock()
        
        # Estatísticas
        self.stats = {
            'frames_captured': 0,
            'frames_queued': 0,
            'frames_sent': 0,
            'frames_skipped': 0,
            'errors': 0,
            'last_success': None,
            'start_time': datetime.now(),
            'connection_status': 'disconnected',
            'last_error': None,
            'current_fps': 0.0,
            'uptime_seconds': 0,
            'success_rate': 0.0
        }
        
        # Controle de frame skip
        self.frame_counter = 0
        
        # Buffer para visualização (snapshots e streaming)
        self.latest_frame = None
        self.frame_lock = Lock()
        
        logging.info(f'[CAM] [{self.camera_id}-{self.location}] Inicializada - FPS: {self.fps} | Skip: {self.frame_skip} | Ativa: {self.enabled}')
    
    def connect_camera(self):
        """Conecta na câmera RTSP"""
        if not self.enabled:
            return False
            
        try:
            logging.info(f'[CONN] [{self.camera_id}] Conectando: {self.rtsp_url.split("@")[-1]}...')
            
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
                logging.warning(f'[WARN] [{self.camera_id}] URL principal falhou, tentando fallback...')
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
                    logging.info(f'[OK] [{self.camera_id}-{self.location}] Conectada - {w}x{h} @ {self.fps} FPS (skip: {self.frame_skip})')
                    with self.stats_lock:
                        self.stats['connection_status'] = 'connected'
                    return True
                else:
                    logging.error(f'[ERRO] [{self.camera_id}] Não foi possível ler frame inicial')
                    self.cap.release()
                    self.cap = None
                    return False
            else:
                logging.error(f'[ERRO] [{self.camera_id}] Falha ao conectar RTSP')
                with self.stats_lock:
                    self.stats['last_error'] = 'Connection failed'
                return False
                
        except Exception as e:
            logging.error(f'[ERRO] [{self.camera_id}] Erro ao conectar: {e}')
            with self.stats_lock:
                self.stats['last_error'] = str(e)
            if self.cap:
                self.cap.release()
            self.cap = None
            return False
    
    def capture_loop(self):
        """Loop de captura com frame skip"""
        last_frame_time = 0
        frame_interval = 1.0 / self.fps
        consecutive_errors = 0
        fps_samples = []
        last_fps_calc = time.time()
        
        while self.running:
            try:
                # Verifica se câmera está habilitada
                if not self.enabled:
                    time.sleep(1)
                    continue
                
                # Verifica conexão
                if not self.cap or not self.cap.isOpened():
                    with self.stats_lock:
                        self.stats['connection_status'] = 'reconnecting'
                    logging.warning(f'[CAM] [{self.camera_id}] Desconectada, tentando reconectar...')
                    if self.connect_camera():
                        consecutive_errors = 0
                        continue
                    else:
                        time.sleep(10)
                        consecutive_errors += 1
                        if consecutive_errors > 10:
                            logging.error(f'[ERRO] [{self.camera_id}] Muitas tentativas falhadas, aumentando timeout...')
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
                    # Atualizar buffer do último frame para visualização
                    with self.frame_lock:
                        self.latest_frame = frame.copy()
                    
                    with self.stats_lock:
                        self.stats['frames_captured'] += 1
                    consecutive_errors = 0
                    
                    # Incrementa contador para frame skip
                    self.frame_counter += 1
                    
                    # Implementa frame skip: só processa frame se for múltiplo do skip
                    if self.frame_counter % self.frame_skip == 0:
                        # Adiciona frame na fila
                        if not self.frame_queue.full():
                            self.frame_queue.put({
                                'frame': frame.copy(),
                                'timestamp': datetime.now().isoformat(),
                                'camera_id': self.camera_id,
                                'location': self.location
                            })
                            with self.stats_lock:
                                self.stats['frames_queued'] += 1
                        else:
                            # Remove frame mais antigo se fila cheia
                            try:
                                self.frame_queue.get_nowait()
                                self.frame_queue.put({
                                    'frame': frame.copy(),
                                    'timestamp': datetime.now().isoformat(),
                                    'camera_id': self.camera_id,
                                    'location': self.location
                                })
                                with self.stats_lock:
                                    self.stats['frames_queued'] += 1
                            except:
                                pass
                    else:
                        # Frame pulado devido ao skip
                        with self.stats_lock:
                            self.stats['frames_skipped'] += 1
                    
                    last_frame_time = current_time
                    
                    # Calcula FPS atual a cada 5 segundos
                    if current_time - last_fps_calc >= 5.0:
                        if fps_samples:
                            avg_fps = len(fps_samples) / 5.0
                            with self.stats_lock:
                                self.stats['current_fps'] = round(avg_fps, 1)
                        fps_samples = []
                        last_fps_calc = current_time
                    fps_samples.append(current_time)
                    
                else:
                    consecutive_errors += 1
                    if consecutive_errors > 30:
                        logging.error(f'[ERRO] [{self.camera_id}] Muitos erros de leitura, reconectando...')
                        self.cap.release()
                        self.cap = None
                        
            except Exception as e:
                logging.error(f'[ERRO] [{self.camera_id}] Erro no loop de captura: {e}')
                consecutive_errors += 1
                time.sleep(1)
    
    def send_to_api(self, frame_data):
        """Envia frame para API"""
        try:
            frame = frame_data['frame']
            timestamp = frame_data['timestamp']
            
            # Codifica frame como JPEG
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
            result, encoded = cv2.imencode('.jpg', frame, encode_param)
            
            if not result:
                return None
            
            # Prepara dados para envio
            files = {
                'frame': ('frame.jpg', encoded.tobytes(), 'image/jpeg')
            }
            
            data = {
                'timestamp': timestamp,
                'camera_id': self.camera_id,
                'location': self.location,
                'bridge_id': self.bridge_id
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
                logging.error(f'[{self.camera_id}] API retornou status {response.status_code}')
                return None
                
        except Exception as e:
            logging.error(f'[{self.camera_id}] Erro ao enviar para API: {e}')
            return None
    
    def send_loop(self):
        """Loop de envio de frames"""
        while self.running:
            try:
                if not self.enabled:
                    time.sleep(1)
                    continue
                    
                if self.frame_queue.empty():
                    time.sleep(0.05)
                    continue
                
                # Pega frame da fila
                frame_data = self.frame_queue.get(timeout=1)
                
                # Envia frame
                result = self.send_to_api(frame_data)
                
                if result:
                    with self.stats_lock:
                        self.stats['frames_sent'] += 1
                        self.stats['last_success'] = datetime.now()
                    
                    # Log ocasional de sucesso
                    if self.stats['frames_sent'] % 50 == 0:
                        people_count = result.get('people_count', 0)
                        logging.info(f'👥 [{self.camera_id}-{self.location}] Pessoas: {people_count} | Enviados: {self.stats["frames_sent"]}')
                else:
                    with self.stats_lock:
                        self.stats['errors'] += 1
                        
            except Exception as e:
                with self.stats_lock:
                    self.stats['errors'] += 1
                if "timeout" not in str(e).lower():
                    logging.error(f'[ERRO] [{self.camera_id}] Erro no envio: {e}')
                time.sleep(0.1)
    
    def get_stats(self):
        """Retorna estatísticas atuais"""
        with self.stats_lock:
            stats = self.stats.copy()
            
        # Calcula estatísticas derivadas
        uptime = datetime.now() - stats['start_time']
        stats['uptime_seconds'] = int(uptime.total_seconds())
        
        if stats['frames_captured'] > 0:
            stats['success_rate'] = (stats['frames_sent'] / stats['frames_captured']) * 100
        else:
            stats['success_rate'] = 0.0
            
        stats['queue_size'] = self.frame_queue.qsize()
        stats['enabled'] = self.enabled
        stats['location'] = self.location
        
        return stats
    
    def start(self):
        """Inicia threads da câmera"""
        if not self.enabled:
            logging.info(f'[CAM] [{self.camera_id}-{self.location}] Desabilitada - não iniciando')
            return
            
        logging.info(f'[INIT] [{self.camera_id}-{self.location}] Iniciando threads...')
        self.running = True
        
        # Thread de captura
        self.capture_thread = threading.Thread(target=self.capture_loop, daemon=True, name=f"Capture-{self.camera_id}")
        self.capture_thread.start()
        
        # Thread de envio
        self.send_thread = threading.Thread(target=self.send_loop, daemon=True, name=f"Send-{self.camera_id}")
        self.send_thread.start()
        
        # Tenta conectar
        if not self.connect_camera():
            logging.warning(f'[WARN] [{self.camera_id}] Falha na conexão inicial - continuando com reconexão automática')
    
    def stop(self):
        """Para threads da câmera"""
        logging.info(f'🛑 [{self.camera_id}-{self.location}] Parando...')
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
    
    def toggle_enabled(self):
        """Alterna estado ativo/inativo da câmera"""
        self.enabled = not self.enabled
        logging.info(f'🔄 [{self.camera_id}-{self.location}] {"Ativada" if self.enabled else "Desativada"}')
        
        if self.enabled and not self.running:
            self.start()
        elif not self.enabled and self.cap:
            self.cap.release()
            self.cap = None
            with self.stats_lock:
                self.stats['connection_status'] = 'disabled'

class VideoStreamManager:
    """Gerenciador de streams de vídeo com lazy loading"""
    
    def __init__(self):
        self.active_streams = set()
        self.stream_clients = defaultdict(int)
        self.frame_buffers = {}
        self.lock = Lock()
        
    def is_stream_active(self, camera_id):
        """Verifica se stream está ativo"""
        with self.lock:
            return camera_id in self.active_streams
        
    def start_stream(self, camera_id):
        """Inicia stream para uma câmera"""
        with self.lock:
            self.active_streams.add(camera_id)
            self.stream_clients[camera_id] += 1
            logging.info(f'🎬 [{camera_id}] Stream iniciado - Clientes: {self.stream_clients[camera_id]}')
            
    def stop_stream(self, camera_id):
        """Para stream de uma câmera"""
        with self.lock:
            self.stream_clients[camera_id] = max(0, self.stream_clients[camera_id] - 1)
            if self.stream_clients[camera_id] == 0:
                self.active_streams.discard(camera_id)
                logging.info(f'⏹️ [{camera_id}] Stream parado')
                
    def get_active_streams(self):
        """Retorna lista de streams ativos"""
        with self.lock:
            return list(self.active_streams)
    
    def get_client_count(self, camera_id):
        """Retorna número de clientes assistindo uma câmera"""
        with self.lock:
            return self.stream_clients[camera_id]

class DashboardServer:
    """Servidor web para dashboard de monitoramento"""
    
    def __init__(self, bridge_instance, port=8888):
        self.bridge = bridge_instance
        self.port = port
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Gerenciador de streams de vídeo
        self.stream_manager = VideoStreamManager()
        
        # Configurar rotas existentes
        self.app.route('/')(self.index)
        self.app.route('/api/status')(self.api_status)
        self.app.route('/api/camera/<camera_id>')(self.api_camera_status)
        self.app.route('/api/camera/<camera_id>/restart', methods=['POST'])(self.api_camera_restart)
        self.app.route('/api/camera/<camera_id>/toggle', methods=['POST'])(self.api_camera_toggle)
        
        # Novas rotas de vídeo
        self.app.route('/api/snapshot/<camera_id>')(self.get_snapshot)
        self.app.route('/api/stream/<camera_id>')(self.video_stream)
        self.app.route('/api/stream/status')(self.stream_status)
        self.app.route('/api/stream/toggle/<camera_id>', methods=['POST'])(self.toggle_stream)
        
        # Desabilitar logs do Flask (muito verboso)
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)
    
    def index(self):
        """Página principal do dashboard com visualização de vídeo"""
        html_template = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopFlow Bridge Monitor v3.0</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f0f23; color: #cccccc; line-height: 1.6; min-height: 100vh; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { color: #00ff88; font-size: 2.5em; margin-bottom: 10px; text-shadow: 0 0 10px rgba(0, 255, 136, 0.3); }
        .header p { color: #888; font-size: 1.1em; }
        
        .nav-tabs { display: flex; justify-content: center; margin: 20px 0; border-bottom: 1px solid #333; }
        .nav-btn { background: transparent; color: #888; border: none; padding: 12px 24px; cursor: pointer; font-size: 16px; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
        .nav-btn:hover { color: #00ff88; background: rgba(0, 255, 136, 0.1); }
        .nav-btn.active { color: #00ff88; border-bottom-color: #00ff88; background: rgba(0, 255, 136, 0.1); }
        
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        .cameras-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .camera-card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 20px; border: 1px solid #333; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .camera-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); }
        .camera-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .camera-title { color: #ffffff; font-size: 1.2em; font-weight: bold; }
        .location { color: #888; font-size: 0.9em; }
        .status-indicator { width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 10px currentColor; }
        .status-online { background: #00ff88; }
        .status-reconnecting { background: #ffaa00; animation: pulse 1.5s infinite; }
        .status-offline { background: #ff4444; }
        .status-disabled { background: #666666; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
        .stat-item { background: rgba(255, 255, 255, 0.05); padding: 8px 12px; border-radius: 6px; font-size: 0.9em; }
        .stat-label { color: #888; font-size: 0.8em; display: block; }
        .stat-value { color: #ffffff; font-weight: bold; }
        .progress-bar { background: #333; height: 6px; border-radius: 3px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #00ff88, #00dd77); transition: width 0.5s ease; }
        .error-msg { background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; color: #ff8888; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 0.85em; }
        .system-status { background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%); border-radius: 12px; padding: 20px; margin-top: 30px; border: 1px solid #444; }
        .system-title { color: #00ff88; font-size: 1.3em; margin-bottom: 15px; }
        .btn { background: linear-gradient(135deg, #007acc 0%, #0066aa 100%); color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.85em; margin: 0 5px; transition: all 0.3s ease; }
        .btn:hover { background: linear-gradient(135deg, #0088dd 0%, #0077cc 100%); transform: translateY(-1px); }
        .btn-danger { background: linear-gradient(135deg, #cc4400 0%, #aa3300 100%); }
        .btn-danger:hover { background: linear-gradient(135deg, #dd5511 0%, #bb4411 100%); }
        
        .eco-banner { background: linear-gradient(135deg, #43a047, #66bb6a); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
        .eco-banner h3 { font-size: 1.5em; margin-bottom: 10px; }
        .eco-stats { display: flex; justify-content: center; gap: 30px; margin-top: 15px; font-size: 18px; font-weight: bold; }
        .monitor-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px; height: calc(100vh - 300px); min-height: 600px; }
        .camera-monitor { background: #1e1e1e; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 1px solid #333; }
        .monitor-header { background: linear-gradient(90deg, #2d2d2d, #3d3d3d); padding: 12px; display: flex; justify-content: space-between; align-items: center; }
        .monitor-title { color: #ffffff; font-weight: bold; font-size: 14px; }
        .monitor-controls { display: flex; gap: 8px; }
        .btn-stream { background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.3s; font-size: 12px; }
        .btn-stream.btn-stop { background: #f44336; }
        .btn-stream:hover { transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .btn-snapshot, .btn-fullscreen { background: #2196F3; color: white; border: none; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s; }
        .btn-snapshot:hover, .btn-fullscreen:hover { background: #1976D2; }
        .video-wrapper { flex: 1; position: relative; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .video-feed { width: 100%; height: 100%; object-fit: contain; }
        .video-overlay { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; justify-content: space-between; pointer-events: none; z-index: 10; }
        .overlay-status, .overlay-info { background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); padding: 6px 12px; border-radius: 6px; color: white; font-size: 11px; }
        .loading-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; z-index: 20; }
        .spinner { border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 15px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .camera-status-badge { position: absolute; top: 10px; right: 10px; z-index: 10; }
        .badge-online, .badge-offline, .badge-reconnecting { padding: 4px 8px; border-radius: 4px; font-size: 11px; color: white; }
        .badge-online { background: rgba(76, 175, 80, 0.9); }
        .badge-offline { background: rgba(244, 67, 54, 0.9); }
        .badge-reconnecting { background: rgba(255, 170, 0, 0.9); }
        .monitor-footer { background: #1a1a1a; padding: 10px; }
        .resource-meters { display: flex; gap: 15px; align-items: center; }
        .meter { flex: 1; display: flex; align-items: center; gap: 6px; }
        .meter label { font-size: 11px; color: #888; min-width: 30px; }
        .meter-bar { flex: 1; height: 6px; background: #333; border-radius: 3px; overflow: hidden; }
        .meter-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); transition: width 0.5s ease; }
        .meter span { font-size: 11px; color: #ccc; min-width: 40px; text-align: right; }
        .offline-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #666; font-size: 14px; }
        .offline-placeholder .icon { font-size: 48px; margin-bottom: 10px; }
        .footer { text-align: center; color: #666; margin-top: 40px; padding: 20px 0; border-top: 1px solid #333; }
        .hidden { display: none !important; }
        @media (max-width: 1200px) { .monitor-grid { grid-template-columns: 1fr; grid-template-rows: repeat(4, 300px); height: auto; } }
        @media (max-width: 768px) { .stats-row { grid-template-columns: 1fr; } .camera-header { flex-direction: column; align-items: flex-start; } .eco-stats { flex-direction: column; gap: 10px; } .nav-tabs { flex-wrap: wrap; } }
        .video-wrapper:fullscreen .video-feed { object-fit: contain; background: black; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ShopFlow Bridge Monitor</h1>
            <p>Sistema Multi-Câmera v3.0 - Monitoramento e Streaming em Tempo Real</p>
        </div>
        
        <div class="nav-tabs">
            <button class="nav-btn active" onclick="showTab('status')">Status</button>
            <button class="nav-btn" onclick="showTab('monitor')">📹 Monitor</button>
        </div>
        
        <div id="status-tab" class="tab-content active">
            <div id="cameras-grid" class="cameras-grid"></div>
            <div class="system-status">
                <div class="system-title">Status do Sistema</div>
                <div id="system-info" class="stats-row"></div>
            </div>
        </div>
        
        <div id="monitor-tab" class="tab-content">
            <div class="eco-banner">
                <h3>🌱 Modo Econômico com Lazy Load</h3>
                <p>Por padrão, apenas snapshots são exibidos. Clique em ▶️ Play para ver o stream ao vivo de cada câmera</p>
                <div class="eco-stats">
                    <span>Streams Ativos: <span id="active-streams">0</span>/4</span>
                    <span>CPU Economizado: <span id="cpu-saved">95%</span></span>
                    <span>Banda Economizada: <span id="bandwidth-saved">98%</span></span>
                </div>
            </div>
            
            <div class="monitor-grid">
                <div class="camera-monitor" id="monitor-camera1">
                    <div class="monitor-header">
                        <span class="monitor-title">📷 Camera 1 - Carregando...</span>
                        <div class="monitor-controls">
                            <button class="btn-stream" onclick="toggleStream('camera1')" id="stream-btn-camera1">▶️ Play</button>
                            <button class="btn-snapshot" onclick="captureSnapshot('camera1')">📸</button>
                            <button class="btn-fullscreen" onclick="enterFullscreen('camera1')">⛶</button>
                        </div>
                    </div>
                    <div class="video-wrapper" id="video-wrapper-camera1">
                        <img id="snapshot-camera1" src="/api/snapshot/camera1" class="video-feed snapshot-mode" alt="Camera 1 Snapshot" onerror="this.style.display='none'; document.getElementById('placeholder-camera1').style.display='flex';">
                        <img id="stream-camera1" src="" class="video-feed stream-mode hidden" alt="Camera 1 Live Stream">
                        <div id="placeholder-camera1" class="offline-placeholder hidden">
                            <div class="icon">📷</div><div>Câmera Offline</div>
                        </div>
                        <div class="video-overlay">
                            <div class="overlay-status" id="overlay-camera1">
                                <span class="status-mode">📸 Snapshot</span>
                                <span class="status-time" id="time-camera1">--:--:--</span>
                            </div>
                            <div class="overlay-info">
                                <span>FPS: <span id="monitor-fps-camera1">--</span></span>
                                <span>👥 <span id="monitor-people-camera1">--</span></span>
                                <span>Queue: <span id="monitor-queue-camera1">--</span></span>
                            </div>
                        </div>
                        <div class="loading-overlay hidden" id="loading-camera1">
                            <div class="spinner"></div><p>Iniciando stream...</p>
                        </div>
                        <div class="camera-status-badge" id="badge-camera1">
                            <span class="badge-online">● Online</span>
                        </div>
                    </div>
                    <div class="monitor-footer">
                        <div class="resource-meters">
                            <div class="meter">
                                <label>CPU:</label>
                                <div class="meter-bar"><div class="meter-fill" id="cpu-meter-camera1" style="width: 2%"></div></div>
                                <span id="cpu-value-camera1">2%</span>
                            </div>
                            <div class="meter">
                                <label>Banda:</label>
                                <div class="meter-bar"><div class="meter-fill" id="band-meter-camera1" style="width: 1%"></div></div>
                                <span id="band-value-camera1">10 KB/s</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="camera-monitor" id="monitor-camera2">
                    <div class="monitor-header">
                        <span class="monitor-title">📷 Camera 2 - Carregando...</span>
                        <div class="monitor-controls">
                            <button class="btn-stream" onclick="toggleStream('camera2')" id="stream-btn-camera2">▶️ Play</button>
                            <button class="btn-snapshot" onclick="captureSnapshot('camera2')">📸</button>
                            <button class="btn-fullscreen" onclick="enterFullscreen('camera2')">⛶</button>
                        </div>
                    </div>
                    <div class="video-wrapper" id="video-wrapper-camera2">
                        <img id="snapshot-camera2" src="/api/snapshot/camera2" class="video-feed snapshot-mode" alt="Camera 2 Snapshot" onerror="this.style.display='none'; document.getElementById('placeholder-camera2').style.display='flex';">
                        <img id="stream-camera2" src="" class="video-feed stream-mode hidden" alt="Camera 2 Live Stream">
                        <div id="placeholder-camera2" class="offline-placeholder hidden">
                            <div class="icon">📷</div><div>Câmera Offline</div>
                        </div>
                        <div class="video-overlay">
                            <div class="overlay-status" id="overlay-camera2">
                                <span class="status-mode">📸 Snapshot</span>
                                <span class="status-time" id="time-camera2">--:--:--</span>
                            </div>
                            <div class="overlay-info">
                                <span>FPS: <span id="monitor-fps-camera2">--</span></span>
                                <span>👥 <span id="monitor-people-camera2">--</span></span>
                                <span>Queue: <span id="monitor-queue-camera2">--</span></span>
                            </div>
                        </div>
                        <div class="loading-overlay hidden" id="loading-camera2">
                            <div class="spinner"></div><p>Iniciando stream...</p>
                        </div>
                        <div class="camera-status-badge" id="badge-camera2">
                            <span class="badge-online">● Online</span>
                        </div>
                    </div>
                    <div class="monitor-footer">
                        <div class="resource-meters">
                            <div class="meter">
                                <label>CPU:</label>
                                <div class="meter-bar"><div class="meter-fill" id="cpu-meter-camera2" style="width: 2%"></div></div>
                                <span id="cpu-value-camera2">2%</span>
                            </div>
                            <div class="meter">
                                <label>Banda:</label>
                                <div class="meter-bar"><div class="meter-fill" id="band-meter-camera2" style="width: 1%"></div></div>
                                <span id="band-value-camera2">10 KB/s</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="camera-monitor" id="monitor-camera3">
                    <div class="monitor-header">
                        <span class="monitor-title">📷 Camera 3 - Carregando...</span>
                        <div class="monitor-controls">
                            <button class="btn-stream" onclick="toggleStream('camera3')" id="stream-btn-camera3">▶️ Play</button>
                            <button class="btn-snapshot" onclick="captureSnapshot('camera3')">📸</button>
                            <button class="btn-fullscreen" onclick="enterFullscreen('camera3')">⛶</button>
                        </div>
                    </div>
                    <div class="video-wrapper" id="video-wrapper-camera3">
                        <img id="snapshot-camera3" src="/api/snapshot/camera3" class="video-feed snapshot-mode" alt="Camera 3 Snapshot" onerror="this.style.display='none'; document.getElementById('placeholder-camera3').style.display='flex';">
                        <img id="stream-camera3" src="" class="video-feed stream-mode hidden" alt="Camera 3 Live Stream">
                        <div id="placeholder-camera3" class="offline-placeholder hidden">
                            <div class="icon">📷</div><div>Câmera Offline</div>
                        </div>
                        <div class="video-overlay">
                            <div class="overlay-status" id="overlay-camera3">
                                <span class="status-mode">📸 Snapshot</span>
                                <span class="status-time" id="time-camera3">--:--:--</span>
                            </div>
                            <div class="overlay-info">
                                <span>FPS: <span id="monitor-fps-camera3">--</span></span>
                                <span>👥 <span id="monitor-people-camera3">--</span></span>
                                <span>Queue: <span id="monitor-queue-camera3">--</span></span>
                            </div>
                        </div>
                        <div class="loading-overlay hidden" id="loading-camera3">
                            <div class="spinner"></div><p>Iniciando stream...</p>
                        </div>
                        <div class="camera-status-badge" id="badge-camera3">
                            <span class="badge-online">● Online</span>
                        </div>
                    </div>
                    <div class="monitor-footer">
                        <div class="resource-meters">
                            <div class="meter">
                                <label>CPU:</label>
                                <div class="meter-bar"><div class="meter-fill" id="cpu-meter-camera3" style="width: 2%"></div></div>
                                <span id="cpu-value-camera3">2%</span>
                            </div>
                            <div class="meter">
                                <label>Banda:</label>
                                <div class="meter-bar"><div class="meter-fill" id="band-meter-camera3" style="width: 1%"></div></div>
                                <span id="band-value-camera3">10 KB/s</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="camera-monitor" id="monitor-camera4">
                    <div class="monitor-header">
                        <span class="monitor-title">📷 Camera 4 - Carregando...</span>
                        <div class="monitor-controls">
                            <button class="btn-stream" onclick="toggleStream('camera4')" id="stream-btn-camera4">▶️ Play</button>
                            <button class="btn-snapshot" onclick="captureSnapshot('camera4')">📸</button>
                            <button class="btn-fullscreen" onclick="enterFullscreen('camera4')">⛶</button>
                        </div>
                    </div>
                    <div class="video-wrapper" id="video-wrapper-camera4">
                        <img id="snapshot-camera4" src="/api/snapshot/camera4" class="video-feed snapshot-mode" alt="Camera 4 Snapshot" onerror="this.style.display='none'; document.getElementById('placeholder-camera4').style.display='flex';">
                        <img id="stream-camera4" src="" class="video-feed stream-mode hidden" alt="Camera 4 Live Stream">
                        <div id="placeholder-camera4" class="offline-placeholder hidden">
                            <div class="icon">📷</div><div>Câmera Offline</div>
                        </div>
                        <div class="video-overlay">
                            <div class="overlay-status" id="overlay-camera4">
                                <span class="status-mode">📸 Snapshot</span>
                                <span class="status-time" id="time-camera4">--:--:--</span>
                            </div>
                            <div class="overlay-info">
                                <span>FPS: <span id="monitor-fps-camera4">--</span></span>
                                <span>👥 <span id="monitor-people-camera4">--</span></span>
                                <span>Queue: <span id="monitor-queue-camera4">--</span></span>
                            </div>
                        </div>
                        <div class="loading-overlay hidden" id="loading-camera4">
                            <div class="spinner"></div><p>Iniciando stream...</p>
                        </div>
                        <div class="camera-status-badge" id="badge-camera4">
                            <span class="badge-online">● Online</span>
                        </div>
                    </div>
                    <div class="monitor-footer">
                        <div class="resource-meters">
                            <div class="meter">
                                <label>CPU:</label>
                                <div class="meter-bar"><div class="meter-fill" id="cpu-meter-camera4" style="width: 2%"></div></div>
                                <span id="cpu-value-camera4">2%</span>
                            </div>
                            <div class="meter">
                                <label>Banda:</label>
                                <div class="meter-bar"><div class="meter-fill" id="band-meter-camera4" style="width: 1%"></div></div>
                                <span id="band-value-camera4">10 KB/s</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>ShopFlow Multi-Camera Bridge v3.0 | Auto-refresh: <span id="refresh-timer">5</span>s</p>
            <p>Última atualização: <span id="last-update">Carregando...</span></p>
        </div>
    </div>

    <script>
        let refreshTimer = 5;
        let timerInterval;
        let currentTab = 'status';
        
        class StreamController {
            constructor() {
                this.activeStreams = new Set();
                this.snapshotIntervals = {};
                this.streamStats = {};
                this.updateInterval = null;
            }
            
            init() {
                ['camera1', 'camera2', 'camera3', 'camera4'].forEach(cameraId => {
                    this.startSnapshotUpdates(cameraId);
                });
                this.updateResourceMetrics();
                this.updateInterval = setInterval(() => {
                    this.updateStreamStats();
                }, 2000);
            }
            
            toggleStream(cameraId) {
                const btn = document.getElementById(`stream-btn-${cameraId}`);
                const streamImg = document.getElementById(`stream-${cameraId}`);
                const snapshotImg = document.getElementById(`snapshot-${cameraId}`);
                const loading = document.getElementById(`loading-${cameraId}`);
                const overlay = document.getElementById(`overlay-${cameraId}`);
                
                if (this.activeStreams.has(cameraId)) {
                    this.stopStream(cameraId);
                    btn.innerHTML = '▶️ Play';
                    btn.classList.remove('btn-stop');
                    btn.classList.add('btn-play');
                    streamImg.src = '';
                    streamImg.classList.add('hidden');
                    snapshotImg.classList.remove('hidden');
                    overlay.querySelector('.status-mode').textContent = '📸 Snapshot';
                    this.startSnapshotUpdates(cameraId);
                } else {
                    loading.classList.remove('hidden');
                    btn.disabled = true;
                    this.stopSnapshotUpdates(cameraId);
                    setTimeout(() => {
                        this.startStream(cameraId);
                        loading.classList.add('hidden');
                        btn.innerHTML = '⏸ Stop';
                        btn.classList.remove('btn-play');
                        btn.classList.add('btn-stop');
                        btn.disabled = false;
                        snapshotImg.classList.add('hidden');
                        streamImg.classList.remove('hidden');
                        streamImg.src = `/api/stream/${cameraId}?t=${Date.now()}`;
                        overlay.querySelector('.status-mode').textContent = '[LIVE] Stream';
                    }, 500);
                }
                setTimeout(() => this.updateResourceMetrics(), 100);
            }
            
            startStream(cameraId) {
                this.activeStreams.add(cameraId);
                fetch(`/api/stream/toggle/${cameraId}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({action: 'start'})
                }).catch(e => console.error('Erro ao iniciar stream:', e));
            }
            
            stopStream(cameraId) {
                this.activeStreams.delete(cameraId);
                fetch(`/api/stream/toggle/${cameraId}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({action: 'stop'})
                }).catch(e => console.error('Erro ao parar stream:', e));
            }
            
            startSnapshotUpdates(cameraId) {
                this.snapshotIntervals[cameraId] = setInterval(() => {
                    const img = document.getElementById(`snapshot-${cameraId}`);
                    const placeholder = document.getElementById(`placeholder-${cameraId}`);
                    if (img && !this.activeStreams.has(cameraId)) {
                        img.src = `/api/snapshot/${cameraId}?t=${Date.now()}`;
                        img.style.display = 'block';
                        if (placeholder) placeholder.style.display = 'none';
                    }
                }, 5000);
            }
            
            stopSnapshotUpdates(cameraId) {
                if (this.snapshotIntervals[cameraId]) {
                    clearInterval(this.snapshotIntervals[cameraId]);
                    delete this.snapshotIntervals[cameraId];
                }
            }
            
            updateResourceMetrics() {
                const activeCount = this.activeStreams.size;
                const activeEl = document.getElementById('active-streams');
                if (activeEl) activeEl.textContent = activeCount;
                const cpuSaved = Math.max(0, 100 - (activeCount * 20));
                const bandwidthSaved = Math.max(0, 100 - (activeCount * 25));
                const cpuEl = document.getElementById('cpu-saved');
                const bandEl = document.getElementById('bandwidth-saved');
                if (cpuEl) cpuEl.textContent = `${cpuSaved}%`;
                if (bandEl) bandEl.textContent = `${bandwidthSaved}%`;
                
                ['camera1', 'camera2', 'camera3', 'camera4'].forEach(cameraId => {
                    const isActive = this.activeStreams.has(cameraId);
                    const cpuMeter = document.getElementById(`cpu-meter-${cameraId}`);
                    const cpuValue = document.getElementById(`cpu-value-${cameraId}`);
                    const bandMeter = document.getElementById(`band-meter-${cameraId}`);
                    const bandValue = document.getElementById(`band-value-${cameraId}`);
                    if (cpuMeter && cpuValue && bandMeter && bandValue) {
                        if (isActive) {
                            cpuMeter.style.width = '20%';
                            cpuValue.textContent = '20%';
                            bandMeter.style.width = '25%';
                            bandValue.textContent = '500 KB/s';
                        } else {
                            cpuMeter.style.width = '2%';
                            cpuValue.textContent = '2%';
                            bandMeter.style.width = '1%';
                            bandValue.textContent = '10 KB/s';
                        }
                    }
                });
            }
            
            updateStreamStats() {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('pt-BR');
                ['camera1', 'camera2', 'camera3', 'camera4'].forEach(cameraId => {
                    const timeEl = document.getElementById(`time-${cameraId}`);
                    if (timeEl) timeEl.textContent = timeStr;
                });
                fetch('/api/stream/status')
                    .then(response => response.json())
                    .then(data => {
                        if (data.savings) {
                            const cpuEl = document.getElementById('cpu-saved');
                            const bandEl = document.getElementById('bandwidth-saved');
                            if (cpuEl) cpuEl.textContent = `${data.savings.cpu_saved_percent}%`;
                            if (bandEl) bandEl.textContent = `${data.savings.bandwidth_saved_percent}%`;
                        }
                    })
                    .catch(e => console.error('Erro ao buscar stats:', e));
            }
            
            captureSnapshot(cameraId) {
                const link = document.createElement('a');
                link.href = `/api/snapshot/${cameraId}?download=true&t=${Date.now()}`;
                link.download = `snapshot_${cameraId}_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            enterFullscreen(cameraId) {
                const videoWrapper = document.getElementById(`video-wrapper-${cameraId}`);
                if (videoWrapper) {
                    if (videoWrapper.requestFullscreen) {
                        videoWrapper.requestFullscreen();
                    } else if (videoWrapper.webkitRequestFullscreen) {
                        videoWrapper.webkitRequestFullscreen();
                    } else if (videoWrapper.mozRequestFullScreen) {
                        videoWrapper.mozRequestFullScreen();
                    }
                }
            }
        }
        
        const streamController = new StreamController();
        
        function showTab(tabName) {
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
            currentTab = tabName;
            if (tabName === 'monitor' && !streamController.updateInterval) {
                streamController.init();
            }
        }
        
        function toggleStream(cameraId) { streamController.toggleStream(cameraId); }
        function captureSnapshot(cameraId) { streamController.captureSnapshot(cameraId); }
        function enterFullscreen(cameraId) { streamController.enterFullscreen(cameraId); }
        
        function updateTimer() {
            document.getElementById('refresh-timer').textContent = refreshTimer;
            if (refreshTimer <= 0) {
                refreshTimer = 5;
                if (currentTab === 'status') {
                    loadStatus();
                }
            } else {
                refreshTimer--;
            }
        }
        
        function formatUptime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        function getStatusIcon(status) {
            switch(status) {
                case 'connected': return '[ON]';
                case 'reconnecting': return '[...]';
                case 'offline': return '[OFF]';
                case 'disabled': return '⚫';
                default: return '❓';
            }
        }
        
        function getStatusClass(status) {
            switch(status) {
                case 'connected': return 'status-online';
                case 'reconnecting': return 'status-reconnecting';
                case 'offline': return 'status-offline';
                case 'disabled': return 'status-disabled';
                default: return 'status-offline';
            }
        }
        
        function getBadgeClass(status) {
            switch(status) {
                case 'connected': return 'badge-online';
                case 'reconnecting': return 'badge-reconnecting';
                case 'offline': return 'badge-offline';
                case 'disabled': return 'badge-offline';
                default: return 'badge-offline';
            }
        }
        
        function loadStatus() {
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    const camerasGrid = document.getElementById('cameras-grid');
                    camerasGrid.innerHTML = '';
                    
                    data.cameras.forEach(camera => {
                        const card = document.createElement('div');
                        card.className = 'camera-card';
                        
                        let errorHtml = '';
                        if (camera.last_error && camera.connection_status !== 'connected') {
                            const errorTime = camera.last_success ? Math.floor((Date.now() - new Date(camera.last_success)) / 60000) : '--';
                            errorHtml = `<div class="error-msg">⚠️ ${camera.last_error} (há ${errorTime} min)</div>`;
                        }
                        
                        card.innerHTML = `
                            <div class="camera-header">
                                <div>
                                    <div class="camera-title">${camera.camera_id}</div>
                                    <div class="location">${camera.location}</div>
                                </div>
                                <div>
                                    <span class="status-indicator ${getStatusClass(camera.connection_status)}"></span>
                                    ${getStatusIcon(camera.connection_status)} ${camera.connection_status}
                                </div>
                            </div>
                            <div class="stats-row">
                                <div class="stat-item">
                                    <span class="stat-label">FPS Atual / Config</span>
                                    <span class="stat-value">${camera.current_fps || 0} / ${camera.fps || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Frame Skip</span>
                                    <span class="stat-value">${camera.frame_skip || 1}</span>
                                </div>
                            </div>
                            <div class="stats-row">
                                <div class="stat-item">
                                    <span class="stat-label">Capturados</span>
                                    <span class="stat-value">${camera.frames_captured || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Enviados</span>
                                    <span class="stat-value">${camera.frames_sent || 0}</span>
                                </div>
                            </div>
                            <div class="stats-row">
                                <div class="stat-item">
                                    <span class="stat-label">Pulados (Skip)</span>
                                    <span class="stat-value">${camera.frames_skipped || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Taxa Sucesso</span>
                                    <span class="stat-value">${camera.success_rate?.toFixed(1) || 0}%</span>
                                </div>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${camera.success_rate || 0}%"></div>
                            </div>
                            <div class="stats-row">
                                <div class="stat-item">
                                    <span class="stat-label">Fila</span>
                                    <span class="stat-value">${camera.queue_size || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Uptime</span>
                                    <span class="stat-value">${formatUptime(camera.uptime_seconds || 0)}</span>
                                </div>
                            </div>
                            ${errorHtml}
                            <div style="text-align: center; margin-top: 15px;">
                                <button class="btn" onclick="restartCamera('${camera.camera_id}')">🔄 Reiniciar</button>
                                <button class="btn ${camera.enabled ? 'btn-danger' : ''}" onclick="toggleCamera('${camera.camera_id}')">${camera.enabled ? '⏸️ Pausar' : '▶️ Ativar'}</button>
                            </div>
                        `;
                        
                        camerasGrid.appendChild(card);
                        
                        const monitorTitle = document.querySelector(`#monitor-${camera.camera_id} .monitor-title`);
                        if (monitorTitle) {
                            monitorTitle.textContent = `📷 ${camera.camera_id} - ${camera.location}`;
                        }
                        
                        const badge = document.getElementById(`badge-${camera.camera_id}`);
                        if (badge) {
                            const badgeSpan = badge.querySelector('span');
                            if (badgeSpan) {
                                badgeSpan.className = getBadgeClass(camera.connection_status);
                                badgeSpan.textContent = `● ${camera.connection_status}`;
                            }
                        }
                        
                        const fpsEl = document.getElementById(`monitor-fps-${camera.camera_id}`);
                        const queueEl = document.getElementById(`monitor-queue-${camera.camera_id}`);
                        if (fpsEl) fpsEl.textContent = camera.current_fps || '--';
                        if (queueEl) queueEl.textContent = camera.queue_size || '--';
                    });
                    
                    const systemInfo = document.getElementById('system-info');
                    systemInfo.innerHTML = `
                        <div class="stat-item">
                            <span class="stat-label">Backend</span>
                            <span class="stat-value">${data.backend_status ? '[OK] Conectado' : '[ERRO] Desconectado'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Câmeras Ativas</span>
                            <span class="stat-value">${data.active_cameras} / ${data.total_cameras}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Frames Enviados</span>
                            <span class="stat-value">${data.total_frames_sent}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Uptime Total</span>
                            <span class="stat-value">${formatUptime(data.uptime_seconds)}</span>
                        </div>
                    `;
                    
                    document.getElementById('last-update').textContent = new Date().toLocaleTimeString('pt-BR');
                    refreshTimer = 5;
                })
                .catch(error => {
                    console.error('Erro ao carregar status:', error);
                    document.getElementById('last-update').textContent = 'Erro na conexão';
                });
        }
        
        function restartCamera(cameraId) {
            fetch(`/api/camera/${cameraId}/restart`, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    alert(data.message || `Câmera ${cameraId} reiniciada`);
                    loadStatus();
                })
                .catch(error => alert('Erro ao reiniciar câmera'));
        }
        
        function toggleCamera(cameraId) {
            fetch(`/api/camera/${cameraId}/toggle`, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    loadStatus();
                })
                .catch(error => alert('Erro ao alternar câmera'));
        }
        
        window.addEventListener('DOMContentLoaded', () => {
            loadStatus();
            timerInterval = setInterval(updateTimer, 1000);
        });
    </script>
</body>
</html>'''
        return html_template
    
    def api_status(self):
        """API endpoint para status completo"""
        status = self.bridge.get_system_status()
        return jsonify(status)
    
    def api_camera_status(self, camera_id):
        """API endpoint para status de câmera específica"""
        if camera_id in self.bridge.cameras:
            return jsonify(self.bridge.cameras[camera_id].get_stats())
        return jsonify({'error': 'Camera not found'}), 404
    
    def api_camera_restart(self, camera_id):
        """API endpoint para reiniciar câmera"""
        if camera_id in self.bridge.cameras:
            camera = self.bridge.cameras[camera_id]
            camera.stop()
            time.sleep(1)
            camera.start()
            return jsonify({'message': f'Câmera {camera_id} reiniciada'})
        return jsonify({'error': 'Camera not found'}), 404
    
    def api_camera_toggle(self, camera_id):
        """API endpoint para ativar/desativar câmera"""
        if camera_id in self.bridge.cameras:
            camera = self.bridge.cameras[camera_id]
            camera.toggle_enabled()
            return jsonify({'message': f'Câmera {camera_id} {"ativada" if camera.enabled else "desativada"}'})
        return jsonify({'error': 'Camera not found'}), 404
    
    def get_snapshot(self, camera_id):
        """API endpoint para obter snapshot de câmera"""
        try:
            # Handle camera ID mapping: any request maps to the first available camera
            available_cameras = list(self.bridge.cameras.keys())
            if available_cameras:
                # Use the first available camera for any request
                actual_camera_id = available_cameras[0]
                camera = self.bridge.cameras[actual_camera_id]
                logging.debug(f'📸 [{camera_id}] Mapped to actual camera [{actual_camera_id}] for snapshot')
                
                # Verifica se câmera está conectada e tem frame disponível
                if camera.latest_frame is not None:
                    with camera.frame_lock:
                        frame = camera.latest_frame.copy()
                    
                    # Comprimir com qualidade menor para snapshots (economia de banda)
                    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 60]
                    result, buffer = cv2.imencode('.jpg', frame, encode_param)
                    
                    if result:
                        return Response(buffer.tobytes(), 
                                       mimetype='image/jpeg',
                                       headers={
                                           'Cache-Control': 'no-cache, no-store, must-revalidate',
                                           'Pragma': 'no-cache',
                                           'Expires': '0'
                                       })
            
            # Retornar imagem placeholder se câmera offline/sem frame
            # Por ora retornar erro - poderia ser uma imagem padrão
            return Response("Camera offline", status=404)
            
        except Exception as e:
            logging.error(f'Erro ao obter snapshot {camera_id}: {e}')
            return Response("Error getting snapshot", status=500)
    
    def video_stream(self, camera_id):
        """API endpoint para stream MJPEG ao vivo - só ativo quando solicitado (lazy load)"""
        
        def generate_frames():
            # Registrar cliente do stream
            self.stream_manager.start_stream(camera_id)
            
            try:
                consecutive_errors = 0
                frame_count = 0
                
                while True:
                    # Verificar se ainda há clientes assistindo
                    if not self.stream_manager.is_stream_active(camera_id):
                        logging.info(f'📺 [{camera_id}] Stream finalizado - sem clientes')
                        break
                    
                    # Handle camera ID mapping: any request maps to the first available camera
                    available_cameras = list(self.bridge.cameras.keys())
                    if available_cameras:
                        # Use the first available camera for any request
                        actual_camera_id = available_cameras[0]
                        camera = self.bridge.cameras[actual_camera_id]
                        logging.debug(f'📺 [{camera_id}] Mapped to actual camera [{actual_camera_id}]')
                        
                        if camera.latest_frame is not None:
                            with camera.frame_lock:
                                frame = camera.latest_frame.copy()
                            
                            # Qualidade maior para stream ao vivo
                            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 75]
                            result, buffer = cv2.imencode('.jpg', frame, encode_param)
                            
                            if result:
                                frame_bytes = buffer.tobytes()
                                
                                # Formato MJPEG
                                yield (b'--frame\r\n'
                                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                                
                                consecutive_errors = 0
                                frame_count += 1
                                
                                # Log ocasional
                                if frame_count % 300 == 0:  # A cada 30 segundos @ 10fps
                                    logging.info(f'📺 [{camera_id}] Stream ativo - {frame_count} frames enviados')
                            else:
                                consecutive_errors += 1
                        else:
                            consecutive_errors += 1
                    else:
                        consecutive_errors += 1
                    
                    # Se muitos erros consecutivos, parar stream
                    if consecutive_errors > 50:  # 5 segundos sem frames @ 10fps
                        logging.warning(f'📺 [{camera_id}] Stream parado - muitos erros consecutivos')
                        break
                    
                    # Controle de FPS do stream (10 FPS para economia)
                    time.sleep(0.1)
                    
            except Exception as e:
                logging.error(f'📺 [{camera_id}] Erro no stream: {e}')
            finally:
                # Desregistrar cliente ao finalizar
                self.stream_manager.stop_stream(camera_id)
        
        return Response(generate_frames(),
                       mimetype='multipart/x-mixed-replace; boundary=frame')
    
    def stream_status(self):
        """API endpoint para status dos streams ativos e recursos"""
        try:
            active_streams = self.stream_manager.get_active_streams()
            
            # Calcular uso de recursos estimado
            cpu_usage = 0
            try:
                cpu_usage = psutil.cpu_percent(interval=0.1)
            except:
                cpu_usage = len(active_streams) * 15  # Estimativa
            
            memory_usage = 0
            try:
                memory_usage = psutil.virtual_memory().percent
            except:
                memory_usage = 50  # Valor padrão
            
            # Calcular economia
            max_streams = 4
            cpu_saved = max(0, 100 - (len(active_streams) * 20))
            bandwidth_saved = max(0, 100 - (len(active_streams) * 25))
            
            return jsonify({
                'active_streams': active_streams,
                'stream_count': len(active_streams),
                'max_streams': max_streams,
                'client_count': {cam: self.stream_manager.get_client_count(cam) for cam in active_streams},
                'resource_usage': {
                    'cpu_percent': cpu_usage,
                    'memory_percent': memory_usage,
                    'estimated_bandwidth_kbps': len(active_streams) * 500  # KB/s por stream
                },
                'savings': {
                    'cpu_saved_percent': cpu_saved,
                    'bandwidth_saved_percent': bandwidth_saved,
                    'eco_mode_active': len(active_streams) < max_streams
                },
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logging.error(f'Erro ao obter status de streams: {e}')
            return jsonify({'error': 'Failed to get stream status'}), 500
    
    def toggle_stream(self, camera_id):
        """API endpoint para controlar streams via dashboard"""
        try:
            data = request.get_json()
            action = data.get('action', 'toggle') if data else 'toggle'
            
            if camera_id not in self.bridge.cameras:
                return jsonify({'error': 'Camera not found'}), 404
            
            if action == 'start':
                self.stream_manager.start_stream(camera_id)
                return jsonify({
                    'status': 'started', 
                    'camera_id': camera_id,
                    'message': f'Stream {camera_id} iniciado'
                })
            elif action == 'stop':
                self.stream_manager.stop_stream(camera_id)
                return jsonify({
                    'status': 'stopped', 
                    'camera_id': camera_id,
                    'message': f'Stream {camera_id} parado'
                })
            else:
                # Toggle automático
                if self.stream_manager.is_stream_active(camera_id):
                    self.stream_manager.stop_stream(camera_id)
                    return jsonify({
                        'status': 'stopped', 
                        'camera_id': camera_id,
                        'message': f'Stream {camera_id} parado'
                    })
                else:
                    self.stream_manager.start_stream(camera_id)
                    return jsonify({
                        'status': 'started', 
                        'camera_id': camera_id,
                        'message': f'Stream {camera_id} iniciado'
                    })
                    
        except Exception as e:
            logging.error(f'Erro ao alternar stream {camera_id}: {e}')
            return jsonify({'error': 'Failed to toggle stream'}), 500
    
    def run(self):
        """Inicia o servidor web"""
        try:
            self.app.run(host='0.0.0.0', port=self.port, debug=False, threaded=True)
        except Exception as e:
            logging.error(f'Erro no servidor dashboard: {e}')

class MultiCameraBridge:
    """Classe principal do bridge multi-câmera"""

    def __init__(self):
        """Inicializa bridge multi-câmera usando .env"""
        # Carregar variáveis do .env
        load_dotenv()

        # Configurações globais
        self.api_url = os.getenv('API_URL', 'http://localhost:8001').rstrip('/')
        self.api_key = os.getenv('API_KEY', os.getenv('BRIDGE_API_KEY', 'development'))
        self.bridge_id = os.getenv('BRIDGE_ID', 'BRIDGE-001')
        self.dashboard_enabled = os.getenv('DASHBOARD_ENABLED', 'true').lower() == 'true'
        self.dashboard_port = int(os.getenv('DASHBOARD_PORT', '8888'))

        # Câmeras habilitadas
        enabled_cameras_str = os.getenv('ENABLED_CAMERAS', '1')
        self.enabled_camera_nums = [num.strip() for num in enabled_cameras_str.split(',')]
        
        # Dicionário de câmeras
        self.cameras = {}
        
        # Estatísticas globais
        self.start_time = datetime.now()
        self.running = False
        
        # Dashboard server
        self.dashboard_server = None
        self.dashboard_thread = None
        
        # Configurar sinais para shutdown gracioso
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        # Criar diretórios necessários
        os.makedirs('logs', exist_ok=True)
        os.makedirs('cache', exist_ok=True)
        
        logging.info(f'[INIT] Multi-Camera Bridge {self.bridge_id} inicializada')
        logging.info(f'[CONFIG] Backend: {self.api_url}')
        logging.info(f'[CONFIG] Câmeras configuradas: {self.enabled_camera_nums}')
        
        if self.dashboard_enabled:
            logging.info(f'[WEB] Dashboard disponível em: http://localhost:{self.dashboard_port}')
    
    def _signal_handler(self, sig, frame):
        """Handler para shutdown gracioso"""
        logging.info('🛑 Sinal de parada recebido...')
        self.stop()
        sys.exit(0)
    
    def initialize_cameras(self):
        """Inicializa todas as câmeras configuradas"""
        for camera_num in self.enabled_camera_nums:
            camera_id = f'camera{camera_num}'
            
            # Verifica se configurações existem no .env
            camera_prefix = f'CAMERA{camera_num}_'
            if not os.getenv(f'{camera_prefix}RTSP_URL'):
                logging.warning(f'[WARN] Configurações para {camera_id} não encontradas no .env - pulando')
                continue
            
            # Cria handler da câmera
            camera = CameraHandler(
                camera_id=camera_id,
                api_url=self.api_url,
                api_key=self.api_key,
                bridge_id=self.bridge_id
            )
            
            self.cameras[camera_id] = camera
            
        logging.info(f'[CONFIG] {len(self.cameras)} câmeras inicializadas')
    
    def start_dashboard(self):
        """Inicia servidor do dashboard"""
        if not self.dashboard_enabled:
            return
            
        try:
            self.dashboard_server = DashboardServer(self, self.dashboard_port)
            self.dashboard_thread = threading.Thread(
                target=self.dashboard_server.run,
                daemon=True,
                name="DashboardServer"
            )
            self.dashboard_thread.start()
            logging.info(f'[WEB] Dashboard iniciado em http://localhost:{self.dashboard_port}')
            
        except Exception as e:
            logging.error(f'[ERRO] Erro ao iniciar dashboard: {e}')
    
    def heartbeat_loop(self):
        """Envia heartbeat global para servidor"""
        while self.running:
            try:
                # Coleta estatísticas de todas as câmeras
                total_captured = 0
                total_sent = 0
                total_errors = 0
                active_cameras = 0
                
                for camera in self.cameras.values():
                    stats = camera.get_stats()
                    total_captured += stats['frames_captured']
                    total_sent += stats['frames_sent']
                    total_errors += stats['errors']
                    
                    if stats['enabled'] and stats['connection_status'] == 'connected':
                        active_cameras += 1
                
                # Prepara dados do heartbeat
                uptime = (datetime.now() - self.start_time).total_seconds()
                
                heartbeat_data = {
                    'bridge_id': self.bridge_id,
                    'timestamp': datetime.now().isoformat(),
                    'status': 'active',
                    'cameras': {
                        'total': len(self.cameras),
                        'active': active_cameras,
                        'enabled_list': list(self.cameras.keys())
                    },
                    'stats': {
                        'frames_captured': total_captured,
                        'frames_sent': total_sent,
                        'errors': total_errors,
                        'uptime_seconds': int(uptime)
                    },
                    'system': {
                        'dashboard_enabled': self.dashboard_enabled,
                        'dashboard_port': self.dashboard_port if self.dashboard_enabled else None
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
                    logging.debug('💓 Heartbeat global enviado')
                    
            except Exception as e:
                logging.debug(f'Erro no heartbeat global: {e}')
                
            time.sleep(60)  # Heartbeat a cada minuto
    
    def stats_loop(self):
        """Loop de estatísticas globais"""
        while self.running:
            try:
                uptime = datetime.now() - self.start_time
                
                # Coleta stats de todas as câmeras
                total_captured = 0
                total_sent = 0
                total_errors = 0
                active_cameras = 0
                
                camera_status = []
                
                for camera_id, camera in self.cameras.items():
                    stats = camera.get_stats()
                    total_captured += stats['frames_captured']
                    total_sent += stats['frames_sent']
                    total_errors += stats['errors']
                    
                    status_emoji = "[ON]" if stats['connection_status'] == 'connected' else \
                                  "[...]" if stats['connection_status'] == 'reconnecting' else \
                                  "[OFF]" if stats['connection_status'] == 'offline' else "[--]"
                    
                    if stats['enabled'] and stats['connection_status'] == 'connected':
                        active_cameras += 1
                    
                    camera_status.append(
                        f"{status_emoji} {camera_id}-{stats['location']}: "
                        f"Cap:{stats['frames_captured']} | Env:{stats['frames_sent']} | "
                        f"Skip:{stats['frames_skipped']} | Taxa:{stats['success_rate']:.1f}%"
                    )
                
                logging.info(f'=== Stats Multi-Camera Bridge ===')
                logging.info(f'Uptime: {uptime}')
                logging.info(f'[STATUS] Câmeras: {active_cameras}/{len(self.cameras)} ativas')
                logging.info(f'[STATS] Total: Cap:{total_captured} | Env:{total_sent} | Err:{total_errors}')
                
                for status in camera_status:
                    logging.info(f'  {status}')
                    
                logging.info(f'=====================================')
                
            except Exception as e:
                logging.error(f'Erro ao gerar estatísticas globais: {e}')
                
            time.sleep(180)  # Stats a cada 3 minutos
    
    def get_system_status(self):
        """Retorna status completo do sistema para API"""
        # Coleta dados de todas as câmeras
        cameras_data = []
        total_captured = 0
        total_sent = 0
        active_cameras = 0
        
        for camera_id, camera in self.cameras.items():
            stats = camera.get_stats()
            cameras_data.append({
                'camera_id': camera_id,
                'location': stats['location'],
                'enabled': stats['enabled'],
                'connection_status': stats['connection_status'],
                'frames_captured': stats['frames_captured'],
                'frames_sent': stats['frames_sent'],
                'frames_skipped': stats['frames_skipped'],
                'success_rate': stats['success_rate'],
                'current_fps': stats['current_fps'],
                'fps': camera.fps,
                'frame_skip': camera.frame_skip,
                'queue_size': stats['queue_size'],
                'uptime_seconds': stats['uptime_seconds'],
                'last_success': stats['last_success'].isoformat() if stats['last_success'] else None,
                'last_error': stats['last_error'],
                'errors': stats['errors']
            })
            
            total_captured += stats['frames_captured']
            total_sent += stats['frames_sent']
            
            if stats['enabled'] and stats['connection_status'] == 'connected':
                active_cameras += 1
        
        # Testa conexão com backend
        backend_status = False
        try:
            test_url = f"{self.api_url}/api/health"
            response = requests.get(test_url, timeout=5)
            backend_status = response.status_code == 200
        except:
            backend_status = False
        
        uptime = (datetime.now() - self.start_time).total_seconds()
        
        return {
            'timestamp': datetime.now().isoformat(),
            'bridge_id': self.bridge_id,
            'cameras': cameras_data,
            'total_cameras': len(self.cameras),
            'active_cameras': active_cameras,
            'total_frames_captured': total_captured,
            'total_frames_sent': total_sent,
            'uptime_seconds': int(uptime),
            'backend_status': backend_status,
            'api_url': self.api_url,
            'dashboard_enabled': self.dashboard_enabled,
            'dashboard_port': self.dashboard_port
        }
    
    def start(self):
        """Inicia o bridge multi-câmera"""
        logging.info('[INIT] Iniciando ShopFlow Multi-Camera Bridge v3.0...')
        
        self.running = True
        
        # Testa conexão com API
        try:
            test_url = f"{self.api_url}/api/health"
            response = requests.get(test_url, timeout=5)
            
            if response.status_code == 200:
                logging.info('[OK] Conexão com backend verificada')
            else:
                logging.warning(f'[WARN] Backend retornou status {response.status_code}')
        except Exception as e:
            logging.warning(f'[WARN] Não foi possível verificar backend: {e}')
            logging.info('Continuando mesmo assim...')
        
        # Inicializa câmeras
        self.initialize_cameras()
        
        # Inicia câmeras
        for camera in self.cameras.values():
            camera.start()
        
        # Inicia dashboard
        self.start_dashboard()
        
        # Inicia threads globais
        threads = []
        
        # Thread de heartbeat global
        heartbeat_thread = threading.Thread(target=self.heartbeat_loop, daemon=True, name="GlobalHeartbeat")
        heartbeat_thread.start()
        threads.append(heartbeat_thread)
        
        # Thread de estatísticas globais
        stats_thread = threading.Thread(target=self.stats_loop, daemon=True, name="GlobalStats")
        stats_thread.start()
        threads.append(stats_thread)
        
        logging.info('[OK] Bridge Multi-Camera iniciada com sucesso!')
        if self.dashboard_enabled:
            logging.info(f'[WEB] Acesse o dashboard em: http://localhost:{self.dashboard_port}')
        logging.info('Pressione Ctrl+C para parar...')
        
        # Loop principal
        try:
            while self.running:
                # Verifica se threads globais estão vivas
                for thread in threads:
                    if not thread.is_alive():
                        logging.error(f'[ERRO] Thread {thread.name} morreu!')
                
                time.sleep(5)
                
        except KeyboardInterrupt:
            logging.info('🛑 Parando bridge...')
            self.stop()
    
    def stop(self):
        """Para o bridge e todas as câmeras"""
        logging.info('🛑 Parando Multi-Camera Bridge...')
        self.running = False
        
        # Para todas as câmeras
        for camera in self.cameras.values():
            camera.stop()
        
        logging.info('🛑 Bridge parada com sucesso')

def create_example_env():
    """Cria arquivo .env de exemplo"""
    example_env = """# ============================================================================
# SHOPFLOW BRIDGE CONFIGURATION (.env)
# ============================================================================

# ============================================================================
# GENERAL SETTINGS
# ============================================================================
BRIDGE_ID=BRIDGE-001
ENABLED_CAMERAS=1,2
DASHBOARD_ENABLED=true
DASHBOARD_PORT=8888
RECONNECT_TIMEOUT=10

# ============================================================================
# BACKEND SERVER CONFIGURATION
# ============================================================================
API_URL=http://localhost:8001
API_KEY=SUA_API_KEY_AQUI
BRIDGE_API_KEY=SUA_API_KEY_AQUI

# ============================================================================
# CAMERA 1 CONFIGURATION
# ============================================================================
CAMERA1_ENABLED=true
CAMERA1_RTSP_URL=rtsp://192.168.1.52:554/cam/realmonitor?channel=1&subtype=0
CAMERA1_RTSP_FALLBACK=rtsp://192.168.1.52:554/cam/realmonitor?channel=1&subtype=1
CAMERA1_USERNAME=admin
CAMERA1_PASSWORD=SUA_SENHA_CAMERA1
CAMERA1_LOCATION=Entrada Principal
CAMERA1_FPS=15
CAMERA1_QUALITY=high
CAMERA1_FRAME_SKIP=2

# ============================================================================
# CAMERA 2 CONFIGURATION
# ============================================================================
CAMERA2_ENABLED=false
CAMERA2_RTSP_URL=rtsp://192.168.1.53:554/cam/realmonitor?channel=1&subtype=0
CAMERA2_RTSP_FALLBACK=rtsp://192.168.1.53:554/cam/realmonitor?channel=1&subtype=1
CAMERA2_USERNAME=admin
CAMERA2_PASSWORD=SUA_SENHA_CAMERA2
CAMERA2_LOCATION=Caixa
CAMERA2_FPS=10
CAMERA2_QUALITY=medium
CAMERA2_FRAME_SKIP=3

# ============================================================================
# CAMERA 3 CONFIGURATION
# ============================================================================
CAMERA3_ENABLED=false
CAMERA3_RTSP_URL=rtsp://192.168.1.54:554/cam/realmonitor?channel=1&subtype=0
CAMERA3_RTSP_FALLBACK=rtsp://192.168.1.54:554/cam/realmonitor?channel=1&subtype=1
CAMERA3_USERNAME=admin
CAMERA3_PASSWORD=SUA_SENHA_CAMERA3
CAMERA3_LOCATION=Estoque
CAMERA3_FPS=5
CAMERA3_QUALITY=low
CAMERA3_FRAME_SKIP=5

# ============================================================================
# CAMERA 4 CONFIGURATION
# ============================================================================
CAMERA4_ENABLED=false
CAMERA4_RTSP_URL=rtsp://192.168.1.55:554/cam/realmonitor?channel=1&subtype=0
CAMERA4_RTSP_FALLBACK=rtsp://192.168.1.55:554/cam/realmonitor?channel=1&subtype=1
CAMERA4_USERNAME=admin
CAMERA4_PASSWORD=SUA_SENHA_CAMERA4
CAMERA4_LOCATION=Saída Emergência
CAMERA4_FPS=10
CAMERA4_QUALITY=medium
CAMERA4_FRAME_SKIP=2

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================
LOG_LEVEL=INFO
LOG_FILE=logs/bridge.log
LOG_CONSOLE=true
"""

    with open('.env.example', 'w', encoding='utf-8') as f:
        f.write(example_env)

    logging.info('📝 Arquivo .env.example criado!')
    logging.info('Copie para .env e configure suas câmeras')

def main():
    """Função principal"""
    print("""
    ================================================
    |   ShopFlow Multi-Camera Bridge v3.0         |
    |   Sistema Avancado Multi-Camera + Dashboard |
    |   Frame Skip | Web Monitor | Production     |
    ================================================
    """)
    
    # Verifica arquivo de configuração
    if not os.path.exists('.env'):
        logging.error('[ERRO] Arquivo .env não encontrado!')
        logging.info('Criando arquivo de exemplo...')
        create_example_env()
        return
    
    # Inicia bridge multi-câmera
    bridge = MultiCameraBridge()
    
    try:
        bridge.start()
    except Exception as e:
        logging.error(f'[ERRO] Erro fatal: {e}')
        bridge.stop()

if __name__ == "__main__":
    main()