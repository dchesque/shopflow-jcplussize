"""
Gerenciador de WebSocket para comunicação em tempo real
"""

import json
import asyncio
from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
from loguru import logger
import time

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket):
        """Aceitar nova conexão WebSocket"""
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            
            # Armazenar info da conexão
            self.connection_info[websocket] = {
                'connected_at': time.time(),
                'last_ping': time.time(),
                'client_info': None
            }
            
            logger.info(f"Nova conexão WebSocket: {len(self.active_connections)} ativa(s)")
            
            # Enviar mensagem de boas-vindas
            await self.send_personal_message(json.dumps({
                'type': 'connection_established',
                'message': 'Conectado ao Shop Flow',
                'timestamp': time.time()
            }), websocket)
            
        except Exception as e:
            logger.error(f"Erro ao conectar WebSocket: {e}")
            await self.disconnect(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Desconectar WebSocket"""
        try:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            
            if websocket in self.connection_info:
                del self.connection_info[websocket]
            
            logger.info(f"Conexão WebSocket removida: {len(self.active_connections)} ativa(s)")
            
        except Exception as e:
            logger.error(f"Erro ao desconectar WebSocket: {e}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Enviar mensagem para conexão específica"""
        try:
            await websocket.send_text(message)
        except WebSocketDisconnect:
            await self.disconnect(websocket)
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem pessoal: {e}")
            await self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """Enviar mensagem para todas as conexões ativas"""
        if not self.active_connections:
            return
        
        disconnected = []
        
        for websocket in self.active_connections:
            try:
                await websocket.send_text(message)
            except WebSocketDisconnect:
                disconnected.append(websocket)
            except Exception as e:
                logger.error(f"Erro no broadcast: {e}")
                disconnected.append(websocket)
        
        # Remover conexões perdidas
        for websocket in disconnected:
            self.disconnect(websocket)
    
    async def broadcast_metrics(self, metrics: Dict[str, Any]):
        """Broadcast específico para métricas"""
        message = {
            'type': 'metrics_update',
            'data': metrics,
            'timestamp': time.time()
        }
        
        await self.broadcast(json.dumps(message))
    
    async def broadcast_camera_event(self, camera_id: str, event_data: Dict[str, Any]):
        """Broadcast específico para eventos de câmera"""
        message = {
            'type': 'camera_event',
            'camera_id': camera_id,
            'data': event_data,
            'timestamp': time.time()
        }
        
        await self.broadcast(json.dumps(message))
        
    async def broadcast_multi_camera_stats(self, stats_by_camera: Dict[str, Any]):
        """Broadcast de estatísticas agregadas de múltiplas câmeras"""
        message = {
            'type': 'multi_camera_stats',
            'cameras': stats_by_camera,
            'total_cameras': len(stats_by_camera),
            'timestamp': time.time()
        }
        
        await self.broadcast(json.dumps(message))

    async def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        """Broadcast de eventos específicos"""
        message = {
            'type': event_type,
            'data': data,
            'timestamp': time.time()
        }
        
        await self.broadcast(json.dumps(message))
    
    async def broadcast_alert(self, alert_type: str, title: str, message: str, severity: str = "info"):
        """Broadcast de alertas"""
        alert_message = {
            'type': 'alert',
            'alert_type': alert_type,
            'title': title,
            'message': message,
            'severity': severity,
            'timestamp': time.time()
        }
        
        await self.broadcast(json.dumps(alert_message))
    
    async def handle_client_message(self, websocket: WebSocket, message: str):
        """Processar mensagem recebida do cliente"""
        try:
            data = json.loads(message)
            message_type = data.get('type', 'unknown')
            
            if message_type == 'ping':
                # Atualizar last_ping
                if websocket in self.connection_info:
                    self.connection_info[websocket]['last_ping'] = time.time()
                
                # Responder com pong
                await self.send_personal_message(json.dumps({
                    'type': 'pong',
                    'timestamp': time.time()
                }), websocket)
            
            elif message_type == 'client_info':
                # Armazenar informações do cliente
                if websocket in self.connection_info:
                    self.connection_info[websocket]['client_info'] = data.get('data', {})
                    logger.info(f"Info do cliente recebida: {data.get('data', {})}")
            
            elif message_type == 'subscribe':
                # Cliente se inscrevendo em tipos específicos de eventos
                subscriptions = data.get('events', [])
                if websocket in self.connection_info:
                    self.connection_info[websocket]['subscriptions'] = subscriptions
                    logger.info(f"Cliente inscrito em: {subscriptions}")
            
            else:
                logger.warning(f"Tipo de mensagem desconhecido: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Mensagem inválida recebida: {message}")
        except Exception as e:
            logger.error(f"Erro ao processar mensagem do cliente: {e}")
    
    async def cleanup_stale_connections(self, timeout: int = 300):
        """Limpar conexões inativas"""
        current_time = time.time()
        stale_connections = []
        
        for websocket, info in self.connection_info.items():
            if current_time - info['last_ping'] > timeout:
                stale_connections.append(websocket)
        
        for websocket in stale_connections:
            logger.info("Removendo conexão inativa")
            self.disconnect(websocket)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Obter estatísticas das conexões"""
        try:
            current_time = time.time()
            
            stats = {
                'active_connections': len(self.active_connections),
                'total_connections': len(self.connection_info),
                'connections': []
            }
            
            for websocket, info in self.connection_info.items():
                connection_stats = {
                    'connected_duration': round(current_time - info['connected_at'], 2),
                    'last_ping_ago': round(current_time - info['last_ping'], 2),
                    'client_info': info.get('client_info'),
                    'subscriptions': info.get('subscriptions', [])
                }
                stats['connections'].append(connection_stats)
            
            return stats
            
        except Exception as e:
            logger.error(f"Erro ao obter stats das conexões: {e}")
            return {'active_connections': 0, 'error': str(e)}
    
    async def send_system_status(self):
        """Enviar status do sistema para todos os clientes"""
        status = {
            'type': 'system_status',
            'data': {
                'active_connections': len(self.active_connections),
                'uptime': time.time(),
                'status': 'online'
            },
            'timestamp': time.time()
        }
        
        await self.broadcast(json.dumps(status))
    
    async def start_heartbeat_task(self, interval: int = 30):
        """Iniciar task de heartbeat"""
        while True:
            try:
                await asyncio.sleep(interval)
                await self.send_system_status()
                await self.cleanup_stale_connections()
            except Exception as e:
                logger.error(f"Erro no heartbeat task: {e}")
    
    async def send_real_time_data(self, data_type: str, data: Dict[str, Any]):
        """Enviar dados em tempo real com tipo específico"""
        message = {
            'type': 'real_time_data',
            'data_type': data_type,
            'data': data,
            'timestamp': time.time()
        }
        
        # Filtrar por assinatura se necessário
        targeted_connections = []
        
        for websocket in self.active_connections:
            info = self.connection_info.get(websocket, {})
            subscriptions = info.get('subscriptions', [])
            
            # Se não tem assinatura ou está inscrito no tipo
            if not subscriptions or data_type in subscriptions:
                targeted_connections.append(websocket)
        
        # Enviar para conexões específicas
        if targeted_connections:
            message_str = json.dumps(message)
            
            for websocket in targeted_connections:
                try:
                    await websocket.send_text(message_str)
                except Exception as e:
                    logger.error(f"Erro ao enviar dados em tempo real: {e}")
                    self.disconnect(websocket)