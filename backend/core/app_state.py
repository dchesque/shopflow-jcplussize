"""
Estado global da aplicação para compartilhar instâncias entre módulos
"""

from typing import Optional
from core.ai.smart_analytics_engine import SmartAnalyticsEngine

# Estado global da aplicação
smart_engine: Optional[SmartAnalyticsEngine] = None

def set_smart_engine(engine: SmartAnalyticsEngine):
    """Definir a instância global do Smart Analytics Engine"""
    global smart_engine
    smart_engine = engine

def get_smart_engine() -> Optional[SmartAnalyticsEngine]:
    """Obter a instância global do Smart Analytics Engine"""
    return smart_engine