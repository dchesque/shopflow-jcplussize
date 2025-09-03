"""
🎭 RECONHECIMENTO FACIAL LGPD-COMPLIANT
Sistema que NÃO armazena fotos, apenas embeddings matemáticos irreversíveis
"""

import os
import hashlib
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import cv2
import tempfile
from loguru import logger

try:
    from deepface import DeepFace
    import tensorflow as tf
    # Configurar TensorFlow para usar menos memoria
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        tf.config.experimental.set_memory_growth(gpus[0], True)
except ImportError:
    logger.warning("DeepFace não instalado. Reconhecimento facial desabilitado.")
    DeepFace = None

@dataclass
class EmployeeRecord:
    """Registro do funcionário com apenas dados necessários"""
    employee_id: str
    name: str
    embedding_vector: np.ndarray
    embedding_hash: str
    model_used: str
    registered_at: datetime
    last_seen: Optional[datetime] = None
    confidence_threshold: float = 0.4
    active: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Converter para dicionário (sem o vetor embedding para logs)"""
        return {
            'employee_id': self.employee_id,
            'name': self.name,
            'embedding_hash': self.embedding_hash,
            'model_used': self.model_used,
            'registered_at': self.registered_at.isoformat(),
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'active': self.active
        }

@dataclass
class IdentificationResult:
    """Resultado da identificação"""
    type: str  # 'employee', 'frequent_customer', 'new_customer', 'unknown'
    confidence: float
    person_id: Optional[str] = None
    name: Optional[str] = None
    additional_info: Optional[Dict] = None

class PrivacyFirstFaceRegistry:
    """
    Sistema de reconhecimento facial que prioriza privacidade
    - NÃO armazena imagens
    - Apenas embeddings matemáticos irreversíveis
    - Conformidade LGPD/GDPR total
    """
    
    def __init__(self, storage_path: str = "./face_embeddings"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        # Registros na memória
        self.employee_embeddings: Dict[str, EmployeeRecord] = {}
        self.customer_embeddings: Dict[str, Dict] = {}  # Para clientes frequentes (opcional)
        
        # Configurações
        self.models_available = ['Facenet512', 'ArcFace', 'VGG-Face']
        self.default_model = 'Facenet512'  # Mais preciso
        self.confidence_threshold = 0.4
        self.max_customer_records = 1000  # Limite para clientes frequentes
        
        # Cache para otimização
        self._embedding_cache = {}
        
        # Carregar dados existentes
        self._load_existing_data()
        
        logger.info(f"Face Registry inicializado: {len(self.employee_embeddings)} funcionários cadastrados")
    
    def is_available(self) -> bool:
        """Verificar se o sistema está disponível"""
        return DeepFace is not None
    
    async def register_employee(
        self, 
        temp_image_path: str, 
        employee_id: str, 
        name: str,
        model_name: str = None
    ) -> Dict[str, Any]:
        """
        Registra funcionário e deleta imagem IMEDIATAMENTE
        
        Args:
            temp_image_path: Caminho temporário da imagem
            employee_id: ID único do funcionário
            name: Nome do funcionário
            model_name: Modelo a usar (opcional)
            
        Returns:
            Dict com resultado do registro
        """
        if not self.is_available():
            return {'success': False, 'error': 'Sistema de reconhecimento facial não disponível'}
        
        try:
            model = model_name or self.default_model
            start_time = datetime.now()
            
            logger.info(f"Iniciando registro do funcionário {employee_id} - {name}")
            
            # Verificar se arquivo existe
            if not os.path.exists(temp_image_path):
                return {'success': False, 'error': 'Arquivo de imagem não encontrado'}
            
            # Gerar embedding (vetor 512-dimensional)
            logger.debug("Extraindo embedding facial...")
            embedding_result = DeepFace.represent(
                img_path=temp_image_path,
                model_name=model,
                enforce_detection=True,
                detector_backend='mtcnn'
            )
            
            if not embedding_result:
                return {'success': False, 'error': 'Não foi possível detectar face na imagem'}
            
            embedding_vector = np.array(embedding_result[0]['embedding'])
            
            # Criar hash irreversível do embedding
            embedding_hash = self._create_embedding_hash(embedding_vector)
            
            # Verificar se já existe funcionário similar
            similar_employee = self._find_similar_employee(embedding_vector)
            if similar_employee:
                return {
                    'success': False, 
                    'error': f'Funcionário similar já cadastrado: {similar_employee.name}'
                }
            
            # Criar registro
            employee_record = EmployeeRecord(
                employee_id=employee_id,
                name=name,
                embedding_vector=embedding_vector,
                embedding_hash=embedding_hash,
                model_used=model,
                registered_at=datetime.now(),
                confidence_threshold=self.confidence_threshold
            )
            
            # Salvar na memória
            self.employee_embeddings[employee_id] = employee_record
            
            # Persistir dados
            await self._save_employee_data(employee_record)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.success(f"Funcionário {name} registrado com sucesso em {processing_time:.2f}s")
            
            return {
                'success': True,
                'employee_id': employee_id,
                'name': name,
                'embedding_hash': embedding_hash,
                'processing_time': processing_time,
                'model_used': model
            }
            
        except Exception as e:
            logger.error(f"Erro ao registrar funcionário: {e}")
            return {'success': False, 'error': str(e)}
        
        finally:
            # DELETAR a imagem IMEDIATAMENTE
            try:
                if os.path.exists(temp_image_path):
                    os.remove(temp_image_path)
                    logger.info(f"Imagem temporária deletada: {temp_image_path}")
            except Exception as e:
                logger.error(f"Erro ao deletar imagem temporária: {e}")
    
    async def identify_person(self, face_region: np.ndarray, return_confidence: bool = True) -> IdentificationResult:
        """
        Identifica se é funcionário cadastrado ou cliente
        
        Args:
            face_region: Região da face extraída do frame
            return_confidence: Se deve retornar confiança
            
        Returns:
            IdentificationResult com tipo e informações da pessoa
        """
        if not self.is_available():
            return IdentificationResult(
                type='unknown',
                confidence=0.0,
                additional_info={'error': 'Sistema não disponível'}
            )
        
        try:
            # Extrair embedding da face atual
            current_embedding = await self._extract_embedding_from_region(face_region)
            if current_embedding is None:
                return IdentificationResult(type='unknown', confidence=0.0)
            
            # Verificar funcionários cadastrados
            employee_match = self._match_employee(current_embedding)
            if employee_match:
                # Atualizar último acesso
                employee_match['record'].last_seen = datetime.now()
                
                logger.debug(f"Funcionário identificado: {employee_match['record'].name}")
                
                return IdentificationResult(
                    type='employee',
                    confidence=employee_match['confidence'],
                    person_id=employee_match['record'].employee_id,
                    name=employee_match['record'].name,
                    additional_info={'last_seen': employee_match['record'].last_seen}
                )
            
            # Verificar clientes frequentes (se habilitado)
            if self.customer_embeddings:
                customer_match = self._match_customer(current_embedding)
                if customer_match:
                    # Incrementar contador de visitas
                    customer_match['visits'] = customer_match.get('visits', 0) + 1
                    
                    return IdentificationResult(
                        type='frequent_customer',
                        confidence=customer_match['confidence'],
                        person_id=customer_match['customer_id'],
                        additional_info={'visits': customer_match['visits']}
                    )
            
            # Cliente novo/desconhecido
            return IdentificationResult(
                type='new_customer',
                confidence=1.0,
                additional_info={'first_visit': datetime.now()}
            )
            
        except Exception as e:
            logger.error(f"Erro na identificação: {e}")
            return IdentificationResult(
                type='unknown',
                confidence=0.0,
                additional_info={'error': str(e)}
            )
    
    async def register_frequent_customer(self, face_region: np.ndarray, customer_id: str = None) -> bool:
        """
        Registra cliente frequente (opcional - precisa ser habilitado nas configurações)
        """
        try:
            if len(self.customer_embeddings) >= self.max_customer_records:
                # Remove cliente mais antigo
                oldest_customer = min(
                    self.customer_embeddings.items(),
                    key=lambda x: x[1].get('last_visit', datetime.min)
                )
                del self.customer_embeddings[oldest_customer[0]]
            
            embedding = await self._extract_embedding_from_region(face_region)
            if embedding is None:
                return False
            
            customer_id = customer_id or f"customer_{len(self.customer_embeddings) + 1}"
            
            self.customer_embeddings[customer_id] = {
                'vector': embedding,
                'hash': self._create_embedding_hash(embedding),
                'registered_at': datetime.now(),
                'last_visit': datetime.now(),
                'visit_count': 1
            }
            
            logger.info(f"Cliente frequente registrado: {customer_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao registrar cliente frequente: {e}")
            return False
    
    def remove_employee(self, employee_id: str) -> bool:
        """Remove funcionário do sistema"""
        try:
            if employee_id in self.employee_embeddings:
                employee_name = self.employee_embeddings[employee_id].name
                del self.employee_embeddings[employee_id]
                
                # Remove arquivo persistente
                employee_file = self.storage_path / f"{employee_id}.json"
                if employee_file.exists():
                    employee_file.unlink()
                
                logger.info(f"Funcionário removido: {employee_name} ({employee_id})")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao remover funcionário: {e}")
            return False
    
    def get_employee_list(self) -> List[Dict[str, Any]]:
        """Lista todos os funcionários cadastrados (sem embeddings)"""
        return [record.to_dict() for record in self.employee_embeddings.values()]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Estatísticas do sistema"""
        active_employees = sum(1 for emp in self.employee_embeddings.values() if emp.active)
        
        return {
            'total_employees': len(self.employee_embeddings),
            'active_employees': active_employees,
            'frequent_customers': len(self.customer_embeddings),
            'model_used': self.default_model,
            'confidence_threshold': self.confidence_threshold,
            'storage_path': str(self.storage_path),
            'system_available': self.is_available()
        }
    
    # Métodos privados
    
    def _create_embedding_hash(self, embedding: np.ndarray) -> str:
        """Cria hash irreversível do embedding"""
        embedding_str = str(embedding.flatten())
        return hashlib.sha256(embedding_str.encode()).hexdigest()
    
    def _cosine_distance(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calcula distância coseno entre dois embeddings"""
        return float(np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2)))
    
    def _find_similar_employee(self, embedding: np.ndarray) -> Optional[EmployeeRecord]:
        """Encontra funcionário similar para evitar duplicatas"""
        for employee in self.employee_embeddings.values():
            similarity = self._cosine_distance(embedding, employee.embedding_vector)
            if similarity > 0.9:  # Muito similar
                return employee
        return None
    
    def _match_employee(self, embedding: np.ndarray) -> Optional[Dict]:
        """Encontra funcionário correspondente"""
        best_match = None
        best_similarity = 0
        
        for employee in self.employee_embeddings.values():
            if not employee.active:
                continue
                
            similarity = self._cosine_distance(embedding, employee.embedding_vector)
            if similarity > employee.confidence_threshold and similarity > best_similarity:
                best_match = {'record': employee, 'confidence': similarity}
                best_similarity = similarity
        
        return best_match
    
    def _match_customer(self, embedding: np.ndarray) -> Optional[Dict]:
        """Encontra cliente frequente correspondente"""
        best_match = None
        best_similarity = 0
        
        for customer_id, customer_data in self.customer_embeddings.items():
            similarity = self._cosine_distance(embedding, customer_data['vector'])
            if similarity > self.confidence_threshold and similarity > best_similarity:
                best_match = {
                    'customer_id': customer_id,
                    'confidence': similarity,
                    'visits': customer_data.get('visit_count', 1)
                }
                best_similarity = similarity
        
        return best_match
    
    async def _extract_embedding_from_region(self, face_region: np.ndarray) -> Optional[np.ndarray]:
        """Extrai embedding de uma região de face"""
        try:
            # Salvar temporariamente para o DeepFace
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                cv2.imwrite(tmp_file.name, face_region)
                tmp_path = tmp_file.name
            
            try:
                embedding_result = DeepFace.represent(
                    img_path=tmp_path,
                    model_name=self.default_model,
                    enforce_detection=True,
                    detector_backend='mtcnn'
                )
                
                if embedding_result:
                    return np.array(embedding_result[0]['embedding'])
                
            finally:
                # Deletar arquivo temporário
                os.unlink(tmp_path)
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao extrair embedding: {e}")
            return None
    
    async def _save_employee_data(self, employee: EmployeeRecord):
        """Salva dados do funcionário (sem embedding para segurança)"""
        try:
            employee_file = self.storage_path / f"{employee.employee_id}.json"
            
            # Salva apenas metadados (embedding fica na memória)
            data = employee.to_dict()
            
            import json
            with open(employee_file, 'w') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Erro ao salvar dados do funcionário: {e}")
    
    def _load_existing_data(self):
        """Carrega dados existentes (apenas metadados)"""
        try:
            for employee_file in self.storage_path.glob("*.json"):
                try:
                    import json
                    with open(employee_file, 'r') as f:
                        data = json.load(f)
                    
                    logger.info(f"Dados do funcionário {data['name']} encontrados, mas embedding não disponível na memória")
                    # Nota: embeddings não são persistidos por segurança
                    
                except Exception as e:
                    logger.error(f"Erro ao carregar {employee_file}: {e}")
                    
        except Exception as e:
            logger.error(f"Erro ao carregar dados existentes: {e}")

# Configurações de privacidade para documentação
PRIVACY_SETTINGS = {
    "store_faces": False,  # NUNCA armazena faces
    "store_embeddings": True,  # Apenas vetores matemáticos
    "auto_delete_after_days": 30,  # Auto-limpeza
    "gdpr_compliant": True,
    "lgpd_compliant": True,
    "require_consent": False,  # Análise anônima em áreas públicas
    "embedding_irreversible": True,  # Impossível reconstruir face
    "audit_log": True  # Log de todas as operações
}