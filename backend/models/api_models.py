"""
Modelos Pydantic para API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ActionType(str, Enum):
    ENTER = "ENTER"
    EXIT = "EXIT"

class SeverityType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

# ============================================================================
# MODELS PARA BRIDGE
# ============================================================================

class FrameData(BaseModel):
    timestamp: str = Field(..., description="Timestamp do frame")
    frame_data: str = Field(..., description="Frame em base64")
    frame_size: int = Field(..., description="Tamanho do frame em bytes")
    resolution: str = Field(..., description="Resolução do frame (e.g., '1920x1080')")
    bridge_id: str = Field(..., description="ID do bridge")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Metadados adicionais")

class HeartbeatData(BaseModel):
    bridge_id: str = Field(..., description="ID do bridge")
    timestamp: str = Field(..., description="Timestamp do heartbeat")
    status: str = Field(..., description="Status do bridge")
    stats: Dict[str, Any] = Field(..., description="Estatísticas do bridge")
    system: Dict[str, Any] = Field(..., description="Informações do sistema")

# ============================================================================
# MODELS PARA PEOPLE EVENTS
# ============================================================================

class PeopleEvent(BaseModel):
    id: Optional[str] = None
    timestamp: datetime
    action: ActionType
    person_tracking_id: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    snapshot_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default={})
    camera_zone: str = Field(default="main")

class PeopleEventCreate(BaseModel):
    action: ActionType
    person_tracking_id: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    snapshot_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default={})
    camera_zone: str = Field(default="main")

# ============================================================================
# MODELS PARA STATS
# ============================================================================

class CurrentStats(BaseModel):
    people_count: int = Field(..., ge=0)
    total_entries: int = Field(..., ge=0)
    total_exits: int = Field(..., ge=0)
    last_updated: Optional[datetime] = None
    date: str

class HourlyStats(BaseModel):
    date: str
    hour: int = Field(..., ge=0, le=23)
    entries: int = Field(..., ge=0)
    exits: int = Field(..., ge=0)
    max_people: int = Field(..., ge=0)
    avg_people: float = Field(..., ge=0.0)
    peak_time: Optional[str] = None

class DashboardMetrics(BaseModel):
    current_people: int = Field(..., ge=0)
    total_entries: int = Field(..., ge=0)
    total_exits: int = Field(..., ge=0)
    sales_today: int = Field(..., ge=0)
    revenue_today: float = Field(..., ge=0.0)
    conversion_rate: float = Field(..., ge=0.0, le=100.0)
    avg_time_spent: str
    peak_hour: int = Field(..., ge=0, le=23)
    peak_count: int = Field(..., ge=0)
    last_updated: Optional[datetime] = None
    date: str

# ============================================================================
# MODELS PARA SALES
# ============================================================================

class SalesData(BaseModel):
    timestamp: datetime
    amount: float = Field(..., gt=0)
    items: int = Field(default=1, ge=1)
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default={})

class SalesImportRequest(BaseModel):
    sales: List[SalesData]

class ConversionRate(BaseModel):
    visitors: int = Field(..., ge=0)
    sales_count: int = Field(..., ge=0)
    conversion_rate: float = Field(..., ge=0.0, le=100.0)
    total_sales_amount: float = Field(..., ge=0.0)
    date: str

# ============================================================================
# MODELS PARA CAMERA CONFIG
# ============================================================================

class CameraConfigData(BaseModel):
    name: str = Field(default="Main Camera")
    rtsp_url: str = Field(..., description="URL RTSP da câmera")
    line_position: int = Field(default=50, ge=0, le=100, description="Posição da linha (% do topo)")
    is_active: bool = Field(default=True)
    fps: int = Field(default=30, ge=1, le=60)
    resolution: str = Field(default="1920x1080")
    detection_zone: Optional[Dict[str, float]] = Field(
        default={"x": 0, "y": 0, "width": 100, "height": 100},
        description="Zona de detecção em percentuais"
    )
    confidence_threshold: float = Field(default=0.5, ge=0.1, le=1.0)

class CameraConfig(CameraConfigData):
    id: str
    created_at: datetime
    updated_at: datetime

# ============================================================================
# MODELS PARA ALERTS
# ============================================================================

class AlertCreate(BaseModel):
    type: str = Field(..., description="Tipo do alerta")
    title: str = Field(..., description="Título do alerta")
    message: str = Field(..., description="Mensagem do alerta")
    severity: SeverityType = Field(default=SeverityType.INFO)
    metadata: Optional[Dict[str, Any]] = Field(default={})

class Alert(AlertCreate):
    id: str
    is_read: bool = Field(default=False)
    created_at: datetime

# ============================================================================
# MODELS PARA SYSTEM LOGS
# ============================================================================

class SystemLogCreate(BaseModel):
    level: str = Field(..., description="Nível do log")
    message: str = Field(..., description="Mensagem do log")
    component: str = Field(..., description="Componente que gerou o log")
    metadata: Optional[Dict[str, Any]] = Field(default={})

class SystemLog(SystemLogCreate):
    id: str
    created_at: datetime

# ============================================================================
# MODELS PARA RESPONSES
# ============================================================================

class ApiResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    components: Dict[str, bool]
    uptime: Optional[float] = None

# ============================================================================
# MODELS PARA WEBSOCKET
# ============================================================================

class WebSocketMessage(BaseModel):
    type: str
    data: Optional[Dict[str, Any]] = None
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())

class MetricsUpdate(BaseModel):
    type: str = "metrics_update"
    data: DashboardMetrics
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())

class EventNotification(BaseModel):
    type: str = "event_notification"
    event_type: str
    data: Dict[str, Any]
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())

class AlertNotification(BaseModel):
    type: str = "alert"
    alert_type: str
    title: str
    message: str
    severity: SeverityType
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())

# ============================================================================
# MODELS PARA REPORTS
# ============================================================================

class ReportRequest(BaseModel):
    start_date: str = Field(..., description="Data início (YYYY-MM-DD)")
    end_date: str = Field(..., description="Data fim (YYYY-MM-DD)")
    format: str = Field(default="json", description="Formato: json, csv, pdf, excel")
    include_charts: bool = Field(default=True)
    timezone: str = Field(default="America/Sao_Paulo")

class ReportData(BaseModel):
    period: str
    total_visitors: int
    total_sales: int
    total_revenue: float
    avg_conversion_rate: float
    peak_hours: List[Dict[str, Any]]
    daily_breakdown: List[Dict[str, Any]]
    hourly_heatmap: List[Dict[str, Any]]

# ============================================================================
# MODELS PARA TRACKING
# ============================================================================

class DetectionData(BaseModel):
    bbox: List[int] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    center: List[int] = Field(..., description="Centro [x, y]")
    confidence: float = Field(..., ge=0.0, le=1.0)
    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)
    area: int = Field(..., gt=0)
    class_name: str = Field(default="person")

class TrackingStats(BaseModel):
    active_persons: int = Field(..., ge=0)
    total_positions_tracked: int = Field(..., ge=0)
    average_confidence: float = Field(..., ge=0.0, le=1.0)
    max_disappeared_time: int = Field(..., gt=0)
    max_tracking_distance: float = Field(..., gt=0.0)
    next_id: int = Field(..., ge=0)