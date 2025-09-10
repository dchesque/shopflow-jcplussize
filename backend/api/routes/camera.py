"""
🎥 Camera Stream API Routes
Endpoints para receber frames da bridge e processar com YOLO11 + Smart Analytics
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
import cv2
import numpy as np
from typing import Dict, Any, Optional
import os
import asyncio
from loguru import logger

# Imports internos
from core.detector import YOLOPersonDetector
from core.ai.smart_analytics_engine import SmartAnalyticsEngine  # DESCOMENTAR
from core.database import SupabaseManager
from core.app_state import get_smart_engine  # ADICIONAR

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
        
        # Processa com Smart Analytics
        analytics_instance = await get_analytics_engine()
        smart_detections = await analytics_instance.process_frame_detections(detections, img)
        
        # Extrai métricas básicas
        people_count = len(detections)
        employees_detected = sum(1 for d in smart_detections if d.is_employee)
        customers_count = people_count - employees_detected
        
        # Análise de grupos
        groups_detected = []
        if len(smart_detections) > 1:
            groups_detected = await analytics_instance.group_detector.detect_groups(smart_detections)
        
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
                        'face_attempts': sum(1 for d in smart_detections if d.face_data is not None),
                        'behavior_active': any(d.behavior_signature for d in smart_detections),
                        'groups': [g.group_type.value for g in groups_detected] if groups_detected else []
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
                'face_recognition_attempts': sum(1 for d in smart_detections if d.face_data is not None),
                'behavior_analysis_active': any(d.behavior_signature for d in smart_detections),
                'temporal_analysis_results': [d.purchase_probability for d in smart_detections if d.purchase_probability > 0],
                'group_types': [g.group_type.value for g in groups_detected]
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