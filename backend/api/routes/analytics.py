"""
Analytics API Routes - Rotas para análises inteligentes do ShopFlow
Fornece endpoints para métricas avançadas, predições e insights
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
import asyncio
from loguru import logger

from core.ai.smart_analytics_engine import SmartAnalyticsEngine, SmartMetrics
from core.ai.privacy_config import privacy_manager
from core.database import DatabaseManager
from models.api_models import ApiResponse
from core.app_state import get_smart_engine as get_global_engine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# Instância global do Smart Analytics Engine
smart_engine: Optional[SmartAnalyticsEngine] = None

async def get_smart_engine() -> SmartAnalyticsEngine:
    """Dependency para obter instância do Smart Analytics Engine"""
    engine = get_global_engine()
    if engine is None:
        raise HTTPException(
            status_code=500,
            detail="Smart Analytics Engine não inicializado"
        )
    return engine

def init_smart_engine(engine: SmartAnalyticsEngine):
    """Inicializar instância do Smart Analytics Engine"""
    global smart_engine
    smart_engine = engine
    logger.info("🚀 Smart Analytics Engine inicializado no router analytics")

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
        db = DatabaseManager()
        
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
async def get_analytics_health():
    """
    Verificar saúde do sistema de analytics
    
    Retorna:
        - Status de cada módulo
        - Últimas atualizações
        - Erros recentes
    """
    try:
        global smart_engine
        
        health_status = {
            "analytics_engine": smart_engine is not None,
            "face_recognition": smart_engine.face_manager is not None if smart_engine else False,
            "behavior_analysis": smart_engine.behavior_analyzer is not None if smart_engine else False,
            "segmentation": smart_engine.segmentation is not None if smart_engine else False,
            "predictions": smart_engine.predictive is not None if smart_engine else False,
            "privacy_manager": privacy_manager is not None,
        }
        
        overall_health = all(health_status.values())
        
        return {
            "status": "success",
            "data": {
                "overall_health": overall_health,
                "modules": health_status,
                "last_metrics_update": smart_engine.last_metrics.timestamp.isoformat() if smart_engine and smart_engine.last_metrics else None,
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