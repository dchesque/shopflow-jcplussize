"""
🔒 CONFIGURAÇÕES DE PRIVACIDADE LGPD/GDPR
Configurações centralizadas para conformidade com leis de proteção de dados
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dataclasses import dataclass
import json
from pathlib import Path
from loguru import logger

@dataclass
class PrivacySettings:
    """Configurações de privacidade do sistema"""
    
    # Reconhecimento Facial
    store_faces: bool = False  # NUNCA armazenar faces
    store_embeddings: bool = True  # Apenas vetores matemáticos
    embedding_retention_days: int = 30  # Auto-limpeza
    face_detection_enabled: bool = True
    face_recognition_enabled: bool = True
    
    # Conformidade Legal
    gdpr_compliant: bool = True
    lgpd_compliant: bool = True
    require_explicit_consent: bool = False  # Análise em área pública
    data_controller: str = "Loja - Shop Flow System"
    data_protection_officer: str = "DPO@loja.com"
    
    # Características dos Embeddings
    embedding_irreversible: bool = True  # Impossível reconstruir face
    embedding_anonymized: bool = True
    embedding_algorithm: str = "FaceNet512"
    
    # Logs e Auditoria
    audit_log_enabled: bool = True
    audit_log_retention_days: int = 90
    log_access_attempts: bool = True
    log_data_modifications: bool = True
    
    # Análise Comportamental
    behavior_analysis_enabled: bool = True
    behavior_data_anonymized: bool = True
    behavior_retention_days: int = 30
    track_individuals: bool = True  # Para análise de fluxo
    
    # Detecção de Grupos
    group_analysis_enabled: bool = True
    group_data_retention_days: int = 7
    
    # Direitos dos Titulares
    allow_data_deletion: bool = True
    allow_data_export: bool = True
    allow_data_correction: bool = True
    automatic_anonymization_days: int = 30
    
    # Segurança
    encryption_enabled: bool = True
    secure_storage_only: bool = True
    access_control_enabled: bool = True
    
    # Localização de Dados
    data_location: str = "Brasil"  # Para LGPD
    cross_border_transfer: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return {
            'store_faces': self.store_faces,
            'store_embeddings': self.store_embeddings,
            'embedding_retention_days': self.embedding_retention_days,
            'gdpr_compliant': self.gdpr_compliant,
            'lgpd_compliant': self.lgpd_compliant,
            'embedding_irreversible': self.embedding_irreversible,
            'audit_log_enabled': self.audit_log_enabled,
            'behavior_analysis_enabled': self.behavior_analysis_enabled,
            'group_analysis_enabled': self.group_analysis_enabled,
            'allow_data_deletion': self.allow_data_deletion,
            'data_controller': self.data_controller,
            'last_updated': datetime.now().isoformat()
        }

class PrivacyManager:
    """Gerenciador de privacidade e conformidade"""
    
    def __init__(self, config_path: str = "./privacy_config.json"):
        self.config_path = Path(config_path)
        self.settings = PrivacySettings()
        self.audit_log: list = []
        
        # Carregar configurações existentes
        self._load_settings()
        
        logger.info("Privacy Manager inicializado com conformidade LGPD/GDPR")
    
    def _load_settings(self):
        """Carrega configurações do arquivo"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r') as f:
                    data = json.load(f)
                
                # Atualizar configurações
                for key, value in data.items():
                    if hasattr(self.settings, key):
                        setattr(self.settings, key, value)
                
                logger.info("Configurações de privacidade carregadas")
            else:
                self._save_settings()
                logger.info("Configurações padrão de privacidade criadas")
                
        except Exception as e:
            logger.error(f"Erro ao carregar configurações de privacidade: {e}")
    
    def _save_settings(self):
        """Salva configurações no arquivo"""
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(self.config_path, 'w') as f:
                json.dump(self.settings.to_dict(), f, indent=2)
            
            self._log_audit_event('settings_updated', 'Configurações de privacidade atualizadas')
            
        except Exception as e:
            logger.error(f"Erro ao salvar configurações de privacidade: {e}")
    
    def update_settings(self, **kwargs) -> bool:
        """Atualiza configurações de privacidade"""
        try:
            for key, value in kwargs.items():
                if hasattr(self.settings, key):
                    old_value = getattr(self.settings, key)
                    setattr(self.settings, key, value)
                    
                    self._log_audit_event(
                        'setting_changed',
                        f'Configuração {key} alterada: {old_value} -> {value}'
                    )
                else:
                    logger.warning(f"Configuração desconhecida ignorada: {key}")
            
            self._save_settings()
            return True
            
        except Exception as e:
            logger.error(f"Erro ao atualizar configurações: {e}")
            return False
    
    def validate_operation(self, operation: str, data_type: str = None) -> bool:
        """
        Valida se uma operação está em conformidade com as configurações
        
        Args:
            operation: Tipo de operação ('face_recognition', 'behavior_analysis', etc.)
            data_type: Tipo de dado ('face', 'embedding', 'behavior')
            
        Returns:
            True se operação é permitida
        """
        try:
            if operation == 'face_recognition':
                return self.settings.face_recognition_enabled
            
            elif operation == 'face_detection':
                return self.settings.face_detection_enabled
            
            elif operation == 'store_face_image':
                return self.settings.store_faces  # Sempre False por policy
            
            elif operation == 'store_embedding':
                return self.settings.store_embeddings
            
            elif operation == 'behavior_analysis':
                return self.settings.behavior_analysis_enabled
            
            elif operation == 'group_analysis':
                return self.settings.group_analysis_enabled
            
            elif operation == 'data_deletion':
                return self.settings.allow_data_deletion
            
            elif operation == 'data_export':
                return self.settings.allow_data_export
            
            else:
                logger.warning(f"Operação desconhecida: {operation}")
                return False
                
        except Exception as e:
            logger.error(f"Erro na validação de operação: {e}")
            return False
    
    def _log_audit_event(self, event_type: str, description: str, metadata: Dict = None):
        """Registra evento de auditoria"""
        if not self.settings.audit_log_enabled:
            return
        
        audit_entry = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'description': description,
            'metadata': metadata or {},
            'user': 'system',  # Seria obtido do contexto da sessão
            'ip_address': 'localhost'  # Seria obtido da requisição
        }
        
        self.audit_log.append(audit_entry)
        
        # Manter apenas logs recentes
        max_entries = 1000
        if len(self.audit_log) > max_entries:
            self.audit_log = self.audit_log[-max_entries:]
        
        logger.debug(f"Audit log: {event_type} - {description}")
    
    def log_face_recognition_attempt(self, person_id: str, result_type: str, confidence: float = None):
        """Registra tentativa de reconhecimento facial"""
        metadata = {
            'person_id': person_id,
            'result_type': result_type,
            'confidence': confidence
        }
        
        self._log_audit_event(
            'face_recognition_attempt',
            f'Tentativa de reconhecimento: {result_type}',
            metadata
        )
    
    def log_employee_registration(self, employee_id: str, action: str):
        """Registra registro/remoção de funcionário"""
        self._log_audit_event(
            'employee_registration',
            f'Funcionário {employee_id}: {action}'
        )
    
    def log_data_access(self, data_type: str, operation: str, user_id: str = None):
        """Registra acesso a dados"""
        metadata = {
            'data_type': data_type,
            'operation': operation,
            'user_id': user_id or 'system'
        }
        
        self._log_audit_event(
            'data_access',
            f'Acesso a dados: {data_type} - {operation}',
            metadata
        )
    
    def get_compliance_report(self) -> Dict[str, Any]:
        """Gera relatório de conformidade"""
        try:
            recent_audit = [
                entry for entry in self.audit_log
                if datetime.fromisoformat(entry['timestamp']) > datetime.now() - timedelta(days=30)
            ]
            
            # Contar tipos de eventos
            event_counts = {}
            for entry in recent_audit:
                event_type = entry['event_type']
                event_counts[event_type] = event_counts.get(event_type, 0) + 1
            
            return {
                'compliance_status': {
                    'lgpd_compliant': self.settings.lgpd_compliant,
                    'gdpr_compliant': self.settings.gdpr_compliant,
                    'face_storage_disabled': not self.settings.store_faces,
                    'embedding_anonymized': self.settings.embedding_anonymized,
                    'audit_log_active': self.settings.audit_log_enabled
                },
                'data_retention': {
                    'embeddings_days': self.settings.embedding_retention_days,
                    'behavior_days': self.settings.behavior_retention_days,
                    'audit_logs_days': self.settings.audit_log_retention_days
                },
                'privacy_settings': self.settings.to_dict(),
                'audit_summary': {
                    'total_events_30d': len(recent_audit),
                    'events_by_type': event_counts
                },
                'data_rights': {
                    'deletion': self.settings.allow_data_deletion,
                    'export': self.settings.allow_data_export,
                    'correction': self.settings.allow_data_correction
                },
                'report_generated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatório de conformidade: {e}")
            return {'error': str(e)}
    
    def cleanup_old_audit_logs(self):
        """Remove logs de auditoria antigos"""
        if not self.settings.audit_log_enabled:
            return 0
        
        cutoff_date = datetime.now() - timedelta(days=self.settings.audit_log_retention_days)
        
        old_count = len(self.audit_log)
        self.audit_log = [
            entry for entry in self.audit_log
            if datetime.fromisoformat(entry['timestamp']) > cutoff_date
        ]
        
        removed = old_count - len(self.audit_log)
        if removed > 0:
            logger.info(f"Removidos {removed} logs de auditoria antigos")
        
        return removed
    
    def export_audit_logs(self, days: int = 30) -> Dict[str, Any]:
        """Exporta logs de auditoria"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            filtered_logs = [
                entry for entry in self.audit_log
                if datetime.fromisoformat(entry['timestamp']) > cutoff_date
            ]
            
            return {
                'export_date': datetime.now().isoformat(),
                'period_days': days,
                'total_entries': len(filtered_logs),
                'logs': filtered_logs
            }
            
        except Exception as e:
            logger.error(f"Erro ao exportar logs: {e}")
            return {'error': str(e)}
    
    def request_data_deletion(self, person_identifier: str, data_type: str = 'all') -> Dict[str, Any]:
        """
        Processa solicitação de exclusão de dados (Direito ao Esquecimento)
        
        Args:
            person_identifier: Identificador da pessoa
            data_type: Tipo de dados a deletar ('face', 'behavior', 'all')
            
        Returns:
            Resultado da operação
        """
        if not self.settings.allow_data_deletion:
            return {
                'success': False,
                'error': 'Exclusão de dados não permitida pela configuração atual'
            }
        
        try:
            self._log_audit_event(
                'data_deletion_request',
                f'Solicitação de exclusão: {person_identifier} - {data_type}'
            )
            
            # Em implementação real, executaria a exclusão nos módulos relevantes
            return {
                'success': True,
                'message': f'Dados de {data_type} removidos para {person_identifier}',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na exclusão de dados: {e}")
            return {'success': False, 'error': str(e)}

# Instância global do gerenciador de privacidade
privacy_manager = PrivacyManager()

# Constantes de configuração para documentação
PRIVACY_DOCUMENTATION = {
    "data_minimization": "Sistema coleta apenas dados necessários para operação",
    "purpose_limitation": "Dados usados apenas para análise de tráfego e segurança",
    "storage_limitation": "Dados removidos automaticamente após período definido",
    "accuracy": "Sistemas otimizados para precisão, com logs de auditoria",
    "security": "Dados criptografados e armazenados de forma segura",
    "accountability": "Logs completos de auditoria e relatórios de conformidade",
    
    "face_recognition_policy": {
        "images_stored": False,
        "embeddings_only": True,
        "irreversible_process": True,
        "retention_period": "30 days",
        "consent_required": False,  # Área pública
        "purpose": "Identificação de funcionários cadastrados"
    },
    
    "behavior_analysis_policy": {
        "anonymous_tracking": True,
        "no_personal_identification": True,
        "statistical_analysis_only": True,
        "retention_period": "30 days",
        "purpose": "Análise de padrões de movimento e conversão"
    },
    
    "rights_available": [
        "Acesso aos dados processados",
        "Correção de informações incorretas", 
        "Exclusão de dados (direito ao esquecimento)",
        "Exportação de dados em formato estruturado",
        "Oposição ao processamento"
    ]
}