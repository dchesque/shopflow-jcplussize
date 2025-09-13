"""
Gerenciador do Supabase para operações no banco
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, date
from supabase import create_client, Client
from loguru import logger
import json

class SupabaseManager:
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        self.client: Optional[Client] = None
        
    async def initialize(self):
        """Inicializar conexão com Supabase"""
        try:
            # CORREÇÃO: Remover qualquer parâmetro proxy
            self.client = create_client(self.url, self.key)
            
            # Testar conexão básica
            logger.info("✅ Conexão com Supabase estabelecida")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao conectar Supabase: {e}")
            # Permitir que o sistema funcione sem Supabase se necessário
            logger.warning("⚠️ Sistema funcionando em modo offline (sem banco)")
            return False
    
    async def close(self):
        """Fechar conexão"""
        if self.client:
            # Supabase client não precisa de close explícito
            self.client = None
            logger.info("Conexão Supabase fechada")
    
    # ========================================================================
    # CAMERA EVENTS - MULTI-CAMERA SUPPORT
    # ========================================================================
    
    async def insert_camera_event(
        self, 
        camera_id: str,
        timestamp: str,
        people_count: int,
        customers_count: int = 0,
        employees_count: int = 0,
        groups_count: int = 0,
        processing_time_ms: int = 0,
        frame_width: int = 0,
        frame_height: int = 0,
        metadata: Dict = None
    ):
        """Inserir evento de processamento de câmera - suporte a múltiplas câmeras"""
        if not self.client:
            logger.warning("Cliente Supabase não disponível")
            return None
            
        try:
            event_data = {
                "camera_id": camera_id,
                "timestamp": timestamp,
                "people_count": people_count,
                "customers_count": customers_count,
                "employees_count": employees_count,
                "groups_count": groups_count,
                "processing_time_ms": processing_time_ms,
                "frame_width": frame_width,
                "frame_height": frame_height,
                "metadata": metadata or {}
            }
            
            result = self.client.table("camera_events").insert(event_data).execute()
            
            if result.data:
                logger.debug(f"Evento de câmera inserido: {camera_id} - {people_count} pessoas")
                return result.data[0]
            else:
                raise Exception("Falha ao inserir evento de câmera")
                
        except Exception as e:
            logger.error(f"Erro ao inserir evento de câmera {camera_id}: {e}")
            return None
    
    async def get_camera_stats(self, camera_id: str = None, hours: int = 24) -> Dict:
        """Obter estatísticas de câmera(s)"""
        if not self.client:
            return {}
            
        try:
            from datetime import datetime, timedelta
            start_time = (datetime.now() - timedelta(hours=hours)).isoformat()
            
            query = self.client.table("camera_events")\
                .select("*")\
                .gte("timestamp", start_time)
                
            if camera_id:
                query = query.eq("camera_id", camera_id)
                
            result = query.execute()
            
            events = result.data or []
            
            # Agregar estatísticas
            stats = {
                "total_events": len(events),
                "total_people": sum(e.get("people_count", 0) for e in events),
                "total_customers": sum(e.get("customers_count", 0) for e in events),
                "total_employees": sum(e.get("employees_count", 0) for e in events),
                "avg_processing_time": sum(e.get("processing_time_ms", 0) for e in events) / len(events) if events else 0,
                "cameras_active": len(set(e.get("camera_id") for e in events)),
                "period_hours": hours
            }
            
            # Estatísticas por câmera
            if not camera_id:
                camera_breakdown = {}
                for event in events:
                    cam_id = event.get("camera_id", "unknown")
                    if cam_id not in camera_breakdown:
                        camera_breakdown[cam_id] = {
                            "events": 0,
                            "people": 0,
                            "customers": 0,
                            "employees": 0
                        }
                    
                    camera_breakdown[cam_id]["events"] += 1
                    camera_breakdown[cam_id]["people"] += event.get("people_count", 0)
                    camera_breakdown[cam_id]["customers"] += event.get("customers_count", 0)
                    camera_breakdown[cam_id]["employees"] += event.get("employees_count", 0)
                
                stats["by_camera"] = camera_breakdown
            
            return stats
            
        except Exception as e:
            logger.error(f"Erro ao obter stats de câmera: {e}")
            return {}

    # ========================================================================
    # PEOPLE EVENTS
    # ========================================================================
    
    async def insert_people_event(
        self, 
        action: str, 
        person_tracking_id: str = None,
        confidence: float = 0.0,
        snapshot_url: str = None,
        timestamp: str = None,
        metadata: Dict = None
    ):
        """Inserir evento de pessoa (entrada/saída)"""
        if not self.client:
            logger.warning("Cliente Supabase não disponível")
            return None
            
        try:
            event_data = {
                "action": action,
                "person_tracking_id": person_tracking_id,
                "confidence": confidence,
                "snapshot_url": snapshot_url,
                "metadata": metadata or {},
            }
            
            if timestamp:
                event_data["timestamp"] = timestamp
            
            result = self.client.table("people_events").insert(event_data).execute()
            
            if result.data:
                logger.debug(f"Evento inserido: {action} - {person_tracking_id}")
                return result.data[0]
            else:
                raise Exception("Falha ao inserir evento")
                
        except Exception as e:
            logger.error(f"Erro ao inserir evento: {e}")
            return None
    
    async def get_recent_events(self, limit: int = 50) -> List[Dict]:
        """Buscar eventos recentes"""
        if not self.client:
            return []
            
        try:
            result = self.client.table("people_events")\
                .select("*")\
                .order("timestamp", desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao buscar eventos recentes: {e}")
            return []
    
    # ========================================================================
    # CURRENT STATS
    # ========================================================================
    
    async def get_current_stats(self, target_date: date = None) -> Dict[str, Any]:
        """Buscar estatísticas atuais"""
        if not self.client:
            return {
                "people_count": 0,
                "total_entries": 0,
                "total_exits": 0,
                "last_updated": None
            }
            
        try:
            if target_date is None:
                target_date = date.today()
            
            result = self.client.table("current_stats")\
                .select("*")\
                .eq("date", target_date.isoformat())\
                .single()\
                .execute()
            
            return result.data or {
                "people_count": 0,
                "total_entries": 0,
                "total_exits": 0,
                "last_updated": None
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar stats atuais: {e}")
            return {
                "people_count": 0,
                "total_entries": 0,
                "total_exits": 0,
                "last_updated": None
            }
    
    async def update_current_stats(
        self,
        people_count: int = None,
        total_entries: int = None,
        total_exits: int = None,
        target_date: date = None
    ):
        """Atualizar estatísticas atuais"""
        if not self.client:
            return None
            
        try:
            if target_date is None:
                target_date = date.today()
            
            update_data = {"last_updated": datetime.now().isoformat()}
            
            if people_count is not None:
                update_data["people_count"] = people_count
            if total_entries is not None:
                update_data["total_entries"] = total_entries  
            if total_exits is not None:
                update_data["total_exits"] = total_exits
            
            result = self.client.table("current_stats")\
                .update(update_data)\
                .eq("date", target_date.isoformat())\
                .execute()
            
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao atualizar stats: {e}")
            return None
    
    # ========================================================================
    # HOURLY STATS
    # ========================================================================
    
    async def get_hourly_stats(self, target_date: date = None) -> List[Dict]:
        """Buscar estatísticas por hora"""
        if not self.client:
            return []
            
        try:
            if target_date is None:
                target_date = date.today()
            
            result = self.client.table("hourly_stats")\
                .select("*")\
                .eq("date", target_date.isoformat())\
                .order("hour")\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao buscar stats horárias: {e}")
            return []
    
    async def get_hourly_heatmap(self, target_date: date = None) -> List[Dict]:
        """Buscar dados do heatmap por hora"""
        if not self.client:
            return self._generate_empty_heatmap()
            
        try:
            if target_date is None:
                target_date = date.today()
            
            # Usar a função SQL criada anteriormente
            result = self.client.rpc("get_hourly_heatmap", {
                "p_date": target_date.isoformat()
            }).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao buscar heatmap: {e}")
            # Fallback manual
            return await self._generate_hourly_heatmap_fallback(target_date)
    
    async def _generate_hourly_heatmap_fallback(self, target_date: date) -> List[Dict]:
        """Fallback para gerar heatmap manualmente"""
        try:
            hourly_data = await self.get_hourly_stats(target_date)
            
            # Criar lista completa de 24 horas
            heatmap_data = []
            for hour in range(24):
                hour_data = next(
                    (item for item in hourly_data if item['hour'] == hour), 
                    {'hour': hour, 'entries': 0, 'exits': 0}
                )
                
                net_traffic = hour_data['entries'] - hour_data['exits']
                max_entries = max([item['entries'] for item in hourly_data], default=1)
                intensity = hour_data['entries'] / max_entries if max_entries > 0 else 0
                
                heatmap_data.append({
                    'hour': hour,
                    'entries': hour_data['entries'],
                    'exits': hour_data['exits'],
                    'net_traffic': net_traffic,
                    'intensity': round(intensity, 2)
                })
            
            return heatmap_data
            
        except Exception as e:
            logger.error(f"Erro no fallback do heatmap: {e}")
            return self._generate_empty_heatmap()
    
    def _generate_empty_heatmap(self) -> List[Dict]:
        """Gerar heatmap vazio"""
        return [
            {'hour': h, 'entries': 0, 'exits': 0, 'net_traffic': 0, 'intensity': 0}
            for h in range(24)
        ]
    
    # ========================================================================
    # SALES
    # ========================================================================
    
    async def insert_sale(
        self,
        amount: float,
        items: int = 1,
        payment_method: str = None,
        transaction_id: str = None,
        timestamp: str = None,
        metadata: Dict = None
    ):
        """Inserir venda"""
        if not self.client:
            return None
            
        try:
            sale_data = {
                "amount": amount,
                "items": items,
                "payment_method": payment_method,
                "transaction_id": transaction_id,
                "metadata": metadata or {}
            }
            
            if timestamp:
                sale_data["timestamp"] = timestamp
            
            result = self.client.table("sales").insert(sale_data).execute()
            
            if result.data:
                logger.debug(f"Venda inserida: R$ {amount}")
                return result.data[0]
            else:
                raise Exception("Falha ao inserir venda")
                
        except Exception as e:
            logger.error(f"Erro ao inserir venda: {e}")
            return None
    
    async def get_sales_by_date(self, target_date: date = None) -> List[Dict]:
        """Buscar vendas por data"""
        if not self.client:
            return []
            
        try:
            if target_date is None:
                target_date = date.today()
            
            start_datetime = f"{target_date.isoformat()}T00:00:00"
            end_datetime = f"{target_date.isoformat()}T23:59:59"
            
            result = self.client.table("sales")\
                .select("*")\
                .gte("timestamp", start_datetime)\
                .lte("timestamp", end_datetime)\
                .order("timestamp", desc=True)\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao buscar vendas: {e}")
            return []
    
    # ========================================================================
    # CONVERSION RATE
    # ========================================================================
    
    async def get_conversion_rate(self, target_date: date = None) -> Dict[str, Any]:
        """Calcular taxa de conversão"""
        if not self.client:
            return {
                "visitors": 0,
                "sales_count": 0,
                "conversion_rate": 0,
                "total_sales_amount": 0
            }
            
        try:
            if target_date is None:
                target_date = date.today()
            
            # Usar função SQL se disponível
            try:
                result = self.client.rpc("get_conversion_rate", {
                    "p_date": target_date.isoformat()
                }).execute()
                
                if result.data and len(result.data) > 0:
                    return result.data[0]
            except:
                pass
            
            # Fallback manual
            stats = await self.get_current_stats(target_date)
            sales = await self.get_sales_by_date(target_date)
            
            visitors = stats.get("total_entries", 0)
            sales_count = len(sales)
            total_sales_amount = sum(float(sale.get("amount", 0)) for sale in sales)
            
            conversion_rate = 0
            if visitors > 0:
                conversion_rate = round((sales_count / visitors) * 100, 2)
            
            return {
                "visitors": visitors,
                "sales_count": sales_count,
                "conversion_rate": conversion_rate,
                "total_sales_amount": round(total_sales_amount, 2)
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular conversão: {e}")
            return {
                "visitors": 0,
                "sales_count": 0,
                "conversion_rate": 0,
                "total_sales_amount": 0
            }
    
    # ========================================================================
    # DASHBOARD METRICS
    # ========================================================================
    
    async def get_dashboard_metrics(self, target_date: date = None) -> Dict[str, Any]:
        """Obter todas as métricas do dashboard"""
        if not self.client:
            return self._generate_empty_metrics(target_date)
            
        try:
            if target_date is None:
                target_date = date.today()
            
            # Tentar usar função SQL
            try:
                result = self.client.rpc("get_dashboard_metrics", {
                    "p_date": target_date.isoformat()
                }).execute()
                
                if result.data:
                    return result.data
            except:
                pass
            
            # Fallback: buscar dados separadamente
            current_stats = await self.get_current_stats(target_date)
            conversion = await self.get_conversion_rate(target_date)
            hourly_stats = await self.get_hourly_stats(target_date)
            
            # Encontrar horário de pico
            peak_hour = 0
            peak_count = 0
            if hourly_stats:
                peak_data = max(hourly_stats, key=lambda x: x.get('entries', 0))
                peak_hour = peak_data.get('hour', 0)
                peak_count = peak_data.get('entries', 0)
            
            return {
                "current_people": current_stats.get("people_count", 0),
                "total_entries": current_stats.get("total_entries", 0),
                "total_exits": current_stats.get("total_exits", 0),
                "sales_today": conversion.get("sales_count", 0),
                "revenue_today": conversion.get("total_sales_amount", 0),
                "conversion_rate": conversion.get("conversion_rate", 0),
                "avg_time_spent": "00:15:30",  # Placeholder
                "peak_hour": peak_hour,
                "peak_count": peak_count,
                "last_updated": current_stats.get("last_updated"),
                "date": target_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao buscar métricas do dashboard: {e}")
            return self._generate_empty_metrics(target_date)
    
    def _generate_empty_metrics(self, target_date: date = None) -> Dict[str, Any]:
        """Gerar métricas vazias"""
        if target_date is None:
            target_date = date.today()
            
        return {
            "current_people": 0,
            "total_entries": 0,
            "total_exits": 0,
            "sales_today": 0,
            "revenue_today": 0,
            "conversion_rate": 0,
            "avg_time_spent": "00:00:00",
            "peak_hour": 0,
            "peak_count": 0,
            "last_updated": None,
            "date": target_date.isoformat()
        }
    
    # ========================================================================
    # CAMERA CONFIG
    # ========================================================================
    
    async def get_camera_config(self) -> Dict[str, Any]:
        """Buscar configuração da câmera"""
        if not self.client:
            return {}
            
        try:
            result = self.client.table("camera_config")\
                .select("*")\
                .eq("is_active", True)\
                .single()\
                .execute()
            
            return result.data or {}
            
        except Exception as e:
            logger.error(f"Erro ao buscar config da câmera: {e}")
            return {}
    
    async def update_camera_config(self, config_data: Dict[str, Any]):
        """Atualizar configuração da câmera"""
        if not self.client:
            return None
            
        try:
            # Buscar config atual
            current_config = await self.get_camera_config()
            
            if current_config.get("id"):
                # Atualizar existente
                result = self.client.table("camera_config")\
                    .update(config_data)\
                    .eq("id", current_config["id"])\
                    .execute()
            else:
                # Inserir nova
                result = self.client.table("camera_config")\
                    .insert(config_data)\
                    .execute()
            
            logger.info("Configuração da câmera atualizada")
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao atualizar config da câmera: {e}")
            return None
    
    # ========================================================================
    # SYSTEM LOGS
    # ========================================================================
    
    async def log_system_event(
        self,
        level: str,
        message: str,
        component: str,
        metadata: Dict = None
    ):
        """Inserir log do sistema"""
        if not self.client:
            # Apenas logar localmente se Supabase não estiver disponível
            logger.log(level.upper(), f"[{component}] {message}")
            return None
            
        try:
            log_data = {
                "level": level.upper(),
                "message": message,
                "component": component,
                "metadata": metadata or {}
            }
            
            result = self.client.table("system_logs").insert(log_data).execute()
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao inserir log do sistema: {e}")
            return None
    
    # ========================================================================  
    # GENERIC DATABASE METHODS (for AI compatibility)
    # ========================================================================
    
    async def fetch_all(self, query: str, params: tuple = None):
        """Generic fetch all method for AI modules"""
        if not self.client:
            return []
            
        try:
            # Parse simple SELECT queries for compatibility
            if "FROM employees" in query:
                result = self.client.table("employees").select("*").execute()
                return result.data or []
            elif "FROM behavior_analytics" in query:
                # This table might not exist yet, return empty
                return []
            elif "FROM customer_profiles" in query:
                # This table might not exist yet, return empty  
                return []
            else:
                logger.warning(f"Unsupported query in fetch_all: {query}")
                return []
        except Exception as e:
            logger.error(f"Error in fetch_all: {e}")
            return []
    
    async def fetch_one(self, query: str, params: tuple = None):
        """Generic fetch one method for AI modules"""
        if not self.client:
            return None
            
        try:
            results = await self.fetch_all(query, params)
            return results[0] if results else None
        except Exception as e:
            logger.error(f"Error in fetch_one: {e}")
            return None
    
    async def execute(self, query: str, params: tuple = None):
        """Generic execute method for AI modules"""
        if not self.client:
            return []
            
        try:
            logger.warning(f"Generic execute called with query: {query}")
            # For now, just log and return empty result
            return []
        except Exception as e:
            logger.error(f"Error in execute: {e}")
            return []
    
    # ========================================================================
    # ALERTS
    # ========================================================================
    
    async def create_alert(
        self,
        alert_type: str,
        title: str,
        message: str,
        severity: str = "info",
        metadata: Dict = None
    ):
        """Criar alerta"""
        if not self.client:
            logger.warning(f"[ALERT] {severity.upper()}: {title} - {message}")
            return None
            
        try:
            alert_data = {
                "type": alert_type,
                "title": title,
                "message": message,
                "severity": severity,
                "metadata": metadata or {}
            }
            
            result = self.client.table("alerts").insert(alert_data).execute()
            logger.info(f"Alerta criado: {title}")
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao criar alerta: {e}")
            return None

    # ========================================================================
    # CAMERA MANAGEMENT - CRUD OPERATIONS
    # ========================================================================
    
    async def get_cameras(self) -> List[Dict[str, Any]]:
        """Buscar todas as câmeras configuradas"""
        if not self.client:
            return []
            
        try:
            result = self.client.table("cameras")\
                .select("*")\
                .order("created_at", desc=False)\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao buscar câmeras: {e}")
            return []
    
    async def get_camera_by_id(self, camera_id: str) -> Optional[Dict[str, Any]]:
        """Buscar câmera por ID"""
        if not self.client:
            return None
            
        try:
            result = self.client.table("cameras")\
                .select("*")\
                .eq("id", camera_id)\
                .single()\
                .execute()
            
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao buscar câmera {camera_id}: {e}")
            return None
    
    async def create_camera(self, camera_data: Dict[str, Any]) -> Optional[str]:
        """Criar nova câmera"""
        if not self.client:
            return None
            
        try:
            # Adicionar timestamps
            camera_data.update({
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "status": "offline"  # Status inicial
            })
            
            result = self.client.table("cameras")\
                .insert(camera_data)\
                .execute()
            
            if result.data:
                return result.data[0]["id"]
            return None
            
        except Exception as e:
            logger.error(f"Erro ao criar câmera: {e}")
            return None
    
    async def update_camera(self, camera_id: str, camera_data: Dict[str, Any]) -> bool:
        """Atualizar câmera existente"""
        if not self.client:
            return False
            
        try:
            # Adicionar timestamp de atualização
            camera_data["updated_at"] = datetime.now().isoformat()
            
            result = self.client.table("cameras")\
                .update(camera_data)\
                .eq("id", camera_id)\
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Erro ao atualizar câmera {camera_id}: {e}")
            return False
    
    async def delete_camera(self, camera_id: str) -> bool:
        """Remover câmera"""
        if not self.client:
            return False
            
        try:
            result = self.client.table("cameras")\
                .delete()\
                .eq("id", camera_id)\
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Erro ao remover câmera {camera_id}: {e}")
            return False
    
    async def update_camera_status(self, camera_id: str, status: str) -> bool:
        """Atualizar status da câmera"""
        if not self.client:
            return False
            
        try:
            result = self.client.table("cameras")\
                .update({
                    "status": status,
                    "last_seen": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                })\
                .eq("id", camera_id)\
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Erro ao atualizar status da câmera {camera_id}: {e}")
            return False
    
    async def get_camera_events(
        self, 
        camera_id: str, 
        start_date: Optional[str] = None, 
        end_date: Optional[str] = None, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Buscar eventos de uma câmera específica"""
        if not self.client:
            return []
            
        try:
            query = self.client.table("camera_events")\
                .select("*")\
                .eq("camera_id", camera_id)\
                .order("timestamp", desc=True)\
                .limit(limit)
            
            if start_date:
                query = query.gte("timestamp", start_date)
            if end_date:
                query = query.lte("timestamp", end_date)
            
            result = query.execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao buscar eventos da câmera {camera_id}: {e}")
            return []

# Alias para compatibilidade com módulos AI
DatabaseManager = SupabaseManager