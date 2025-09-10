"""
Employees API Routes - Rotas para gerenciamento de funcionários
Sistema de reconhecimento facial e gestão de funcionários
"""

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from typing import Dict, Any, List, Optional
import cv2
import numpy as np
from datetime import datetime, timedelta
import asyncio
from loguru import logger
import uuid
from PIL import Image
import io

from core.ai.smart_analytics_engine import SmartAnalyticsEngine
from core.ai.privacy_config import privacy_manager
from core.database import SupabaseManager
from core.config import settings
from models.api_models import ApiResponse
from core.app_state import get_smart_engine as get_global_engine

router = APIRouter(prefix="/api/employees", tags=["employees"])

async def get_smart_engine() -> SmartAnalyticsEngine:
    """Dependency para obter instância do Smart Analytics Engine"""
    engine = get_global_engine()
    if engine is None:
        raise HTTPException(
            status_code=500,
            detail="Smart Analytics Engine não inicializado"
        )
    if not engine.face_manager:
        raise HTTPException(
            status_code=503,
            detail="Sistema de reconhecimento facial não habilitado"
        )
    return engine


async def process_face_image(file: UploadFile) -> np.ndarray:
    """Processar imagem de face carregada"""
    try:
        # Verificar tipo de arquivo
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Arquivo deve ser uma imagem"
            )
        
        # Ler dados da imagem
        contents = await file.read()
        
        # Converter para numpy array
        image = Image.open(io.BytesIO(contents))
        image = image.convert('RGB')
        img_array = np.array(image)
        
        # Converter RGB para BGR (OpenCV)
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Validar que há uma face na imagem
        gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            raise HTTPException(
                status_code=400,
                detail="Nenhuma face detectada na imagem. Tente uma imagem mais clara."
            )
        
        if len(faces) > 1:
            raise HTTPException(
                status_code=400,
                detail="Múltiplas faces detectadas. Use uma imagem com apenas uma pessoa."
            )
        
        return img_array
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao processar imagem: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar imagem: {str(e)}"
        )

@router.post("/register", response_model=Dict[str, Any])
async def register_employee(
    name: str = Form(..., description="Nome completo do funcionário"),
    employee_id: Optional[str] = Form(None, description="ID personalizado do funcionário"),
    department: Optional[str] = Form(None, description="Departamento/Seção"),
    position: Optional[str] = Form(None, description="Cargo"),
    file: UploadFile = File(..., description="Foto do funcionário"),
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Registrar novo funcionário com reconhecimento facial
    
    Args:
        name: Nome completo
        employee_id: ID personalizado (opcional, será gerado se não fornecido)
        department: Departamento (opcional)
        position: Cargo (opcional)
        file: Foto do rosto do funcionário
    
    Retorna:
        - ID do funcionário gerado
        - Status do registro
        - Informações de conformidade
    """
    try:
        # Verificar conformidade
        if not privacy_manager.validate_operation('face_recognition'):
            raise HTTPException(
                status_code=403,
                detail="Reconhecimento facial não permitido pelas configurações de privacidade"
            )
        
        # Processar imagem
        face_image = await process_face_image(file)
        
        # Gerar ID se não fornecido
        if not employee_id:
            employee_id = f"emp_{uuid.uuid4().hex[:8]}"
        
        # Registrar funcionário
        registered_id = await engine.register_employee(
            name=name,
            face_image=face_image,
            employee_id=employee_id
        )
        
        # Salvar dados adicionais no banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        try:
            await db.execute("""
                INSERT INTO employees (employee_id, name, department, position, registered_at, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (employee_id) 
                DO UPDATE SET 
                    name = EXCLUDED.name,
                    department = EXCLUDED.department,
                    position = EXCLUDED.position,
                    registered_at = EXCLUDED.registered_at,
                    is_active = EXCLUDED.is_active
            """, (registered_id, name, department, position, datetime.now(), True))
        except Exception as db_error:
            logger.warning(f"Erro ao salvar no banco: {db_error}")
            # Continuar mesmo se o banco falhar
        
        # Log de auditoria
        privacy_manager.log_employee_registration(registered_id, "registered")
        
        return {
            "status": "success",
            "message": f"Funcionário {name} registrado com sucesso",
            "data": {
                "employee_id": registered_id,
                "name": name,
                "department": department,
                "position": position,
                "registered_at": datetime.now().isoformat(),
                "face_recognition_enabled": True,
                "privacy_compliant": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao registrar funcionário: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.delete("/{employee_id}", response_model=Dict[str, Any])
async def remove_employee(
    employee_id: str,
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Remover funcionário do sistema
    
    Args:
        employee_id: ID do funcionário a ser removido
    
    Retorna:
        - Status da remoção
        - Dados removidos (para auditoria)
    """
    try:
        # Verificar se operação é permitida
        if not privacy_manager.validate_operation('data_deletion'):
            raise HTTPException(
                status_code=403,
                detail="Remoção de dados não permitida pelas configurações atuais"
            )
        
        # Remover do sistema de reconhecimento facial
        success = await engine.remove_employee(employee_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Funcionário não encontrado"
            )
        
        # Remover/desativar no banco de dados
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        try:
            # Marcar como inativo ao invés de deletar (para auditoria)
            await db.execute("""
                UPDATE employees 
                SET is_active = false, removed_at = %s
                WHERE employee_id = %s
            """, (datetime.now(), employee_id))
        except Exception as db_error:
            logger.warning(f"Erro ao atualizar banco: {db_error}")
        
        # Log de auditoria
        privacy_manager.log_employee_registration(employee_id, "removed")
        
        return {
            "status": "success",
            "message": f"Funcionário {employee_id} removido com sucesso",
            "data": {
                "employee_id": employee_id,
                "removed_at": datetime.now().isoformat(),
                "face_data_deleted": True,
                "database_deactivated": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao remover funcionário: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/list", response_model=Dict[str, Any])
async def list_employees(
    search: Optional[str] = None,
    status: Optional[str] = None,
    department: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    active_only: bool = True,
    include_last_seen: bool = True,
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Listar funcionários registrados com filtros e paginação
    
    Args:
        search: Buscar por nome ou ID
        status: Filtrar por status (active/inactive)
        department: Filtrar por departamento
        page: Página atual
        limit: Itens por página
        active_only: Mostrar apenas funcionários ativos
        include_last_seen: Incluir informação de último avistamento
    
    Retorna:
        - Lista de funcionários paginada
        - Estatísticas gerais
    """
    try:
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Construir query
        base_query = "SELECT * FROM employees WHERE 1=1"
        count_query = "SELECT COUNT(*) as total FROM employees WHERE 1=1"
        params = []
        count_params = []
        
        # Aplicar filtros
        if status == 'active':
            base_query += " AND is_active = true"
            count_query += " AND is_active = true"
        elif status == 'inactive':
            base_query += " AND is_active = false"
            count_query += " AND is_active = false"
        elif active_only:
            base_query += " AND is_active = true"
            count_query += " AND is_active = true"
        
        if department:
            base_query += " AND department = %s"
            count_query += " AND department = %s"
            params.append(department)
            count_params.append(department)
        
        if search:
            base_query += " AND (name ILIKE %s OR employee_id ILIKE %s)"
            count_query += " AND (name ILIKE %s OR employee_id ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])
            count_params.extend([search_pattern, search_pattern])
        
        # Ordenação
        base_query += " ORDER BY registered_at DESC"
        
        # Paginação
        offset = (page - 1) * limit
        base_query += f" LIMIT {limit} OFFSET {offset}"
        
        try:
            employees_data = await db.fetch_all(base_query, params)
            total_result = await db.fetch_one(count_query, count_params)
            total_count = total_result['total'] if total_result else 0
        except Exception:
            # Se tabela não existe, retornar lista vazia
            employees_data = []
            total_count = 0
        
        # Processar dados
        employees_list = []
        active_count = 0
        inactive_count = 0
        
        for emp in employees_data:
            employee_info = {
                "id": emp['employee_id'],  # Compatibilidade com frontend
                "employee_id": emp['employee_id'],
                "name": emp['name'],
                "department": emp.get('department'),
                "position": emp.get('position'),
                "registered_at": emp['registered_at'].isoformat() if emp['registered_at'] else None,
                "is_active": emp.get('is_active', True),
                "status": "active" if emp.get('is_active', True) else "inactive"
            }
            
            if include_last_seen and emp.get('last_seen'):
                employee_info["last_seen"] = emp['last_seen'].isoformat()
                employee_info["hours_worked_total"] = emp.get('total_hours_worked', 0)
            
            employees_list.append(employee_info)
            
            if emp.get('is_active', True):
                active_count += 1
            else:
                inactive_count += 1
        
        # Calcular paginação
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
        has_next = page < total_pages
        has_prev = page > 1
        
        # Formato compatível com frontend
        return {
            "employees": employees_list,
            "total_count": total_count,
            "active_count": active_count,
            "inactive_count": inactive_count,
            "page": page,
            "limit": limit,
            "has_next": has_next,
            "has_prev": has_prev,
            "total_pages": total_pages,
            "statistics": {
                "total_registered": total_count,
                "active_employees": active_count,
                "inactive_employees": inactive_count,
                "face_recognition_enabled": engine.enable_face_recognition if engine else False
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao listar funcionários: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/{employee_id}/analytics", response_model=Dict[str, Any])
async def get_employee_analytics(
    employee_id: str,
    days: int = 30
):
    """
    Obter analytics específicas de um funcionário
    
    Args:
        employee_id: ID do funcionário
        days: Período de análise em dias
    
    Retorna:
        - Métricas de presença
        - Padrões de comportamento
        - Estatísticas de produtividade
    """
    try:
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        start_date = datetime.now() - timedelta(days=days)
        
        # Buscar dados analíticos
        analytics_query = """
            SELECT 
                DATE(timestamp) as work_date,
                MIN(timestamp) as first_seen,
                MAX(timestamp) as last_seen,
                COUNT(*) as detection_count
            FROM behavior_analytics 
            WHERE person_type = 'employee' 
                AND metadata->>'employee_id' = %s
                AND timestamp >= %s
            GROUP BY DATE(timestamp)
            ORDER BY work_date DESC
        """
        
        try:
            analytics_data = await db.fetch_all(analytics_query, (employee_id, start_date))
        except Exception:
            analytics_data = []
        
        # Processar dados
        total_days_worked = len(analytics_data)
        total_hours = 0
        daily_hours = []
        attendance_pattern = {}
        
        for record in analytics_data:
            if record['first_seen'] and record['last_seen']:
                hours = (record['last_seen'] - record['first_seen']).total_seconds() / 3600
                total_hours += hours
                daily_hours.append({
                    'date': record['work_date'].isoformat(),
                    'hours': round(hours, 2),
                    'first_seen': record['first_seen'].isoformat(),
                    'last_seen': record['last_seen'].isoformat()
                })
                
                # Padrão de presença por dia da semana
                weekday = record['work_date'].strftime('%A')
                if weekday not in attendance_pattern:
                    attendance_pattern[weekday] = 0
                attendance_pattern[weekday] += 1
        
        avg_daily_hours = round(total_hours / total_days_worked, 2) if total_days_worked > 0 else 0
        
        return {
            "employee_id": employee_id,
            "period_days": days,
            "metrics": {
                "total_days_worked": total_days_worked,
                "total_hours_worked": round(total_hours, 2),
                "average_daily_hours": avg_daily_hours,
                "attendance_rate": round((total_days_worked / days) * 100, 1) if days > 0 else 0
            },
            "daily_breakdown": daily_hours[:7],  # Últimos 7 dias
            "attendance_pattern": attendance_pattern,
            "performance_score": min(100, round((avg_daily_hours / 8) * 100, 1)) if avg_daily_hours > 0 else 0,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter analytics do funcionário: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/{employee_id}", response_model=Dict[str, Any])
async def get_employee_details(
    employee_id: str,
    include_analytics: bool = True
):
    """
    Obter detalhes de um funcionário específico
    
    Args:
        employee_id: ID do funcionário
        include_analytics: Incluir dados analíticos
    
    Retorna:
        - Dados do funcionário
        - Estatísticas de presença (se solicitado)
        - Histórico de avistamentos
    """
    try:
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Buscar dados do funcionário
        try:
            employee_query = "SELECT * FROM employees WHERE employee_id = %s"
            employee_data = await db.fetch_one(employee_query, (employee_id,))
        except Exception:
            employee_data = None
        
        if not employee_data:
            raise HTTPException(
                status_code=404,
                detail="Funcionário não encontrado"
            )
        
        response_data = {
            "employee_id": employee_data['employee_id'],
            "name": employee_data['name'],
            "department": employee_data.get('department'),
            "position": employee_data.get('position'),
            "registered_at": employee_data['registered_at'].isoformat() if employee_data['registered_at'] else None,
            "is_active": employee_data.get('is_active', True),
            "last_seen": employee_data['last_seen'].isoformat() if employee_data.get('last_seen') else None
        }
        
        if include_analytics:
            # Buscar dados analíticos
            try:
                analytics_query = """
                    SELECT COUNT(*) as detection_count, 
                           MAX(timestamp) as last_detection,
                           MIN(timestamp) as first_detection
                    FROM behavior_analytics 
                    WHERE person_type = 'employee' AND metadata->>'employee_id' = %s
                """
                analytics_data = await db.fetch_one(analytics_query, (employee_id,))
                
                if analytics_data:
                    response_data["analytics"] = {
                        "total_detections": analytics_data['detection_count'],
                        "first_detection": analytics_data['first_detection'].isoformat() if analytics_data['first_detection'] else None,
                        "last_detection": analytics_data['last_detection'].isoformat() if analytics_data['last_detection'] else None,
                        "total_hours_worked": employee_data.get('total_hours_worked', 0)
                    }
                else:
                    response_data["analytics"] = {
                        "total_detections": 0,
                        "first_detection": None,
                        "last_detection": None,
                        "total_hours_worked": 0
                    }
            except Exception as e:
                logger.warning(f"Erro ao buscar analytics: {e}")
                response_data["analytics"] = None
        
        return {
            "status": "success",
            "data": response_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter detalhes do funcionário: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.put("/{employee_id}", response_model=Dict[str, Any])
async def update_employee(
    employee_id: str,
    name: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None, description="Nova foto (opcional)"),
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Atualizar dados de um funcionário
    
    Args:
        employee_id: ID do funcionário
        name: Novo nome (opcional)
        department: Novo departamento (opcional)
        position: Nova posição (opcional)
        is_active: Status ativo/inativo (opcional)
        file: Nova foto (opcional)
    
    Retorna:
        - Dados atualizados
        - Status da operação
    """
    try:
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Verificar se funcionário existe
        try:
            existing = await db.fetch_one(
                "SELECT * FROM employees WHERE employee_id = %s", 
                (employee_id,)
            )
        except Exception:
            existing = None
        
        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Funcionário não encontrado"
            )
        
        # Atualizar face se nova imagem fornecida
        if file:
            if not privacy_manager.validate_operation('face_recognition'):
                raise HTTPException(
                    status_code=403,
                    detail="Atualização de reconhecimento facial não permitida"
                )
            
            face_image = await process_face_image(file)
            
            # Remover registro antigo
            await engine.remove_employee(employee_id)
            
            # Registrar novamente com nova face
            await engine.register_employee(
                name=name or existing['name'],
                face_image=face_image,
                employee_id=employee_id
            )
        
        # Atualizar dados no banco
        update_fields = []
        update_values = []
        
        if name is not None:
            update_fields.append("name = %s")
            update_values.append(name)
        
        if department is not None:
            update_fields.append("department = %s")
            update_values.append(department)
        
        if position is not None:
            update_fields.append("position = %s")
            update_values.append(position)
        
        if is_active is not None:
            update_fields.append("is_active = %s")
            update_values.append(is_active)
        
        if update_fields:
            update_values.append(employee_id)
            update_query = f"""
                UPDATE employees 
                SET {', '.join(update_fields)}, updated_at = NOW()
                WHERE employee_id = %s
            """
            
            try:
                await db.execute(update_query, update_values)
            except Exception as e:
                logger.warning(f"Erro ao atualizar banco: {e}")
        
        # Log de auditoria
        privacy_manager.log_employee_registration(employee_id, "updated")
        
        return {
            "status": "success",
            "message": f"Funcionário {employee_id} atualizado com sucesso",
            "data": {
                "employee_id": employee_id,
                "updated_fields": [field.split(' = ')[0] for field in update_fields],
                "face_updated": file is not None,
                "updated_at": datetime.now().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar funcionário: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/analytics/presence", response_model=Dict[str, Any])
async def get_employee_presence_analytics(
    days: int = 30,
    employee_id: Optional[str] = None
):
    """
    Obter análises de presença de funcionários
    
    Args:
        days: Período em dias para análise
        employee_id: ID específico (opcional, se não fornecido analisa todos)
    
    Retorna:
        - Horas trabalhadas por funcionário
        - Padrões de presença
        - Estatísticas de pontualidade
    """
    try:
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Período de análise
        start_date = datetime.now() - timedelta(days=days)
        
        # Query base para buscar presenças
        base_query = """
            SELECT 
                metadata->>'employee_id' as employee_id,
                e.name,
                DATE(ba.timestamp) as work_date,
                MIN(ba.timestamp) as first_seen,
                MAX(ba.timestamp) as last_seen,
                COUNT(*) as detection_count
            FROM behavior_analytics ba
            LEFT JOIN employees e ON e.employee_id = metadata->>'employee_id'
            WHERE ba.person_type = 'employee' 
                AND ba.timestamp >= %s
        """
        
        params = [start_date]
        
        if employee_id:
            base_query += " AND metadata->>'employee_id' = %s"
            params.append(employee_id)
        
        base_query += """
            GROUP BY metadata->>'employee_id', e.name, DATE(ba.timestamp)
            ORDER BY work_date DESC, employee_id
        """
        
        try:
            presence_data = await db.fetch_all(base_query, params)
        except Exception:
            presence_data = []
        
        # Processar dados
        employee_stats = {}
        total_working_days = 0
        
        for record in presence_data:
            emp_id = record['employee_id']
            
            if emp_id not in employee_stats:
                employee_stats[emp_id] = {
                    'name': record['name'],
                    'working_days': 0,
                    'total_hours': 0,
                    'avg_daily_hours': 0,
                    'first_arrival_times': [],
                    'last_departure_times': []
                }
            
            # Calcular horas trabalhadas no dia
            first_seen = record['first_seen']
            last_seen = record['last_seen']
            
            if first_seen and last_seen:
                hours_worked = (last_seen - first_seen).total_seconds() / 3600
                employee_stats[emp_id]['working_days'] += 1
                employee_stats[emp_id]['total_hours'] += hours_worked
                employee_stats[emp_id]['first_arrival_times'].append(first_seen.hour + first_seen.minute/60)
                employee_stats[emp_id]['last_departure_times'].append(last_seen.hour + last_seen.minute/60)
        
        # Calcular médias
        for emp_id, stats in employee_stats.items():
            if stats['working_days'] > 0:
                stats['avg_daily_hours'] = round(stats['total_hours'] / stats['working_days'], 2)
                stats['avg_arrival_time'] = round(
                    sum(stats['first_arrival_times']) / len(stats['first_arrival_times']), 1
                ) if stats['first_arrival_times'] else None
                stats['avg_departure_time'] = round(
                    sum(stats['last_departure_times']) / len(stats['last_departure_times']), 1
                ) if stats['last_departure_times'] else None
            
            # Limpar dados temporários
            del stats['first_arrival_times']
            del stats['last_departure_times']
        
        return {
            "status": "success",
            "data": {
                "analysis_period_days": days,
                "employee_statistics": employee_stats,
                "summary": {
                    "employees_analyzed": len(employee_stats),
                    "total_employee_hours": sum(s['total_hours'] for s in employee_stats.values()),
                    "avg_hours_per_employee": round(
                        sum(s['total_hours'] for s in employee_stats.values()) / len(employee_stats), 2
                    ) if employee_stats else 0
                },
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter analytics de presença: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )