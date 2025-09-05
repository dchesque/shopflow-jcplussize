"""
Face Recognition Manager - Sistema de reconhecimento facial do ShopFlow
Gerencia identificação de funcionários e re-identificação de clientes
"""

import cv2
import numpy as np
# import face_recognition  # Temporarily disabled until dlib is resolved
face_recognition = None
from typing import Dict, List, Optional, Tuple, Any
import pickle
import os
import json
import hashlib
from datetime import datetime
import asyncio
from loguru import logger
import uuid

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("DeepFace não disponível - usando face_recognition")

try:
    import insightface
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False
    logger.warning("InsightFace não disponível")

from ..config import get_settings
from ..database import DatabaseManager

settings = get_settings()

class FaceEncoder:
    """Classe para encoding de faces usando diferentes backends"""
    
    def __init__(self, method: str = "face_recognition"):
        self.method = method
        self.model = None
        self.initialized = False
        
    async def initialize(self):
        """Inicializar o modelo de encoding"""
        try:
            if face_recognition is None:
                logger.warning("face_recognition library not available, using DeepFace only")
                self.method = "deepface"
            
            if self.method == "deepface" and DEEPFACE_AVAILABLE:
                # DeepFace usa modelos pré-treinados automaticamente
                self.initialized = True
                logger.info("✅ DeepFace encoder inicializado")
                
            elif self.method == "insightface" and INSIGHTFACE_AVAILABLE:
                self.model = insightface.app.FaceAnalysis()
                self.model.prepare(ctx_id=0, det_size=(640, 640))
                self.initialized = True
                logger.info("✅ InsightFace encoder inicializado")
                
            else:
                # face_recognition é o fallback padrão
                self.method = "face_recognition"
                self.initialized = True
                logger.info("✅ face_recognition encoder inicializado")
                
        except Exception as e:
            logger.error(f"Erro ao inicializar encoder {self.method}: {e}")
            # Fallback para face_recognition apenas se disponível
            if face_recognition is not None:
                self.method = "face_recognition"
                self.initialized = True
                logger.info("✅ Fallback para face_recognition")
            else:
                logger.warning("⚠️ Face recognition não disponível - módulo desabilitado")
                self.initialized = False
    
    async def encode_face(self, face_image: np.ndarray) -> Optional[np.ndarray]:
        """Extrair encoding da face"""
        if not self.initialized:
            await self.initialize()
            
        try:
            if self.method == "deepface" and DEEPFACE_AVAILABLE:
                # DeepFace
                embedding = DeepFace.represent(
                    img_path=face_image,
                    model_name="Facenet512",
                    enforce_detection=False
                )
                return np.array(embedding[0]["embedding"])
                
            elif self.method == "insightface" and self.model:
                # InsightFace
                faces = self.model.get(face_image)
                if len(faces) > 0:
                    return faces[0].embedding
                return None
                
            else:
                # face_recognition (se disponível)
                if face_recognition is not None:
                    rgb_image = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
                    face_locations = face_recognition.face_locations(rgb_image)
                    
                    if len(face_locations) > 0:
                        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
                        if len(face_encodings) > 0:
                            return face_encodings[0]
                
                logger.warning("Face recognition não disponível")
                return None
                
        except Exception as e:
            logger.error(f"Erro ao extrair encoding: {e}")
            return None
    
    def compare_faces(self, known_encoding: np.ndarray, unknown_encoding: np.ndarray, threshold: float = 0.6) -> bool:
        """Comparar duas faces"""
        try:
            if self.method == "face_recognition" and face_recognition is not None:
                results = face_recognition.compare_faces([known_encoding], unknown_encoding, tolerance=threshold)
                return results[0] if results else False
            else:
                # Para outros métodos, usar distância euclidiana
                distance = np.linalg.norm(known_encoding - unknown_encoding)
                return distance < threshold
                
        except Exception as e:
            logger.error(f"Erro ao comparar faces: {e}")
            return False

class FaceRecognitionManager:
    """
    Gerenciador principal de reconhecimento facial
    """
    
    def __init__(self):
        self.db = None  # Será inicializado posteriormente
        self.encoder = FaceEncoder(method="face_recognition")  # Mais estável
        
        # Cache de embeddings
        self.employee_embeddings = {}  # employee_id -> embedding
        self.customer_embeddings = {}  # customer_id -> embedding
        
        # Configurações
        self.similarity_threshold = 0.6
        self.face_embeddings_dir = "face_embeddings"
        self.max_customers_cache = 1000
        
        # Estatísticas
        self.recognition_stats = {
            'total_recognitions': 0,
            'successful_employee_matches': 0,
            'successful_customer_matches': 0,
            'false_positives': 0
        }
        
        self._ensure_directories()
        
    def _ensure_directories(self):
        """Garantir que os diretórios existam"""
        os.makedirs(self.face_embeddings_dir, exist_ok=True)
        os.makedirs(f"{self.face_embeddings_dir}/employees", exist_ok=True)
        os.makedirs(f"{self.face_embeddings_dir}/customers", exist_ok=True)
    
    async def initialize(self):
        """Inicializar o sistema de reconhecimento facial"""
        try:
            # Inicializar database manager com configurações
            settings = get_settings()
            self.db = DatabaseManager(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            await self.db.initialize()
            
            await self.encoder.initialize()
            logger.info("✅ Face Recognition Manager inicializado")
            
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Face Recognition: {e}")
            raise
    
    async def load_employee_faces(self):
        """Carregar embeddings de funcionários do banco de dados"""
        try:
            query = """
            SELECT employee_id, name, face_encoding 
            FROM employees 
            WHERE is_active = true AND face_encoding IS NOT NULL
            """
            
            results = await self.db.fetch_all(query)
            
            self.employee_embeddings.clear()
            
            for row in results:
                employee_id = row['employee_id']
                face_encoding = json.loads(row['face_encoding']) if row['face_encoding'] else None
                
                if face_encoding:
                    self.employee_embeddings[employee_id] = {
                        'name': row['name'],
                        'encoding': np.array(face_encoding),
                        'last_seen': None
                    }
            
            logger.info(f"✅ Carregados {len(self.employee_embeddings)} funcionários")
            
        except Exception as e:
            logger.error(f"Erro ao carregar funcionários: {e}")
    
    async def register_employee(
        self, 
        name: str, 
        face_image: np.ndarray, 
        employee_id: Optional[str] = None
    ) -> str:
        """
        Registrar novo funcionário no sistema
        
        Args:
            name: Nome do funcionário
            face_image: Imagem da face
            employee_id: ID específico (opcional)
            
        Returns:
            ID do funcionário registrado
        """
        try:
            # Gerar ID se não fornecido
            if not employee_id:
                employee_id = str(uuid.uuid4())[:8]
            
            # Extrair encoding da face
            encoding = await self.encoder.encode_face(face_image)
            
            if encoding is None:
                raise Exception("Não foi possível detectar face na imagem")
            
            # Verificar se já existe funcionário similar
            for emp_id, emp_data in self.employee_embeddings.items():
                if self.encoder.compare_faces(emp_data['encoding'], encoding):
                    raise Exception(f"Funcionário similar já registrado: {emp_data['name']}")
            
            # Salvar no banco de dados
            query = """
            INSERT INTO employees (employee_id, name, face_encoding, registered_at, is_active)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (employee_id) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                face_encoding = EXCLUDED.face_encoding,
                is_active = EXCLUDED.is_active
            """
            
            await self.db.execute(
                query,
                employee_id,
                name,
                json.dumps(encoding.tolist()),
                datetime.now(),
                True
            )
            
            # Adicionar ao cache
            self.employee_embeddings[employee_id] = {
                'name': name,
                'encoding': encoding,
                'last_seen': None
            }
            
            # Salvar embedding em arquivo para backup
            embedding_file = f"{self.face_embeddings_dir}/employees/{employee_id}.pkl"
            with open(embedding_file, 'wb') as f:
                pickle.dump({
                    'name': name,
                    'encoding': encoding,
                    'registered_at': datetime.now().isoformat()
                }, f)
            
            logger.success(f"✅ Funcionário {name} registrado com ID {employee_id}")
            return employee_id
            
        except Exception as e:
            logger.error(f"Erro ao registrar funcionário: {e}")
            raise
    
    async def remove_employee(self, employee_id: str) -> bool:
        """Remover funcionário do sistema"""
        try:
            # Marcar como inativo no banco
            query = "UPDATE employees SET is_active = false WHERE employee_id = $1"
            await self.db.execute(query, employee_id)
            
            # Remover do cache
            if employee_id in self.employee_embeddings:
                del self.employee_embeddings[employee_id]
            
            # Remover arquivo de embedding
            embedding_file = f"{self.face_embeddings_dir}/employees/{employee_id}.pkl"
            if os.path.exists(embedding_file):
                os.remove(embedding_file)
            
            logger.info(f"✅ Funcionário {employee_id} removido")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao remover funcionário: {e}")
            return False
    
    async def is_employee(self, face_image: np.ndarray) -> Tuple[bool, Optional[str]]:
        """
        Verificar se uma face pertence a um funcionário
        
        Returns:
            (is_employee, employee_id)
        """
        try:
            self.recognition_stats['total_recognitions'] += 1
            
            # Extrair encoding da face
            unknown_encoding = await self.encoder.encode_face(face_image)
            
            if unknown_encoding is None:
                return False, None
            
            # Comparar com funcionários conhecidos
            best_match = None
            best_distance = float('inf')
            
            for employee_id, emp_data in self.employee_embeddings.items():
                if self.encoder.compare_faces(emp_data['encoding'], unknown_encoding, self.similarity_threshold):
                    # Calcular distância para escolher o melhor match
                    distance = np.linalg.norm(emp_data['encoding'] - unknown_encoding)
                    
                    if distance < best_distance:
                        best_distance = distance
                        best_match = employee_id
            
            if best_match:
                self.recognition_stats['successful_employee_matches'] += 1
                self.employee_embeddings[best_match]['last_seen'] = datetime.now()
                
                # Atualizar última visita no banco
                query = "UPDATE employees SET last_seen = $1 WHERE employee_id = $2"
                await self.db.execute(query, datetime.now(), best_match)
                
                logger.debug(f"✅ Funcionário reconhecido: {best_match}")
                return True, best_match
            
            return False, None
            
        except Exception as e:
            logger.error(f"Erro no reconhecimento de funcionário: {e}")
            return False, None
    
    async def identify_customer(self, face_image: np.ndarray) -> Optional[str]:
        """
        Tentar identificar cliente conhecido
        
        Returns:
            customer_id se reconhecido, None caso contrário
        """
        try:
            # Extrair encoding da face
            unknown_encoding = await self.encoder.encode_face(face_image)
            
            if unknown_encoding is None:
                return None
            
            # Comparar com clientes conhecidos (cache limitado)
            best_match = None
            best_distance = float('inf')
            
            for customer_id, customer_data in self.customer_embeddings.items():
                if self.encoder.compare_faces(customer_data['encoding'], unknown_encoding, self.similarity_threshold):
                    distance = np.linalg.norm(customer_data['encoding'] - unknown_encoding)
                    
                    if distance < best_distance:
                        best_distance = distance
                        best_match = customer_id
            
            if best_match:
                self.recognition_stats['successful_customer_matches'] += 1
                self.customer_embeddings[best_match]['last_seen'] = datetime.now()
                
                # Atualizar segmentação do cliente
                await self._update_customer_segment(best_match)
                
                logger.debug(f"✅ Cliente reconhecido: {best_match}")
                return best_match
            else:
                # Cliente novo - adicionar ao cache se houver espaço
                customer_id = await self._register_new_customer(unknown_encoding)
                return customer_id
            
        except Exception as e:
            logger.error(f"Erro na identificação de cliente: {e}")
            return None
    
    async def _register_new_customer(self, encoding: np.ndarray) -> str:
        """Registrar novo cliente no cache"""
        try:
            customer_id = f"customer_{hashlib.md5(encoding.tobytes()).hexdigest()[:8]}"
            
            # Verificar limite de cache
            if len(self.customer_embeddings) >= self.max_customers_cache:
                # Remover o mais antigo
                oldest_customer = min(
                    self.customer_embeddings.items(),
                    key=lambda x: x[1].get('last_seen', datetime.min)
                )[0]
                del self.customer_embeddings[oldest_customer]
            
            # Adicionar novo cliente
            self.customer_embeddings[customer_id] = {
                'encoding': encoding,
                'first_seen': datetime.now(),
                'last_seen': datetime.now(),
                'visit_count': 1
            }
            
            # Salvar no banco de segmentação
            query = """
            INSERT INTO customer_segments (customer_id, segment, first_visit, last_visit, visit_count)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (customer_id) DO NOTHING
            """
            
            await self.db.execute(
                query,
                customer_id,
                'new',
                datetime.now(),
                datetime.now(),
                1
            )
            
            logger.debug(f"✅ Novo cliente registrado: {customer_id}")
            return customer_id
            
        except Exception as e:
            logger.error(f"Erro ao registrar novo cliente: {e}")
            return None
    
    async def _update_customer_segment(self, customer_id: str):
        """Atualizar segmentação de cliente conhecido"""
        try:
            # Incrementar contador de visitas
            if customer_id in self.customer_embeddings:
                self.customer_embeddings[customer_id]['visit_count'] = \
                    self.customer_embeddings[customer_id].get('visit_count', 0) + 1
                
                visit_count = self.customer_embeddings[customer_id]['visit_count']
                
                # Determinar segmento baseado no número de visitas
                if visit_count >= 10:
                    segment = 'vip'
                elif visit_count >= 5:
                    segment = 'regular'
                elif visit_count >= 2:
                    segment = 'returning'
                else:
                    segment = 'new'
                
                # Atualizar no banco
                query = """
                UPDATE customer_segments 
                SET last_visit = $1, visit_count = visit_count + 1, segment = $2
                WHERE customer_id = $3
                """
                
                await self.db.execute(query, datetime.now(), segment, customer_id)
                
        except Exception as e:
            logger.error(f"Erro ao atualizar segmento do cliente: {e}")
    
    async def get_employee_list(self) -> List[Dict]:
        """Obter lista de funcionários registrados"""
        try:
            query = """
            SELECT employee_id, name, registered_at, last_seen, is_active
            FROM employees
            ORDER BY registered_at DESC
            """
            
            results = await self.db.fetch_all(query)
            
            return [
                {
                    'employee_id': row['employee_id'],
                    'name': row['name'],
                    'registered_at': row['registered_at'].isoformat(),
                    'last_seen': row['last_seen'].isoformat() if row['last_seen'] else None,
                    'is_active': row['is_active'],
                    'cached': row['employee_id'] in self.employee_embeddings
                }
                for row in results
            ]
            
        except Exception as e:
            logger.error(f"Erro ao obter lista de funcionários: {e}")
            return []
    
    async def get_recognition_stats(self) -> Dict:
        """Obter estatísticas de reconhecimento"""
        return {
            **self.recognition_stats,
            'employees_loaded': len(self.employee_embeddings),
            'customers_cached': len(self.customer_embeddings),
            'encoder_method': self.encoder.method,
            'similarity_threshold': self.similarity_threshold
        }
    
    async def cleanup_old_customers(self, days: int = 30):
        """Limpar clientes antigos do cache"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            to_remove = []
            for customer_id, data in self.customer_embeddings.items():
                if data.get('last_seen', datetime.min) < cutoff_date:
                    to_remove.append(customer_id)
            
            for customer_id in to_remove:
                del self.customer_embeddings[customer_id]
            
            logger.info(f"✅ Removidos {len(to_remove)} clientes antigos do cache")
            
        except Exception as e:
            logger.error(f"Erro ao limpar clientes antigos: {e}")
    
    def set_similarity_threshold(self, threshold: float):
        """Ajustar threshold de similaridade"""
        if 0.1 <= threshold <= 1.0:
            self.similarity_threshold = threshold
            logger.info(f"✅ Threshold ajustado para {threshold}")
        else:
            logger.warning("Threshold deve estar entre 0.1 e 1.0")