"""
🎥 Camera Stream API Routes
Endpoints para receber frames da bridge e processar com YOLO11 + Smart Analytics
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
import cv2
import numpy as np
from typing import Dict, Any, Optional, List
import os
import asyncio
from loguru import logger

# Imports internos
from core.detector import YOLOPersonDetector
from core.ai.smart_analytics_engine import SmartAnalyticsEngine  # DESCOMENTAR
from core.database import SupabaseManager
from core.app_state import get_smart_engine  # ADICIONAR
from core.config import settings
from models.api_models import CameraConfigData

router = APIRouter(prefix="/api/camera", tags=["camera"])
security = HTTPBearer()

# Instância global do detector
detector = None

async def get_detector():
    """Singleton do detector YOLO11"""
    global detector
    if detector is None:
        detector = YOLOPersonDetector()
        await detector.load_model()
    return detector

async def get_analytics_engine() -> SmartAnalyticsEngine:
    """Obter Smart Analytics Engine do estado global"""
    engine = get_smart_engine()
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="Smart Analytics Engine não está inicializado"
        )
    return engine

async def verify_bridge_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica autenticação da bridge"""
    expected_key = os.getenv('BRIDGE_API_KEY', 'development')
    if credentials.credentials != expected_key:
        raise HTTPException(status_code=401, detail="Invalid bridge API key")
    return credentials.credentials

@router.post("/process")
async def process_camera_frame(
    frame: UploadFile = File(..., description="Frame da câmera em formato JPEG"),
    timestamp: str = Form(..., description="Timestamp do frame em formato ISO"),
    camera_id: str = Form(..., description="ID da câmera"),
    auth_key: str = Depends(verify_bridge_auth)
):
    """
    🎯 Endpoint principal para processar frames da bridge
    
    Recebe frame da câmera Intelbras Mibo e processa com:
    - YOLO11 para detecção de pessoas
    - Smart Analytics (4 módulos de IA)
    - Armazenamento no Supabase
    """
    try:
        start_time = datetime.now()
        
        # Validações básicas
        if not frame.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Lê e decodifica imagem
        logger.info(f"📸 Processando frame de {camera_id} - {timestamp}")
        contents = await frame.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Processa com YOLO11
        detector_instance = await get_detector()
        detections = await detector_instance.detect_persons(img)

        # Adiciona IDs únicos às detecções para o SmartAnalyticsEngine
        for i, detection in enumerate(detections):
            detection['id'] = i

        # Processa com Smart Analytics
        analytics_instance = await get_analytics_engine()
        smart_metrics = await analytics_instance.process_frame(img, detections, timestamp)

        # Extrai métricas básicas
        people_count = len(detections)
        employees_detected = smart_metrics.employees
        customers_count = smart_metrics.customers

        # Análise de grupos (usando dados dos smart_metrics)
        groups_detected = []
        # Usar dados de grupos do smart_metrics se disponível
        if hasattr(smart_metrics, 'group_shopping_rate') and smart_metrics.group_shopping_rate > 0:
            groups_detected = [{"rate": smart_metrics.group_shopping_rate}]
        
        # Salva no Supabase usando o manager global
        from core.database import SupabaseManager
        from core.config import settings
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        try:
            # Insere evento no banco usando método específico para câmeras
            await supabase.insert_camera_event(
                camera_id=camera_id,
                timestamp=timestamp,
                people_count=people_count,
                customers_count=customers_count,
                employees_count=employees_detected,
                groups_count=len(groups_detected),
                processing_time_ms=int((datetime.now() - start_time).total_seconds() * 1000),
                frame_width=img.shape[1],
                frame_height=img.shape[0],
                metadata={
                    'smart_analytics': {
                        'confidence_score': smart_metrics.confidence_score,
                        'anomalies_detected': len(smart_metrics.anomalies_detected),
                        'recommendations': len(smart_metrics.recommendations),
                        'groups': [g.get("rate", 0) for g in groups_detected] if groups_detected else []
                    }
                }
            )
            
            logger.info(f"💾 Evento salvo: {camera_id} - {people_count} pessoas")
            
        except Exception as db_error:
            logger.warning(f"⚠️ Erro ao salvar no banco: {db_error}")
            # Não falha o processamento se banco der erro
        
        # Prepara resposta
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        response = {
            'success': True,
            'timestamp': timestamp,
            'camera_id': camera_id,
            'people_count': people_count,
            'customers_count': customers_count,
            'employees_detected': employees_detected,
            'groups_detected': len(groups_detected),
            'smart_analytics': {
                'confidence_score': smart_metrics.confidence_score,
                'anomalies_count': len(smart_metrics.anomalies_detected),
                'recommendations_count': len(smart_metrics.recommendations),
                'group_types': [g.get("rate", 0) for g in groups_detected] if groups_detected else []
            },
            'processing_time_ms': round(processing_time, 2),
            'frame_resolution': f"{img.shape[1]}x{img.shape[0]}"
        }
        
        logger.info(f"✅ Frame processado: {people_count} pessoas | {processing_time:.1f}ms")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro no processamento: {e}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.get("/status")
async def camera_status():
    """🔍 Status dos serviços de câmera"""
    try:
        detector_instance = await get_detector()
        analytics_instance = await get_analytics_engine()
        
        return {
            'detector_loaded': detector_instance.model is not None,
            'analytics_initialized': analytics_instance.face_manager is not None,
            'modules': {
                'face_recognition': analytics_instance.face_manager is not None,
                'behavior_analysis': analytics_instance.behavior_analyzer is not None,
                'group_detection': analytics_instance.behavior_analyzer is not None,
                'temporal_analysis': True
            },
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {
            'error': str(e),
            'detector_loaded': False,
            'analytics_initialized': False
        }

@router.post("/test")
async def test_camera_endpoint(
    auth_key: str = Depends(verify_bridge_auth)
):
    """🧪 Endpoint de teste para validar conectividade da bridge"""
    return {
        'success': True,
        'message': 'Bridge connection OK',
        'timestamp': datetime.now().isoformat(),
        'server': 'ShopFlow API v1.0'
    }

# ============================================================================
# CRUD ENDPOINTS PARA GERENCIAMENTO DE CÂMERAS
# ============================================================================

@router.get("/")
async def list_cameras():
    """📋 Listar todas as câmeras configuradas"""
    try:
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        cameras = await supabase.get_cameras()
        return {
            'success': True,
            'cameras': cameras,
            'total': len(cameras)
        }
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar câmeras: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_camera(camera_data: dict):
    """➕ Criar nova configuração de câmera"""
    try:
        # Validar dados
        camera_config = CameraConfigData(**camera_data)
        
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        camera_id = await supabase.create_camera(camera_config.dict())
        logger.info(f"📷 Nova câmera criada: {camera_id}")
        
        return {
            'success': True,
            'camera_id': camera_id,
            'message': 'Câmera criada com sucesso'
        }
        
    except Exception as e:
        logger.error(f"❌ Erro ao criar câmera: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{camera_id}")
async def get_camera(camera_id: str):
    """🔍 Obter detalhes de uma câmera específica"""
    try:
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        camera = await supabase.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(status_code=404, detail="Câmera não encontrada")
            
        return {
            'success': True,
            'camera': camera
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter câmera: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{camera_id}")
async def update_camera(camera_id: str, camera_data: dict):
    """✏️ Atualizar configuração de uma câmera"""
    try:
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        success = await supabase.update_camera(camera_id, camera_data)
        if not success:
            raise HTTPException(status_code=404, detail="Câmera não encontrada")
            
        logger.info(f"📷 Câmera atualizada: {camera_id}")
        
        return {
            'success': True,
            'message': 'Câmera atualizada com sucesso'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar câmera: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{camera_id}")
async def delete_camera(camera_id: str):
    """🗑️ Remover uma câmera"""
    try:
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        success = await supabase.delete_camera(camera_id)
        if not success:
            raise HTTPException(status_code=404, detail="Câmera não encontrada")
            
        logger.info(f"📷 Câmera removida: {camera_id}")
        
        return {
            'success': True,
            'message': 'Câmera removida com sucesso'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao remover câmera: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{camera_id}/test-connection")
async def test_camera_connection(camera_id: str):
    """🔗 Testar conexão com uma câmera específica"""
    try:
        from core.database import SupabaseManager
        from core.config import settings
        import cv2
        
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        camera = await supabase.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(status_code=404, detail="Câmera não encontrada")
        
        # Tentar conectar na câmera via RTSP
        rtsp_url = camera.get('rtsp_url')
        if not rtsp_url:
            raise HTTPException(status_code=400, detail="URL RTSP não configurada")
        
        # Teste básico de conexão
        cap = cv2.VideoCapture(rtsp_url)
        success = cap.isOpened()
        
        if success:
            ret, frame = cap.read()
            success = ret and frame is not None
            
        cap.release()
        
        # Atualizar status da câmera
        await supabase.update_camera_status(camera_id, 'online' if success else 'offline')
        
        return {
            'success': success,
            'status': 'online' if success else 'offline',
            'message': 'Conexão bem-sucedida' if success else 'Falha na conexão',
            'camera_id': camera_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao testar conexão: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{camera_id}/events")
async def get_camera_events(
    camera_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """📊 Obter eventos recentes de uma câmera"""
    try:
        from core.database import SupabaseManager
        from core.config import settings
        
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        events = await supabase.get_camera_events(camera_id, start_date, end_date, limit)
        
        return {
            'success': True,
            'events': events,
            'total': len(events),
            'camera_id': camera_id
        }
        
    except Exception as e:
        logger.error(f"❌ Erro ao obter eventos da câmera: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{camera_id}/snapshot")
async def get_camera_snapshot(camera_id: str):
    """📸 Obter snapshot atual da câmera"""
    try:
        from core.database import SupabaseManager
        from core.config import settings
        import base64
        from io import BytesIO
        from PIL import Image, ImageDraw, ImageFont
        import numpy as np
        
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()
        
        camera = await supabase.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(status_code=404, detail="Câmera não encontrada")
        
        # Gerar imagem simulada (em produção seria captura da câmera real)
        width, height = 640, 480
        
        # Criar imagem base com gradiente
        img = Image.new('RGB', (width, height), color='#1a1a1a')
        draw = ImageDraw.Draw(img)
        
        # Adicionar gradiente simulado
        for y in range(height):
            shade = int(50 + (y / height) * 50)
            color = (shade, shade, shade + 10)
            draw.line([(0, y), (width, y)], fill=color)
        
        # Adicionar informações da câmera
        camera_name = camera.get('name', 'Câmera')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Texto principal
        try:
            # Tentar usar fonte padrão
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        except:
            font_large = None
            font_small = None
        
        # Informações da câmera
        info_text = [
            f"📹 {camera_name}",
            f"⏰ {timestamp}",
            f"📍 {camera.get('location', 'N/A')}",
            f"🎯 {camera.get('fps', 30)} FPS",
            f"📏 {camera.get('resolution', '640x480')}"
        ]
        
        # Desenhar informações
        y_offset = 20
        for line in info_text:
            draw.text((20, y_offset), line, fill='white', font=font_small)
            y_offset += 25
        
        # Adicionar alguns elementos visuais simulando detecções
        import random
        random.seed(int(datetime.now().timestamp()) % 1000)
        
        for i in range(random.randint(1, 3)):
            x = random.randint(50, width - 150)
            y = random.randint(150, height - 100)
            w = random.randint(80, 120)
            h = random.randint(100, 140)
            
            # Bounding box
            draw.rectangle([x, y, x + w, y + h], outline='lime', width=2)
            
            # Label
            confidence = random.randint(75, 98)
            label = f"Pessoa {confidence}%"
            draw.rectangle([x, y - 20, x + len(label) * 8, y], fill='lime')
            draw.text((x + 2, y - 18), label, fill='black', font=font_small)
        
        # Converter para base64
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        img_bytes = buffer.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        
        return {
            'success': True,
            'camera_id': camera_id,
            'timestamp': timestamp,
            'format': 'image/jpeg',
            'size': len(img_bytes),
            'data': f"data:image/jpeg;base64,{img_base64}",
            'resolution': f"{width}x{height}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao gerar snapshot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{camera_id}/detections")
async def get_camera_detections(camera_id: str):
    """🎯 Obter detecções em tempo real da câmera processando frame atual"""
    try:
        import cv2
        import numpy as np
        import base64
        from datetime import datetime

        # Buscar câmera no banco
        supabase = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await supabase.initialize()

        camera = await supabase.get_camera_by_id(camera_id)
        if not camera:
            raise HTTPException(status_code=404, detail="Câmera não encontrada")

        rtsp_url = camera.get('rtsp_url')
        if not rtsp_url:
            return {
                'success': False,
                'camera_id': camera_id,
                'detections': [],
                'timestamp': datetime.now().isoformat(),
                'error': 'URL RTSP não configurada'
            }

        # Capturar frame atual da câmera
        cap = cv2.VideoCapture(rtsp_url)
        if not cap.isOpened():
            return {
                'success': False,
                'camera_id': camera_id,
                'detections': [],
                'timestamp': datetime.now().isoformat(),
                'error': 'Não foi possível conectar à câmera'
            }

        ret, frame = cap.read()
        cap.release()

        if not ret or frame is None:
            return {
                'success': False,
                'camera_id': camera_id,
                'detections': [],
                'timestamp': datetime.now().isoformat(),
                'error': 'Não foi possível capturar frame'
            }

        # Processar frame com YOLO
        detector_instance = await get_detector()
        detections = await detector_instance.detect_persons(frame)

        # Converter detecções para formato frontend
        real_detections = []
        for i, detection in enumerate(detections):
            # Extrair coordenadas da bbox (formato: [x1, y1, x2, y2])
            x1, y1, x2, y2 = detection.get('bbox', [0, 0, 100, 100])

            real_detections.append({
                'id': f"person_{i}_{int(datetime.now().timestamp())}",
                'class': 'person',
                'confidence': detection.get('confidence', 0.8),
                'bbox': {
                    'x': int(x1),
                    'y': int(y1),
                    'width': int(x2 - x1),
                    'height': int(y2 - y1)
                },
                'timestamp': datetime.now().isoformat()
            })

        logger.info(f"🎯 Processamento YOLO: {len(real_detections)} pessoas detectadas")

        return {
            'success': True,
            'camera_id': camera_id,
            'timestamp': datetime.now().isoformat(),
            'detections': real_detections,
            'people_count': len(real_detections),
            'frame_resolution': f"{frame.shape[1]}x{frame.shape[0]}",
            'source': 'real_time_yolo'
        }

    except Exception as e:
        logger.error(f"❌ Erro ao obter detecções em tempo real: {e}")
        return {
            'success': False,
            'camera_id': camera_id,
            'detections': [],
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }
