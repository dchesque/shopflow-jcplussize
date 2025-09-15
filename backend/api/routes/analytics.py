"""
Analytics API Routes - Rotas para análises inteligentes do ShopFlow
Fornece endpoints para métricas avançadas, predições e insights
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
# Updated analytics endpoints
import asyncio
from loguru import logger

from core.ai.smart_analytics_engine import SmartAnalyticsEngine, SmartMetrics
from core.ai.privacy_config import privacy_manager
from core.database import SupabaseManager
from core.config import settings
from models.api_models import ApiResponse
from core.app_state import get_smart_engine as get_global_engine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

async def get_smart_engine() -> SmartAnalyticsEngine:
    """Dependency para obter instância do Smart Analytics Engine"""
    engine = get_global_engine()
    if engine is None:
        raise HTTPException(
            status_code=500,
            detail="Smart Analytics Engine não inicializado"
        )
    return engine


@router.get("/smart-metrics", response_model=Dict[str, Any])
async def get_smart_metrics(
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Obter métricas inteligentes em tempo real
    
    Retorna:
        - Contagem de pessoas (clientes vs funcionários)
        - Análise comportamental
        - Predições
        - Recomendações
        - Anomalias detectadas
    """
    try:
        if not engine.last_metrics:
            return {
                "status": "success",
                "message": "Nenhuma métrica disponível ainda",
                "data": None
            }
        
        metrics = engine.last_metrics
        
        return {
            "status": "success",
            "data": {
                "counting": {
                    "total_people": metrics.total_people,
                    "customers": metrics.customers,
                    "employees": metrics.employees,
                    "confidence_score": metrics.confidence_score
                },
                "behavior": {
                    "avg_dwell_time": metrics.avg_dwell_time,
                    "hot_zones": metrics.hot_zones,
                    "flow_pattern": metrics.customer_flow_pattern,
                    "group_shopping_rate": metrics.group_shopping_rate
                },
                "segmentation": metrics.customer_segments,
                "predictions": {
                    "next_hour": metrics.next_hour_prediction,
                    "conversion_probability": metrics.conversion_probability,
                    "optimal_staff": metrics.optimal_staff_needed
                },
                "insights": {
                    "anomalies": metrics.anomalies_detected,
                    "recommendations": metrics.recommendations
                },
                "metadata": {
                    "timestamp": metrics.timestamp.isoformat(),
                    "ai_enabled": True
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter métricas inteligentes: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/behavior-patterns", response_model=Dict[str, Any])
async def get_behavior_patterns(
    date_filter: Optional[date] = Query(None, description="Filtrar por data específica"),
    hours: int = Query(24, ge=1, le=168, description="Últimas N horas"),
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Obter padrões comportamentais detalhados
    
    Args:
        date_filter: Data específica para filtrar (opcional)
        hours: Últimas N horas para análise
    
    Retorna:
        - Zonas quentes (heatmap)
        - Padrões de fluxo
        - Tempo médio de permanência
        - Trajetórias mais comuns
    """
    try:
        # Obter dados históricos do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Calcular período
        end_time = datetime.now()
        if date_filter:
            start_time = datetime.combine(date_filter, datetime.min.time())
            end_time = start_time + timedelta(days=1)
        else:
            start_time = end_time - timedelta(hours=hours)
        
        # Buscar dados comportamentais
        query = """
            SELECT * FROM behavior_analytics 
            WHERE timestamp BETWEEN %s AND %s
            ORDER BY timestamp DESC
        """
        
        try:
            behavior_data = await db.fetch_all(query, (start_time, end_time))
        except Exception:
            # Se tabela não existe, retornar dados mock
            behavior_data = []
        
        if not behavior_data:
            return {
                "status": "success",
                "message": "Nenhum dado comportamental encontrado para o período",
                "data": {
                    "period": f"{start_time.isoformat()} to {end_time.isoformat()}",
                    "total_records": 0,
                    "hot_zones": [],
                    "flow_patterns": [],
                    "avg_dwell_time": 0,
                    "trajectories": []
                }
            }
        
        # Processar dados
        hot_zones = []
        flow_patterns = {}
        total_dwell = 0
        trajectories = []
        
        for record in behavior_data:
            # Extrair zonas quentes
            if record.get('zone_visits'):
                for zone, visits in record['zone_visits'].items():
                    hot_zones.append({
                        "zone": zone,
                        "visits": visits,
                        "timestamp": record['timestamp']
                    })
            
            # Acumular tempo de permanência
            if record.get('dwell_time_minutes'):
                total_dwell += record['dwell_time_minutes']
            
            # Extrair trajetórias
            if record.get('trajectory_data'):
                trajectories.append(record['trajectory_data'])
            
            # Padrões de fluxo
            pattern = record.get('behavior_pattern', 'normal')
            flow_patterns[pattern] = flow_patterns.get(pattern, 0) + 1
        
        avg_dwell = total_dwell / len(behavior_data) if behavior_data else 0
        
        return {
            "status": "success",
            "data": {
                "period": f"{start_time.isoformat()} to {end_time.isoformat()}",
                "total_records": len(behavior_data),
                "hot_zones": hot_zones,
                "flow_patterns": flow_patterns,
                "avg_dwell_time": round(avg_dwell, 2),
                "trajectories": trajectories[:10],  # Limitar a 10 trajetórias
                "summary": {
                    "most_visited_zones": sorted(
                        hot_zones, 
                        key=lambda x: x['visits'], 
                        reverse=True
                    )[:5],
                    "dominant_flow_pattern": max(flow_patterns, key=flow_patterns.get) if flow_patterns else "normal"
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter padrões comportamentais: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/predictions", response_model=Dict[str, Any])
async def get_predictions(
    prediction_type: Optional[str] = Query(None, description="Tipo de predição"),
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Obter predições de IA
    
    Args:
        prediction_type: Tipo específico ('flow', 'conversion', 'staffing', 'all')
    
    Retorna:
        - Previsão de fluxo por hora
        - Probabilidade de conversão
        - Staffing recomendado
        - Tendências identificadas
    """
    try:
        if not engine.predictive:
            raise HTTPException(
                status_code=503,
                detail="Módulo de predições não inicializado"
            )
        
        # Gerar predições em tempo real
        current_time = datetime.now()
        historical_data = engine._get_historical_data()
        
        predictions = await engine.predictive.generate_predictions(
            historical_data=historical_data,
            current_state={
                'current_count': engine.last_metrics.total_people if engine.last_metrics else 0,
                'current_time': current_time,
                'day_of_week': current_time.weekday(),
                'hour_of_day': current_time.hour
            },
            timestamp=current_time
        )
        
        # Filtrar por tipo se especificado
        if prediction_type and prediction_type != 'all':
            if prediction_type in predictions:
                filtered_predictions = {prediction_type: predictions[prediction_type]}
            else:
                filtered_predictions = {}
        else:
            filtered_predictions = predictions
        
        return {
            "status": "success",
            "data": {
                "predictions": filtered_predictions,
                "generated_at": current_time.isoformat(),
                "confidence_levels": {
                    "flow": 0.85,
                    "conversion": 0.78,
                    "staffing": 0.82
                },
                "next_update": (current_time + timedelta(minutes=15)).isoformat(),
                "recommendations": engine.last_metrics.recommendations if engine.last_metrics else []
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter predições: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/segmentation", response_model=Dict[str, Any])
async def get_customer_segmentation(
    days: int = Query(30, ge=1, le=365, description="Período em dias para análise"),
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Obter análise de segmentação de clientes
    
    Args:
        days: Período em dias para análise
    
    Retorna:
        - Segmentos de clientes
        - Perfis comportamentais
        - Métricas de retenção
    """
    try:
        if not engine.segmentation:
            raise HTTPException(
                status_code=503,
                detail="Módulo de segmentação não inicializado"
            )
        
        # Obter dados de clientes dos últimos dias
        segments = await engine.segmentation.segment_customers(
            person_registry=engine.person_registry,
            behavior_data={
                'analysis_period_days': days,
                'current_time': datetime.now()
            }
        )
        
        # Calcular métricas adicionais
        total_customers = sum(segments.values())
        segment_percentages = {}
        
        if total_customers > 0:
            for segment, count in segments.items():
                segment_percentages[segment] = round((count / total_customers) * 100, 1)
        
        return {
            "status": "success",
            "data": {
                "segments": segments,
                "percentages": segment_percentages,
                "total_customers": total_customers,
                "analysis_period_days": days,
                "generated_at": datetime.now().isoformat(),
                "insights": {
                    "dominant_segment": max(segments, key=segments.get) if segments else None,
                    "growth_segments": ["new", "regular"],
                    "at_risk_segments": ["at_risk", "occasional"]
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter segmentação: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/summary", response_model=Dict[str, Any])
async def get_analytics_summary(
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Obter resumo analítico completo do sistema
    
    Retorna:
        - Status dos módulos de IA
        - Métricas gerais
        - Conformidade com privacidade
        - Performance do sistema
    """
    try:
        summary = await engine.get_analytics_summary()
        
        # Adicionar informações de conformidade
        compliance_report = privacy_manager.get_compliance_report()
        
        return {
            "status": "success",
            "data": {
                **summary,
                "privacy_compliance": compliance_report,
                "system_health": {
                    "ai_modules_healthy": all(summary.get('ai_modules_status', {}).values()),
                    "face_recognition_enabled": summary.get('ai_modules_status', {}).get('face_recognition', False),
                    "privacy_compliant": compliance_report.get('compliance_status', {}).get('lgpd_compliant', False)
                },
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter resumo analítico: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/health", response_model=Dict[str, Any])
async def get_analytics_health(
    engine: SmartAnalyticsEngine = Depends(get_smart_engine)
):
    """
    Verificar saúde do sistema de analytics
    
    Retorna:
        - Status de cada módulo
        - Últimas atualizações
        - Erros recentes
    """
    try:
        health_status = {
            "analytics_engine": engine is not None,
            "face_recognition": engine.face_manager is not None if engine else False,
            "behavior_analysis": engine.behavior_analyzer is not None if engine else False,
            "segmentation": engine.segmentation is not None if engine else False,
            "predictions": engine.predictive is not None if engine else False,
            "privacy_manager": privacy_manager is not None,
        }
        
        overall_health = all(health_status.values())
        
        return {
            "status": "success",
            "data": {
                "overall_health": overall_health,
                "modules": health_status,
                "last_metrics_update": engine.last_metrics.timestamp.isoformat() if engine and engine.last_metrics else None,
                "checked_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Erro no health check: {e}")
        return {
            "status": "error",
            "message": str(e),
            "data": {
                "overall_health": False,
                "checked_at": datetime.now().isoformat()
            }
        }

@router.get("/realtime-data", response_model=Dict[str, Any])
async def get_realtime_analytics():
    """
    Obter dados de analytics em tempo real do Supabase
    
    Retorna:
        - Métricas em tempo real
        - Atividades recentes
        - Alertas ativos
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Usar método específico para dados em tempo real
        realtime_data = await db.get_realtime_analytics_data()
        
        return {
            "status": "success",
            "data": realtime_data,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter dados em tempo real: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/flow-visualization", response_model=Dict[str, Any])
async def get_flow_visualization(
    hours: int = Query(24, ge=1, le=168, description="Período em horas")
):
    """
    Obter dados reais para visualização de fluxo de clientes do Supabase
    
    Args:
        hours: Período em horas para análise
    
    Retorna:
        - Mapa de calor de zonas
        - Trajetórias principais
        - Pontos de interesse
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Usar método específico para dados de flow
        flow_data = await db.get_flow_visualization_data(hours)
        
        return {
            "status": "success",
            "data": flow_data,
            "period_hours": hours,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter visualização de fluxo: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/group-analysis", response_model=Dict[str, Any])
async def get_group_analysis(
    days: int = Query(7, ge=1, le=30, description="Período em dias")
):
    """
    Obter análise real de grupos de clientes do Supabase
    
    Args:
        days: Período em dias para análise
    
    Retorna:
        - Tamanhos de grupo mais comuns
        - Comportamento por tipo de grupo
        - Padrões de compra em grupo
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Usar método específico para análise de grupos
        group_data = await db.get_group_analysis_data(days)
        
        return {
            "status": "success",
            "data": group_data,
            "analysis_period_days": days,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter análise de grupos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/period-comparison", response_model=Dict[str, Any])
async def get_period_comparison(
    current_period: str = Query(..., description="Período atual (YYYY-MM-DD to YYYY-MM-DD)"),
    comparison_period: str = Query(..., description="Período de comparação (YYYY-MM-DD to YYYY-MM-DD)")
):
    """
    Comparar métricas reais entre dois períodos do Supabase
    
    Args:
        current_period: Período atual no formato "YYYY-MM-DD to YYYY-MM-DD"
        comparison_period: Período de comparação no formato "YYYY-MM-DD to YYYY-MM-DD"
    
    Retorna:
        - Métricas comparativas
        - Variações percentuais
        - Insights sobre mudanças
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Usar método específico para comparação de períodos
        comparison_data = await db.get_period_comparison_data(current_period, comparison_period)
        
        return {
            "status": "success",
            "data": comparison_data,
            "periods": {
                "current": current_period,
                "comparison": comparison_period
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao comparar períodos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/benchmarks", response_model=Dict[str, Any])
async def get_industry_benchmarks(
    industry: str = Query("retail", description="Setor da indústria"),
    store_size: str = Query("medium", description="Tamanho da loja (small/medium/large)")
):
    """
    Obter benchmarks reais da indústria para comparação
    
    Args:
        industry: Setor da indústria
        store_size: Tamanho da loja
    
    Retorna:
        - Benchmarks por categoria
        - Posição relativa da loja
        - Oportunidades de melhoria
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Usar método específico para benchmarks
        benchmark_data = await db.get_industry_benchmarks_data(industry, store_size)
        
        return {
            "status": "success",
            "data": benchmark_data,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter benchmarks: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_metrics():
    """
    Obter métricas do dashboard em tempo real

    Retorna dados reais do Supabase para uso no frontend
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()

        # Buscar métricas do dashboard
        dashboard_data = await db.get_dashboard_metrics()

        return {
            "status": "success",
            "current_people": dashboard_data.get("current_people", 0),
            "total_entries": dashboard_data.get("total_entries", 0),
            "total_exits": dashboard_data.get("total_exits", 0),
            "conversion_rate": dashboard_data.get("conversion_rate", 0),
            "avg_time_spent": dashboard_data.get("avg_time_spent", "00:00:00"),
            "peak_hour": dashboard_data.get("peak_hour", 14),
            "peak_count": dashboard_data.get("peak_count", 0),
            "revenue_today": dashboard_data.get("revenue_today", 0),
            "sales_today": dashboard_data.get("sales_today", 0),
            "last_updated": dashboard_data.get("last_updated"),
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Erro ao obter métricas do dashboard: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/real-time", response_model=Dict[str, Any])
async def get_real_time_analytics():
    """
    Obter analytics em tempo real incluindo funcionários ativos e métricas anteriores

    Retorna dados para comparação de trends
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()

        # Buscar dados atuais
        current_stats = await db.get_current_stats()

        # Buscar dados da hora anterior para comparação
        from datetime import datetime, timedelta
        previous_hour = datetime.now() - timedelta(hours=1)
        previous_stats = await db.get_camera_stats(hours=1)

        # Estimar funcionários ativos (pode ser melhorado com dados reais)
        active_employees = 8  # Valor padrão por enquanto

        return {
            "status": "success",
            "active_employees": active_employees,
            "current_metrics": {
                "people_in_store": current_stats.get("people_count", 0),
                "total_today": current_stats.get("total_entries", 0),
                "conversion_rate": 0,  # Será calculado
                "average_time": 15
            },
            "previous_metrics": {
                "people_in_store": previous_stats.get("total_people", 0),
                "conversion_rate": 0,
                "average_time": 15
            },
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Erro ao obter analytics em tempo real: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/flow-data", response_model=Dict[str, Any])
async def get_flow_data(
    start: str = Query(..., description="Data/hora de início (ISO format)"),
    end: str = Query(..., description="Data/hora de fim (ISO format)"),
    period: str = Query("24h", description="Período (24h, 7d, 30d)")
):
    """
    Obter dados de fluxo em tempo real para gráficos

    Args:
        start: Data/hora de início
        end: Data/hora de fim
        period: Período de agregação

    Retorna dados históricos reais de fluxo por hora
    """
    try:
        # Obter dados reais do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()

        # Buscar eventos de câmera no período
        camera_events = await db.get_camera_events(
            camera_id=None,  # Todas as câmeras
            start_date=start,
            end_date=end
        )

        # Agrupar por hora
        from collections import defaultdict
        hourly_data = defaultdict(lambda: {"customers": 0, "employees": 0, "total": 0})

        for event in camera_events:
            timestamp = event.get("timestamp", "")
            try:
                event_time = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                hour_key = event_time.strftime("%Y-%m-%d %H:00:00")

                customers = event.get("customers_count", 0)
                employees = event.get("employees_count", 0)

                hourly_data[hour_key]["customers"] += customers
                hourly_data[hour_key]["employees"] += employees
                hourly_data[hour_key]["total"] += customers + employees

            except ValueError:
                continue

        # Converter para formato esperado pelo frontend
        flow_data = []
        for hour_key, data in sorted(hourly_data.items()):
            flow_data.append({
                "timestamp": hour_key,
                "customers_count": data["customers"],
                "employees_count": data["employees"],
                "total_count": data["total"]
            })

        return {
            "status": "success",
            "flow_data": flow_data,
            "period": period,
            "start_time": start,
            "end_time": end,
            "total_events": len(camera_events),
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Erro ao obter dados de fluxo: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

from fastapi import BackgroundTasks
from fastapi.responses import StreamingResponse
import json
import asyncio

@router.get("/stream")
async def stream_real_time_events():
    """
    Stream de eventos em tempo real via Server-Sent Events (SSE)

    Conecta ao Supabase real-time e transmite eventos para o frontend
    """
    async def event_generator():
        try:
            # Configurar conexão com dados reais
            db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            await db.initialize()

            while True:
                try:
                    # Buscar eventos recentes (últimos 10 segundos)
                    from datetime import datetime, timedelta
                    recent_time = datetime.now() - timedelta(seconds=10)

                    recent_events = await db.get_camera_events(
                        camera_id=None,
                        start_date=recent_time.isoformat(),
                        limit=5
                    )

                    # Enviar eventos se houver
                    for event in recent_events:
                        event_data = {
                            "id": f"event_{event.get('id', 'unknown')}",
                            "camera_id": event.get("camera_id", "cam_1"),
                            "person_type": "customer" if event.get("customers_count", 0) > 0 else "employee",
                            "confidence": 0.9,
                            "timestamp": event.get("timestamp", datetime.now().isoformat()),
                            "bbox": {"x": 100, "y": 100, "width": 50, "height": 50},
                            "people_count": event.get("people_count", 0),
                            "customers_count": event.get("customers_count", 0),
                            "employees_count": event.get("employees_count", 0)
                        }

                        yield f"data: {json.dumps(event_data)}\n\n"

                    # Aguardar antes da próxima verificação
                    await asyncio.sleep(5)

                except Exception as e:
                    logger.error(f"Erro no stream de eventos: {e}")
                    await asyncio.sleep(10)

        except Exception as e:
            logger.error(f"Erro fatal no stream: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )