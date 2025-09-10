#!/usr/bin/env python3
"""
Shop Flow Backend - FastAPI + Smart AI Analytics
Sistema de processamento de vídeo inteligente para contagem de pessoas
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import json
import os
import time
import base64
import io
import tempfile
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from pathlib import Path
import uvicorn
from loguru import logger
from dotenv import load_dotenv

# Importar módulos locais
from core.config import settings
from core.database import SupabaseManager
from core.detector import YOLOPersonDetector
from core.tracker import PersonTracker
from core.websocket_manager import WebSocketManager
from models.api_models import *
from utils.helpers import *

# Importar Smart Analytics Engine
from core.ai.smart_analytics_engine import SmartAnalyticsEngine, SmartMetrics
from core.ai.privacy_config import privacy_manager

# Load environment variables
load_dotenv()

# Managers globais
supabase_manager = None
detector = None
tracker = None
websocket_manager = WebSocketManager()
smart_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management para inicializar/limpar recursos"""
    global supabase_manager, detector, tracker, smart_engine
    
    logger.info("🚀 Iniciando Shop Flow Backend com Smart Analytics...")
    
    try:
        # Inicializar Supabase
        supabase_manager = SupabaseManager(
            url=settings.SUPABASE_URL,
            key=settings.SUPABASE_SERVICE_KEY
        )
        await supabase_manager.initialize()
        logger.success("✅ Supabase conectado")
        
        # Inicializar detector YOLO
        detector = YOLOPersonDetector(
            model_path=settings.YOLO_MODEL,
            confidence=settings.YOLO_CONFIDENCE
        )
        await detector.load_model()
        logger.success("✅ YOLOv8 carregado")
        
        # Inicializar tracker
        tracker = PersonTracker(
            max_disappeared=settings.TRACKING_MAX_DISAPPEARED,
            max_distance=settings.TRACKING_MAX_DISTANCE
        )
        logger.success("✅ Tracker inicializado")
        
        # Inicializar Smart Analytics Engine
        smart_engine = SmartAnalyticsEngine(enable_face_recognition=True)
        await smart_engine.initialize()
        
        # Definir no estado global
        from core.app_state import set_smart_engine
        set_smart_engine(smart_engine)
        
        logger.success("✅ Smart Analytics Engine inicializado e registrado globalmente")
        
        # Criar diretórios necessários
        Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Path("logs").mkdir(parents=True, exist_ok=True)
        Path("face_embeddings").mkdir(parents=True, exist_ok=True)
        
        logger.success("🎯 Backend com IA iniciado com sucesso!")
        
    except Exception as e:
        logger.error(f"❌ Erro na inicialização: {e}")
        raise
    
    yield
    
    # Cleanup
    logger.info("🔄 Finalizando backend...")
    if supabase_manager:
        await supabase_manager.close()
    logger.info("✅ Backend finalizado")

# Criar app FastAPI
app = FastAPI(
    title="Shop Flow Smart API",
    description="Sistema inteligente de contagem de pessoas com análise comportamental e reconhecimento facial",
    version="2.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos (snapshots)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Incluir rotas da API de câmera
from api.routes.camera import router as camera_router
app.include_router(camera_router)

# Incluir novas rotas de Analytics e Employees
from api.routes.analytics import router as analytics_router
from api.routes.employees import router as employees_router

app.include_router(analytics_router)
app.include_router(employees_router)

# ============================================================================
# ENDPOINTS DE BRIDGE (Recepção de frames da câmera)
# ============================================================================

@app.post("/api/bridge/frames")
async def receive_frame(frame_data: FrameData, background_tasks: BackgroundTasks):
    """Receber frame do bridge e processar com Smart Analytics"""
    try:
        # Decodificar frame
        frame_bytes = base64.b64decode(frame_data.frame_data)
        frame_array = decode_frame_from_bytes(frame_bytes)
        
        if frame_array is None:
            raise HTTPException(status_code=400, detail="Frame inválido")
        
        # Processar frame com Smart Analytics em background
        background_tasks.add_task(process_smart_frame, frame_array, frame_data.timestamp)
        
        return {"status": "received", "timestamp": frame_data.timestamp}
        
    except Exception as e:
        logger.error(f"Erro ao receber frame: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bridge/heartbeat")
async def bridge_heartbeat(heartbeat: HeartbeatData):
    """Receber heartbeat do bridge"""
    try:
        # Salvar heartbeat no banco
        await supabase_manager.log_system_event(
            level="INFO",
            message=f"Heartbeat do bridge {heartbeat.bridge_id}",
            component="bridge",
            metadata=heartbeat.model_dump()
        )
        
        return {"status": "ok", "timestamp": datetime.now().isoformat()}
        
    except Exception as e:
        logger.error(f"Erro no heartbeat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint para monitoramento"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "database": False,
                "ai_engine": False,
                "detector": False,
                "tracker": False
            }
        }
        
        # Check database
        if supabase_manager:
            try:
                await supabase_manager.execute("SELECT 1", [])
                health_status["services"]["database"] = True
            except:
                pass
        
        # Check AI engine
        if smart_engine:
            health_status["services"]["ai_engine"] = True
        
        # Check detector
        if detector:
            health_status["services"]["detector"] = True
        
        # Check tracker
        if tracker:
            health_status["services"]["tracker"] = True
        
        # Overall status
        all_healthy = all(health_status["services"].values())
        health_status["status"] = "healthy" if all_healthy else "degraded"
        
        return health_status
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# ============================================================================
# SMART AI ENDPOINTS
# ============================================================================

@app.post("/api/ai/employees/register")
async def register_employee_face(
    employee_id: str = Form(...),
    name: str = Form(...),
    photo: UploadFile = File(...)
):
    """Registrar funcionário para reconhecimento facial (LGPD-compliant)"""
    try:
        # Validar privacidade
        if not privacy_manager.validate_operation('face_recognition'):
            raise HTTPException(status_code=403, detail="Reconhecimento facial desabilitado")
        
        # Validar arquivo de imagem
        if not photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
        
        # Salvar temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            content = await photo.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Registrar no sistema
            result = await smart_engine.register_employee_face(tmp_path, employee_id, name)
            
            # Log de auditoria
            privacy_manager.log_employee_registration(employee_id, 'registered')
            
            return result
            
        finally:
            # Garantir que arquivo temporário seja removido
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao registrar funcionário: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/ai/employees/{employee_id}")
async def remove_employee_face(employee_id: str):
    """Remove funcionário do sistema (Direito ao Esquecimento)"""
    try:
        if not privacy_manager.validate_operation('data_deletion'):
            raise HTTPException(status_code=403, detail="Exclusão de dados desabilitada")
        
        success = await smart_engine.remove_employee_face(employee_id)
        
        if success:
            privacy_manager.log_employee_registration(employee_id, 'removed')
            return {"success": True, "message": f"Funcionário {employee_id} removido"}
        else:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao remover funcionário: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/employees")
async def list_employees():
    """Lista funcionários cadastrados"""
    try:
        employees = smart_engine.get_employee_list()
        return {"employees": employees}
        
    except Exception as e:
        logger.error(f"Erro ao listar funcionários: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/metrics/smart")
async def get_smart_metrics():
    """Obter métricas inteligentes combinadas"""
    try:
        metrics = await smart_engine.get_smart_metrics()
        
        # Log de acesso
        privacy_manager.log_data_access('smart_metrics', 'read')
        
        return metrics
        
    except Exception as e:
        logger.error(f"Erro ao obter métricas inteligentes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/analytics/detailed")
async def get_detailed_analytics():
    """Análise detalhada com todos os módulos de IA"""
    try:
        analytics = await smart_engine.get_detailed_analytics()
        
        privacy_manager.log_data_access('detailed_analytics', 'read')
        
        return analytics
        
    except Exception as e:
        logger.error(f"Erro na análise detalhada: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/person/{person_id}")
async def get_person_details(person_id: str):
    """Detalhes completos sobre uma pessoa específica"""
    try:
        details = await smart_engine.get_person_details(person_id)
        
        if not details:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")
        
        privacy_manager.log_data_access('person_details', 'read')
        
        return details
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter detalhes da pessoa: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PRIVACY & COMPLIANCE ENDPOINTS
# ============================================================================

@app.get("/api/privacy/settings")
async def get_privacy_settings():
    """Configurações de privacidade atuais"""
    try:
        return privacy_manager.settings.to_dict()
    except Exception as e:
        logger.error(f"Erro ao obter configurações de privacidade: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/privacy/settings")
async def update_privacy_settings(settings: Dict[str, Any]):
    """Atualizar configurações de privacidade"""
    try:
        success = privacy_manager.update_settings(**settings)
        
        if success:
            return {"success": True, "message": "Configurações atualizadas"}
        else:
            raise HTTPException(status_code=400, detail="Erro ao atualizar configurações")
            
    except Exception as e:
        logger.error(f"Erro ao atualizar configurações: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/privacy/compliance-report")
async def get_compliance_report():
    """Relatório de conformidade LGPD/GDPR"""
    try:
        report = privacy_manager.get_compliance_report()
        return report
        
    except Exception as e:
        logger.error(f"Erro ao gerar relatório de conformidade: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/privacy/data-deletion")
async def request_data_deletion(person_id: str, data_type: str = "all"):
    """Solicitação de exclusão de dados (Direito ao Esquecimento)"""
    try:
        result = privacy_manager.request_data_deletion(person_id, data_type)
        return result
        
    except Exception as e:
        logger.error(f"Erro na exclusão de dados: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/privacy/audit-logs")
async def export_audit_logs(days: int = 30):
    """Exportar logs de auditoria"""
    try:
        logs = privacy_manager.export_audit_logs(days)
        return logs
        
    except Exception as e:
        logger.error(f"Erro ao exportar logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# WEBSOCKET PARA TEMPO REAL
# ============================================================================

@app.websocket("/ws/smart-metrics")
async def websocket_smart_metrics(websocket: WebSocket):
    """WebSocket para métricas inteligentes em tempo real"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Enviar métricas inteligentes a cada 3 segundos
            if smart_engine and smart_engine.last_metrics:
                metrics_data = {
                    'type': 'smart_metrics_update',
                    'data': smart_engine.last_metrics.__dict__,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                metrics_data = {
                    'type': 'smart_metrics_update',
                    'data': {'status': 'no_metrics_available'},
                    'timestamp': datetime.now().isoformat()
                }
            await websocket_manager.send_personal_message(json.dumps(metrics_data), websocket)
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """WebSocket para métricas básicas (compatibilidade)"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Enviar métricas atuais a cada 2 segundos
            metrics = await get_current_metrics()
            await websocket_manager.send_personal_message(json.dumps(metrics), websocket)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# ============================================================================
# API ENDPOINTS EXISTENTES (Mantidos para compatibilidade)
# ============================================================================

@app.get("/api/health")
async def health_check():
    """Health check do sistema"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "components": {
            "database": supabase_manager is not None,
            "detector": detector is not None and detector.model is not None,
            "tracker": tracker is not None,
            "smart_engine": smart_engine is not None,
            "privacy_manager": privacy_manager is not None,
            "face_recognition": smart_engine.face_manager is not None if smart_engine else False,
            "behavior_analyzer": smart_engine.behavior_analyzer is not None if smart_engine else False,
            "customer_segmentation": smart_engine.segmentation is not None if smart_engine else False,
            "predictive_insights": smart_engine.predictive is not None if smart_engine else False
        }
    }

@app.get("/api/people/current")
async def get_current_people():
    """Número atual de pessoas na loja"""
    try:
        result = await supabase_manager.get_current_stats()
        return {
            "current_count": result.get("people_count", 0),
            "last_updated": result.get("last_updated"),
            "total_entries_today": result.get("total_entries", 0),
            "total_exits_today": result.get("total_exits", 0)
        }
    except Exception as e:
        logger.error(f"Erro ao buscar contagem atual: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats/today")
async def get_today_stats():
    """Estatísticas do dia atual"""
    try:
        dashboard_data = await supabase_manager.get_dashboard_metrics()
        return dashboard_data
    except Exception as e:
        logger.error(f"Erro ao buscar stats do dia: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# FUNÇÕES DE PROCESSAMENTO INTELIGENTE
# ============================================================================

async def process_smart_frame(frame_array, timestamp: str):
    """Processa frame com Smart Analytics Engine"""
    try:
        # Detectar pessoas no frame
        detections = await detector.detect_persons(frame_array)
        
        # Atualizar tracker
        tracked_objects = tracker.update(detections)
        
        # Processar com Smart Analytics
        if smart_engine:
            timestamp_dt = datetime.fromisoformat(timestamp)
            smart_metrics = await smart_engine.process_frame(frame_array, detections, timestamp_dt)
        
        # Verificar cruzamentos da linha
        line_position = settings.LINE_POSITION / 100.0
        crossings = tracker.check_line_crossings(line_position)
        
        # Processar cada cruzamento
        for crossing in crossings:
            await handle_smart_crossing(crossing, timestamp, frame_array, smart_metrics if smart_engine else None)
            
        # Broadcast métricas via WebSocket
        if smart_engine and smart_engine.last_metrics:
            metrics_message = {
                'type': 'smart_metrics_update',
                'data': smart_engine.last_metrics.__dict__,
                'timestamp': datetime.now().isoformat()
            }
            await websocket_manager.broadcast(json.dumps(metrics_message))
        
        # Cleanup periódico
        if smart_engine:
            pass  # Smart engine doesn't have cleanup_old_data method
        privacy_manager.cleanup_old_audit_logs()
        
    except Exception as e:
        logger.error(f"Erro no processamento inteligente do frame: {e}")
        await supabase_manager.log_system_event(
            level="ERROR",
            message=f"Erro no processamento inteligente: {str(e)}",
            component="smart_processor"
        )

async def handle_smart_crossing(crossing: Dict[str, Any], timestamp: str, frame_array, smart_metrics: SmartMetrics):
    """Processar cruzamento com informações inteligentes"""
    try:
        person_id = crossing['person_id']
        
        # Metadados inteligentes baseados nas métricas
        metadata = {
            'is_employee': False,  # Será determinado pela análise de smart_metrics
            'is_returning_customer': False,
            'customer_type': 'unknown',
            'group_id': None,
            'purchase_probability': smart_metrics.conversion_probability if smart_metrics else 0.0,
            'ai_enabled': smart_metrics is not None
        }
        
        # Se há métricas inteligentes, extrair informações relevantes
        if smart_metrics:
            metadata['total_employees_detected'] = smart_metrics.employees
            metadata['flow_pattern'] = smart_metrics.customer_flow_pattern
            metadata['recommendations'] = smart_metrics.recommendations[:3] if smart_metrics.recommendations else []
        
        # Salvar snapshot se disponível
        snapshot_url = None
        if settings.SAVE_SNAPSHOTS:
            snapshot_url = await save_snapshot(frame_array, person_id)
        
        # Inserir evento no banco
        await supabase_manager.insert_people_event(
            action=crossing['action'],
            person_tracking_id=person_id,
            confidence=crossing['confidence'],
            snapshot_url=snapshot_url,
            timestamp=timestamp,
            metadata=metadata
        )
        
        # Log específico baseado em métricas inteligentes
        if smart_metrics and smart_metrics.employees > 0:
            logger.info(f"👤 Sistema inteligente ativo: {person_id} - {crossing['action']} (funcionários: {smart_metrics.employees})")
        else:
            logger.info(f"👥 Cliente {crossing['action']}: {person_id} (prob. compra: {metadata['purchase_probability']:.2f})")
        
    except Exception as e:
        logger.error(f"Erro ao processar cruzamento inteligente: {e}")

async def save_snapshot(frame_array, person_id: str) -> str:
    """Salvar snapshot da detecção"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"snapshot_{person_id}_{timestamp}.jpg"
        filepath = Path(settings.UPLOAD_DIR) / filename
        
        # Salvar imagem
        import cv2
        cv2.imwrite(str(filepath), frame_array)
        
        # Log de auditoria para snapshots
        privacy_manager.log_data_access('snapshot', 'created')
        
        # Retornar URL relativa
        return f"/uploads/{filename}"
        
    except Exception as e:
        logger.error(f"Erro ao salvar snapshot: {e}")
        return None

async def get_current_metrics() -> Dict[str, Any]:
    """Obter métricas atuais para WebSocket (compatibilidade)"""
    try:
        stats = await supabase_manager.get_current_stats()
        conversion = await supabase_manager.get_conversion_rate()
        
        return {
            "type": "metrics_update",
            "data": {
                "current_people": stats.get("people_count", 0),
                "total_entries": stats.get("total_entries", 0),
                "total_exits": stats.get("total_exits", 0),
                "conversion_rate": conversion.get("conversion_rate", 0),
                "last_updated": stats.get("last_updated"),
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Erro ao obter métricas: {e}")
        return {"type": "error", "message": "Erro ao obter métricas"}

# ============================================================================
# STARTUP
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level="info"
    )