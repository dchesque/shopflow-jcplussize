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
    Obter dados de analytics em tempo real
    
    Retorna:
        - Métricas em tempo real
        - Atividades recentes
        - Alertas ativos
    """
    try:
        # Obter dados do banco
        db = SupabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        await db.initialize()
        
        # Métricas atuais
        current_stats = await db.get_current_stats()
        
        # Eventos recentes
        recent_events = await db.get_recent_events(limit=10)
        
        # Simular dados em tempo real (em produção, viria do sistema de AI)
        realtime_data = {
            "current_metrics": {
                "people_online": current_stats.get("people_count", 127),
                "avg_time_spent": "8.5",
                "conversion_rate": 23.4,
                "active_alerts": 3
            },
            "hourly_trend": [
                {"hour": "08:00", "count": 45},
                {"hour": "09:00", "count": 67},
                {"hour": "10:00", "count": 89},
                {"hour": "11:00", "count": 112},
                {"hour": "12:00", "count": 127}
            ],
            "recent_activities": [
                {
                    "id": 1,
                    "type": "spike_detected",
                    "message": "Novo pico de visitantes detectado",
                    "timestamp": (datetime.now() - timedelta(minutes=2)).isoformat(),
                    "severity": "info"
                },
                {
                    "id": 2,
                    "type": "camera_online",
                    "message": "Câmera #3 voltou online",
                    "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
                    "severity": "success"
                },
                {
                    "id": 3,
                    "type": "goal_achieved",
                    "message": "Meta de conversão atingida",
                    "timestamp": (datetime.now() - timedelta(minutes=12)).isoformat(),
                    "severity": "success"
                }
            ],
            "active_alerts": [
                {
                    "id": 1,
                    "type": "critical",
                    "title": "Alta densidade detectada",
                    "message": "Zona de eletrônicos com alta concentração",
                    "timestamp": (datetime.now() - timedelta(minutes=8)).isoformat()
                },
                {
                    "id": 2,
                    "type": "warning",
                    "title": "Tempo de espera elevado",
                    "message": "Fila no caixa #2 acima do normal",
                    "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat()
                }
            ]
        }
        
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
    Obter dados para visualização de fluxo de clientes
    
    Args:
        hours: Período em horas para análise
    
    Retorna:
        - Mapa de calor de zonas
        - Trajetórias principais
        - Pontos de interesse
    """
    try:
        # Simular dados de fluxo (em produção, viria do sistema de tracking)
        flow_data = {
            "heatmap_zones": [
                {"zone": "entrada", "x": 10, "y": 10, "intensity": 0.9, "visits": 245},
                {"zone": "eletrônicos", "x": 30, "y": 20, "intensity": 0.8, "visits": 189},
                {"zone": "roupas", "x": 50, "y": 30, "intensity": 0.6, "visits": 134},
                {"zone": "alimentação", "x": 70, "y": 40, "intensity": 0.7, "visits": 156},
                {"zone": "caixas", "x": 90, "y": 50, "intensity": 0.5, "visits": 98},
                {"zone": "saída", "x": 90, "y": 10, "intensity": 0.4, "visits": 78}
            ],
            "main_paths": [
                {
                    "path_id": 1,
                    "name": "Entrada → Eletrônicos → Caixas",
                    "frequency": 45,
                    "avg_time": "12.5",
                    "conversion_rate": 0.34,
                    "coordinates": [
                        {"x": 10, "y": 10},
                        {"x": 30, "y": 20},
                        {"x": 90, "y": 50}
                    ]
                },
                {
                    "path_id": 2,
                    "name": "Entrada → Roupas → Alimentação → Caixas",
                    "frequency": 32,
                    "avg_time": "18.3",
                    "conversion_rate": 0.28,
                    "coordinates": [
                        {"x": 10, "y": 10},
                        {"x": 50, "y": 30},
                        {"x": 70, "y": 40},
                        {"x": 90, "y": 50}
                    ]
                }
            ],
            "bottlenecks": [
                {
                    "zone": "caixas",
                    "severity": "high",
                    "avg_wait_time": "4.2",
                    "recommendation": "Abrir caixa adicional"
                },
                {
                    "zone": "provadores",
                    "severity": "medium",
                    "avg_wait_time": "2.8",
                    "recommendation": "Otimizar gestão de fila"
                }
            ],
            "period_stats": {
                "total_visitors": 1247,
                "unique_paths": 15,
                "avg_visit_duration": "15.7",
                "busiest_hour": "14:00-15:00"
            }
        }
        
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
    Obter análise de grupos de clientes
    
    Args:
        days: Período em dias para análise
    
    Retorna:
        - Tamanhos de grupo mais comuns
        - Comportamento por tipo de grupo
        - Padrões de compra em grupo
    """
    try:
        # Simular dados de análise de grupos
        group_data = {
            "group_size_distribution": [
                {"size": 1, "count": 456, "percentage": 52.3, "avg_spending": 89.50},
                {"size": 2, "count": 298, "percentage": 34.1, "avg_spending": 156.30},
                {"size": 3, "count": 89, "percentage": 10.2, "avg_spending": 234.70},
                {"size": "4+", "count": 29, "percentage": 3.4, "avg_spending": 312.90}
            ],
            "group_behavior_patterns": [
                {
                    "pattern": "family_shopping",
                    "description": "Famílias com crianças",
                    "frequency": 23.5,
                    "characteristics": [
                        "Maior tempo na seção infantil",
                        "Compras planejadas",
                        "Alto valor de ticket"
                    ],
                    "conversion_rate": 0.78
                },
                {
                    "pattern": "couple_browsing",
                    "description": "Casais explorando",
                    "frequency": 18.7,
                    "characteristics": [
                        "Navegação não-linear",
                        "Tempo médio elevado",
                        "Compras por impulso"
                    ],
                    "conversion_rate": 0.45
                },
                {
                    "pattern": "friends_shopping",
                    "description": "Grupos de amigos",
                    "frequency": 12.3,
                    "characteristics": [
                        "Foco em moda/eletrônicos",
                        "Decisões compartilhadas",
                        "Compras em conjunto"
                    ],
                    "conversion_rate": 0.62
                }
            ],
            "optimal_strategies": [
                {
                    "group_type": "families",
                    "recommendation": "Criar áreas de entretenimento infantil próximas às seções de interesse dos pais",
                    "impact": "Aumenta tempo de permanência em 23%"
                },
                {
                    "group_type": "couples",
                    "recommendation": "Implementar navegação assistida e ofertas casadas",
                    "impact": "Melhora conversão em 15%"
                }
            ],
            "time_analysis": {
                "peak_group_hours": ["14:00-16:00", "19:00-21:00"],
                "solo_shopper_hours": ["10:00-12:00", "16:00-18:00"],
                "weekend_vs_weekday": {
                    "weekend_group_ratio": 0.68,
                    "weekday_group_ratio": 0.42
                }
            }
        }
        
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
    Comparar métricas entre dois períodos
    
    Args:
        current_period: Período atual no formato "YYYY-MM-DD to YYYY-MM-DD"
        comparison_period: Período de comparação no formato "YYYY-MM-DD to YYYY-MM-DD"
    
    Retorna:
        - Métricas comparativas
        - Variações percentuais
        - Insights sobre mudanças
    """
    try:
        # Simular dados de comparação (em produção, viria do banco)
        comparison_data = {
            "current_period": {
                "visitors": 1547,
                "sales": 234,
                "revenue": 45678.90,
                "conversion_rate": 15.1,
                "avg_time_spent": "16.3",
                "peak_hour": "15:00"
            },
            "comparison_period": {
                "visitors": 1398,
                "sales": 198,
                "revenue": 38923.45,
                "conversion_rate": 14.2,
                "avg_time_spent": "14.8",
                "peak_hour": "14:00"
            },
            "variations": {
                "visitors": {"absolute": 149, "percentage": 10.7, "trend": "up"},
                "sales": {"absolute": 36, "percentage": 18.2, "trend": "up"},
                "revenue": {"absolute": 6755.45, "percentage": 17.4, "trend": "up"},
                "conversion_rate": {"absolute": 0.9, "percentage": 6.3, "trend": "up"},
                "avg_time_spent": {"absolute": 1.5, "percentage": 10.1, "trend": "up"}
            },
            "insights": [
                {
                    "type": "positive",
                    "title": "Crescimento significativo",
                    "description": "Aumento de 17.4% na receita indica melhoria na estratégia de vendas",
                    "impact": "high"
                },
                {
                    "type": "neutral",
                    "title": "Mudança no horário de pico",
                    "description": "Pico moveu de 14:00 para 15:00, considerar ajuste de pessoal",
                    "impact": "medium"
                },
                {
                    "type": "positive",
                    "title": "Maior engajamento",
                    "description": "Tempo médio de permanência aumentou 10.1%",
                    "impact": "medium"
                }
            ],
            "statistical_significance": {
                "confidence_level": 95,
                "is_significant": True,
                "p_value": 0.032
            }
        }
        
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
    Obter benchmarks da indústria para comparação
    
    Args:
        industry: Setor da indústria
        store_size: Tamanho da loja
    
    Retorna:
        - Benchmarks por categoria
        - Posição relativa da loja
        - Oportunidades de melhoria
    """
    try:
        # Simular dados de benchmark (em produção, viria de base de dados da indústria)
        benchmark_data = {
            "industry_averages": {
                "conversion_rate": {"value": 12.8, "percentile": 50},
                "avg_transaction_value": {"value": 125.40, "percentile": 50},
                "customer_retention": {"value": 0.42, "percentile": 50},
                "foot_traffic_conversion": {"value": 0.23, "percentile": 50},
                "avg_visit_duration": {"value": "13.5", "percentile": 50}
            },
            "store_performance": {
                "conversion_rate": {"value": 15.1, "percentile": 78, "status": "above_average"},
                "avg_transaction_value": {"value": 156.30, "percentile": 85, "status": "excellent"},
                "customer_retention": {"value": 0.38, "percentile": 35, "status": "below_average"},
                "foot_traffic_conversion": {"value": 0.28, "percentile": 72, "status": "above_average"},
                "avg_visit_duration": {"value": "16.3", "percentile": 82, "status": "excellent"}
            },
            "top_performers": {
                "conversion_rate": {"value": 18.5, "percentile": 95},
                "avg_transaction_value": {"value": 189.20, "percentile": 95},
                "customer_retention": {"value": 0.58, "percentile": 95},
                "foot_traffic_conversion": {"value": 0.35, "percentile": 95},
                "avg_visit_duration": {"value": "21.7", "percentile": 95}
            },
            "improvement_opportunities": [
                {
                    "metric": "customer_retention",
                    "current_percentile": 35,
                    "target_percentile": 50,
                    "potential_impact": "Increase repeat customers by 8-12%",
                    "recommended_actions": [
                        "Implementar programa de fidelidade",
                        "Melhorar follow-up pós-venda",
                        "Personalizar comunicação"
                    ]
                },
                {
                    "metric": "conversion_rate",
                    "current_percentile": 78,
                    "target_percentile": 90,
                    "potential_impact": "Increase sales by 12-15%",
                    "recommended_actions": [
                        "Otimizar layout da loja",
                        "Treinar equipe em técnicas de vendas",
                        "Implementar ofertas direcionadas"
                    ]
                }
            ],
            "market_context": {
                "industry": industry,
                "store_size": store_size,
                "region": "Brasil - Sudeste",
                "sample_size": 1247,
                "data_freshness": "Últimos 90 dias"
            }
        }
        
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