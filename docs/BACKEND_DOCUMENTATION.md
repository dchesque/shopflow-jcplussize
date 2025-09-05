# 📚 ShopFlow Backend - Documentação Completa

## 🎯 Visão Geral

O **ShopFlow Backend** é um sistema inteligente de análise de vídeo para contagem e análise comportamental de pessoas em estabelecimentos comerciais. Construído com **FastAPI** e **Python 3.11+**, o sistema utiliza múltiplos módulos de Inteligência Artificial para fornecer insights avançados sobre o fluxo de clientes.

### 🏗️ Arquitetura Principal

```
ShopFlow Backend
├── 🎥 Processamento de Vídeo (YOLO11)
├── 🧠 Smart Analytics Engine (4 Módulos de IA)
├── 🔒 Sistema de Privacidade (LGPD/GDPR)
├── 📊 API RESTful (FastAPI)
├── 🗄️ Banco de Dados (Supabase)
└── 🔄 WebSocket (Tempo Real)
```

### ⚡ Características Principais

- **Detecção de Pessoas**: YOLO11 para detecção precisa
- **Reconhecimento Facial**: Sistema LGPD-compliant para funcionários
- **Análise Comportamental**: Padrões de movimento e tempo de permanência
- **Segmentação de Clientes**: Classificação automática de perfis
- **Predições Inteligentes**: Previsões de fluxo e necessidade de staffing
- **Conformidade Total**: Proteção de dados segundo LGPD/GDPR
- **API Moderna**: FastAPI com documentação automática
- **Tempo Real**: WebSocket para métricas instantâneas

---

## 🚀 Deploy e Instalação

### 📋 Pré-requisitos

- **Python 3.11+**
- **Conta Supabase** (gratuita)
- **Docker** (opcional para EasyPanel)
- **Git**

### 🏠 Deploy Local (Localhost)

#### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/shopflow-jcplussize.git
cd shopflow-jcplussize/backend
```

#### Passo 2: Criar Ambiente Virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### Passo 3: Instalar Dependências
```bash
pip install -r requirements.txt
```

#### Passo 4: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta `backend/`:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-aqui
SUPABASE_SERVICE_KEY=sua-service-key-aqui

# API Configuration
API_HOST=0.0.0.0
API_PORT=8001
API_DEBUG=True

# YOLO Configuration
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5

# Tracking Configuration
TRACKING_MAX_DISAPPEARED=30
TRACKING_MAX_DISTANCE=100

# System Configuration
UPLOAD_DIR=uploads
SAVE_SNAPSHOTS=True
LINE_POSITION=50

# Security
BRIDGE_API_KEY=desenvolvimento-local-2024
```

#### Passo 5: Executar o Servidor
```bash
python main.py
```

O servidor estará disponível em: `http://localhost:8001`

#### Passo 6: Verificar Funcionamento
```bash
curl http://localhost:8001/api/health
```

### ☁️ Deploy no EasyPanel

#### Passo 1: Preparar o Dockerfile
O projeto já inclui um `Dockerfile` otimizado:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads logs face_embeddings

# Expor porta
EXPOSE 8001

# Comando de execução
CMD ["python", "main.py"]
```

#### Passo 2: Configurar no EasyPanel

1. **Criar Novo Projeto**:
   - Acesse seu painel EasyPanel
   - Clique em "New Project"
   - Escolha "Deploy from Git"

2. **Configurar Repositório**:
   - URL: `https://github.com/seu-usuario/shopflow-jcplussize.git`
   - Branch: `main`
   - Build Path: `/backend`

3. **Configurar Variáveis de Ambiente**:
   ```
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anonima
   SUPABASE_SERVICE_KEY=sua-service-key
   API_HOST=0.0.0.0
   API_PORT=8001
   YOLO_MODEL=yolo11n.pt
   YOLO_CONFIDENCE=0.5
   BRIDGE_API_KEY=sua-chave-segura-aqui
   ```

4. **Configurar Porta**:
   - Port: `8001`
   - Protocol: `HTTP`

5. **Deploy**:
   - Clique em "Deploy"
   - Aguarde o build (pode levar 5-10 minutos)

#### Passo 3: Verificar Deploy
Após o deploy, teste o endpoint:
```bash
curl https://seu-app.easypanel.host/api/health
```

---

## 🏗️ Arquitetura Técnica

### 📁 Estrutura de Pastas

```
backend/
├── 📄 main.py                    # Ponto de entrada da aplicação
├── 🐳 Dockerfile                 # Container Docker
├── 📦 requirements.txt           # Dependências Python
├── ⚙️ .env                       # Variáveis de ambiente
│
├── 📂 api/                       # Rotas da API
│   └── routes/
│       ├── 🎥 camera.py          # Endpoints de câmera
│       ├── 📊 analytics.py       # Endpoints de analytics
│       └── 👥 employees.py       # Endpoints de funcionários
│
├── 📂 core/                      # Núcleo do sistema
│   ├── ⚙️ config.py              # Configurações
│   ├── 🗄️ database.py            # Gerenciador Supabase
│   ├── 🎯 detector.py            # Detector YOLO11
│   ├── 📍 tracker.py             # Rastreamento de objetos
│   ├── 🔌 websocket_manager.py   # WebSocket manager
│   ├── 🔧 app_state.py           # Estado global da aplicação
│   │
│   └── 📂 ai/                    # Módulos de Inteligência Artificial
│       ├── 🧠 smart_analytics_engine.py    # Engine principal
│       ├── 👤 face_recognition.py          # Reconhecimento facial
│       ├── 🎭 behavior_analyzer.py         # Análise comportamental
│       ├── 🎯 customer_segmentation.py     # Segmentação de clientes
│       ├── 🔮 predictive_insights.py       # Predições inteligentes
│       └── 🔒 privacy_config.py            # Configurações de privacidade
│
├── 📂 models/                    # Modelos de dados
│   └── 📄 api_models.py          # Modelos da API
│
└── 📂 utils/                     # Utilitários
    └── 📄 helpers.py             # Funções auxiliares
```

### 🧠 Smart Analytics Engine

O coração do sistema é o **Smart Analytics Engine**, composto por 4 módulos especializados:

#### 1. 👤 Face Recognition Manager
- **Função**: Reconhecimento facial de funcionários
- **Compliance**: LGPD/GDPR compliant
- **Tecnologias**: OpenCV, face_recognition, DeepFace
- **Recursos**:
  - Registro seguro de funcionários
  - Detecção em tempo real
  - Exclusão completa de dados (direito ao esquecimento)
  - Logs de auditoria

#### 2. 🎭 Behavior Analyzer
- **Função**: Análise de padrões comportamentais
- **Recursos**:
  - Zonas quentes (heatmap)
  - Tempo de permanência
  - Padrões de movimento
  - Detecção de grupos
  - Trajetórias de clientes

#### 3. 🎯 Customer Segmentation
- **Função**: Classificação automática de clientes
- **Segmentos**:
  - Clientes novos
  - Clientes regulares
  - Clientes VIP
  - Clientes em risco
  - Funcionários

#### 4. 🔮 Predictive Insights
- **Função**: Predições inteligentes
- **Predições**:
  - Fluxo por hora
  - Necessidade de staffing
  - Probabilidade de conversão
  - Tendências de vendas
  - Anomalias no fluxo

---

## 🌐 Endpoints da API

### 🏥 Health Check

#### `GET /api/health`
Verifica a saúde geral do sistema.

**Resposta de Sucesso:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-04T10:30:00.000Z",
  "version": "2.0.0",
  "components": {
    "database": true,
    "detector": true,
    "tracker": true,
    "smart_engine": true,
    "privacy_manager": true,
    "face_recognition": true,
    "behavior_analyzer": true,
    "customer_segmentation": true,
    "predictive_insights": true
  }
}
```

### 🎥 Camera Endpoints

#### `POST /api/camera/process`
Processa frame da câmera com análise completa de IA.

**Headers:**
```
Authorization: Bearer SUA_BRIDGE_API_KEY
Content-Type: multipart/form-data
```

**Body:**
- `frame`: Arquivo JPEG da câmera
- `timestamp`: Timestamp ISO 8601
- `camera_id`: ID da câmera

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2025-01-04T10:30:00.000Z",
  "camera_id": "cam_001",
  "people_count": 3,
  "customers_count": 2,
  "employees_detected": 1,
  "groups_detected": 1,
  "smart_analytics": {
    "face_recognition_attempts": 3,
    "behavior_analysis_active": true,
    "temporal_analysis_results": [0.75, 0.65],
    "group_types": ["family"]
  },
  "processing_time_ms": 45.2,
  "frame_resolution": "1920x1080"
}
```

#### `GET /api/camera/status`
Status dos serviços de câmera.

**Resposta:**
```json
{
  "detector_loaded": true,
  "analytics_initialized": true,
  "modules": {
    "face_recognition": true,
    "behavior_analysis": true,
    "group_detection": true,
    "temporal_analysis": true
  },
  "timestamp": "2025-01-04T10:30:00.000Z"
}
```

### 📊 Analytics Endpoints

#### `GET /api/analytics/smart-metrics`
Métricas inteligentes em tempo real.

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "counting": {
      "total_people": 5,
      "customers": 4,
      "employees": 1,
      "confidence_score": 0.95
    },
    "behavior": {
      "avg_dwell_time": 12.5,
      "hot_zones": ["entrance", "electronics"],
      "flow_pattern": "normal",
      "group_shopping_rate": 0.3
    },
    "segmentation": {
      "new": 2,
      "regular": 1,
      "vip": 1
    },
    "predictions": {
      "next_hour": 15,
      "conversion_probability": 0.68,
      "optimal_staff": 3
    },
    "insights": {
      "anomalies": [],
      "recommendations": [
        "Aumentar staff na área de eletrônicos",
        "Promoção direcionada para novos clientes"
      ]
    }
  }
}
```

#### `GET /api/analytics/behavior-patterns`
Padrões comportamentais detalhados.

**Query Parameters:**
- `date_filter`: Data específica (YYYY-MM-DD)
- `hours`: Últimas N horas (padrão: 24)

#### `GET /api/analytics/predictions`
Predições de IA.

**Query Parameters:**
- `prediction_type`: Tipo de predição (flow, conversion, staffing, all)

#### `GET /api/analytics/segmentation`
Análise de segmentação de clientes.

**Query Parameters:**
- `days`: Período em dias (padrão: 30)

#### `GET /api/analytics/health`
Saúde do sistema de analytics.

### 👥 Employee Endpoints

#### `POST /api/employees/register`
Registra novo funcionário com reconhecimento facial.

**Body (multipart/form-data):**
- `name`: Nome completo
- `employee_id`: ID personalizado (opcional)
- `department`: Departamento (opcional)
- `position`: Cargo (opcional)
- `file`: Foto do funcionário

**Resposta:**
```json
{
  "status": "success",
  "message": "Funcionário João Silva registrado com sucesso",
  "data": {
    "employee_id": "emp_12345678",
    "name": "João Silva",
    "department": "Vendas",
    "position": "Vendedor",
    "registered_at": "2025-01-04T10:30:00.000Z",
    "face_recognition_enabled": true,
    "privacy_compliant": true
  }
}
```

#### `GET /api/employees/list`
Lista funcionários registrados.

**Query Parameters:**
- `active_only`: Apenas ativos (padrão: true)
- `include_last_seen`: Incluir último avistamento (padrão: true)

#### `GET /api/employees/{employee_id}`
Detalhes de funcionário específico.

#### `PUT /api/employees/{employee_id}`
Atualiza dados do funcionário.

#### `DELETE /api/employees/{employee_id}`
Remove funcionário (direito ao esquecimento).

#### `GET /api/employees/analytics/presence`
Análise de presença de funcionários.

### 🔒 Privacy Endpoints

#### `GET /api/privacy/settings`
Configurações de privacidade atuais.

#### `PUT /api/privacy/settings`
Atualizar configurações de privacidade.

#### `GET /api/privacy/compliance-report`
Relatório de conformidade LGPD/GDPR.

#### `POST /api/privacy/data-deletion`
Solicitação de exclusão de dados.

---

## 🔄 WebSocket (Tempo Real)

### `ws://localhost:8001/ws/smart-metrics`
Stream de métricas inteligentes em tempo real.

**Exemplo de Uso:**
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/smart-metrics');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Métricas atualizadas:', data);
};
```

### `ws://localhost:8001/ws/metrics`
Stream de métricas básicas (compatibilidade).

---

## 🔧 Configurações

### 📋 Variáveis de Ambiente

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `SUPABASE_URL` | URL do projeto Supabase | `https://xyz.supabase.co` | ✅ |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJ...` | ✅ |
| `SUPABASE_SERVICE_KEY` | Service key do Supabase | `eyJ...` | ✅ |
| `API_HOST` | Host da API | `0.0.0.0` | ❌ |
| `API_PORT` | Porta da API | `8001` | ❌ |
| `API_DEBUG` | Modo debug | `False` | ❌ |
| `YOLO_MODEL` | Modelo YOLO | `yolo11n.pt` | ❌ |
| `YOLO_CONFIDENCE` | Confiança YOLO | `0.5` | ❌ |
| `BRIDGE_API_KEY` | Chave da bridge | `sua-chave-aqui` | ✅ |

### 🎛️ Configurações de IA

#### Privacy Settings (`core/ai/privacy_config.py`):
```python
PRIVACY_SETTINGS = {
    "face_recognition": True,      # Reconhecimento facial
    "behavior_analysis": True,     # Análise comportamental
    "data_retention_days": 30,     # Retenção de dados
    "anonymize_data": True,        # Anonimização
    "audit_logging": True,         # Logs de auditoria
    "gdpr_compliant": True,        # Conformidade GDPR
    "lgpd_compliant": True         # Conformidade LGPD
}
```

---

## 🛡️ Segurança e Privacidade

### 🔒 Conformidade LGPD/GDPR

O sistema foi desenvolvido com total conformidade às leis de proteção de dados:

#### Direitos Implementados:
- **Direito ao Acesso**: API para consultar dados pessoais
- **Direito à Retificação**: Endpoints para atualizar dados
- **Direito ao Esquecimento**: Exclusão completa de dados
- **Direito à Portabilidade**: Export de dados em formato legível
- **Direito à Informação**: Logs detalhados de processamento

#### Medidas Técnicas:
- **Criptografia**: Dados sensíveis criptografados
- **Anonimização**: Dados anonimizados quando possível
- **Logs de Auditoria**: Registro de todas as operações
- **Consentimento**: Validação de operações permitidas
- **Minimização**: Coleta apenas dados necessários

### 🔐 Autenticação e Autorização

- **API Key**: Autenticação via Bearer Token
- **CORS**: Configurado para domínios autorizados
- **Rate Limiting**: Proteção contra ataques
- **Input Validation**: Validação rigorosa de entrada

---

## 📈 Monitoramento e Logs

### 📊 Métricas de Sistema

O sistema coleta automaticamente:
- **Performance**: Tempo de processamento por frame
- **Precisão**: Confidence score das detecções
- **Uso**: Contadores de requisições por endpoint
- **Erros**: Logs detalhados de falhas
- **Recursos**: Uso de CPU/memória

### 📝 Logs Estruturados

Logs são estruturados com **Loguru**:
```python
logger.info("👤 Cliente detectado", extra={
    "person_id": "person_123",
    "confidence": 0.95,
    "location": "entrance",
    "timestamp": "2025-01-04T10:30:00Z"
})
```

### 🔍 Debugging

Para ativar logs de debug:
```env
API_DEBUG=True
```

---

## 🚀 Performance e Otimização

### ⚡ Otimizações Implementadas

- **Processamento Assíncrono**: FastAPI async/await
- **Connection Pooling**: Conexões Supabase reutilizadas
- **Caching**: Cache de modelos e configurações
- **Batch Processing**: Processamento em lotes quando possível
- **Lazy Loading**: Carregamento sob demanda

### 📊 Benchmarks Típicos

- **Processamento por Frame**: 20-50ms
- **Detecção YOLO**: 15-30ms
- **Reconhecimento Facial**: 5-15ms
- **Análise Comportamental**: 5-10ms
- **Throughput**: 20-50 FPS dependendo do hardware

---

## 🧪 Testes e Validação

### ✅ Testes de Endpoints

```bash
# Health check
curl http://localhost:8001/api/health

# Analytics health
curl http://localhost:8001/api/analytics/health

# Camera status
curl http://localhost:8001/api/camera/status

# Smart metrics
curl http://localhost:8001/api/analytics/smart-metrics

# Employee list
curl http://localhost:8001/api/employees/list
```

### 🔍 Testes de Carga

Para testes de carga, recomenda-se:
- **Locust**: Para testes HTTP
- **Artillery**: Para testes WebSocket
- **K6**: Para testes de performance

---

## 🐛 Troubleshooting

### ❌ Problemas Comuns

#### 1. Erro de Conexão com Supabase
```
ERROR: Erro ao conectar Supabase
```
**Solução**: Verifique SUPABASE_URL e chaves no .env

#### 2. Modelo YOLO não encontrado
```
ERROR: Modelo yolo11n.pt não encontrado
```
**Solução**: O modelo será baixado automaticamente na primeira execução

#### 3. Erro de Permissão de Arquivo
```
ERROR: Permission denied
```
**Solução**: Verifique permissões das pastas uploads/, logs/, face_embeddings/

#### 4. Erro de Memória
```
ERROR: Out of memory
```
**Solução**: Ajuste YOLO_MODEL para versão menor (yolo11s.pt, yolo11n.pt)

### 📞 Suporte

Para suporte técnico:
1. Verifique os logs em `logs/`
2. Consulte a documentação da API em `/docs`
3. Abra issue no repositório GitHub

---

## 🔄 Atualizações e Manutenção

### 📦 Atualizando Dependências

```bash
pip install --upgrade -r requirements.txt
```

### 🔄 Migração de Dados

Para atualizações que requerem migração:
1. Fazer backup dos dados
2. Executar scripts de migração
3. Validar integridade dos dados

### 📊 Monitoramento de Produção

Recomenda-se monitorar:
- **CPU/Memória**: Uso de recursos
- **Latência**: Tempo de resposta
- **Erros**: Taxa de erro por endpoint
- **Throughput**: Requisições por segundo

---

## 📝 Licença e Créditos

### 📄 Licença
Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

### 👨‍💻 Tecnologias Utilizadas

- **FastAPI**: Framework web moderno
- **YOLO11**: Detecção de objetos
- **OpenCV**: Processamento de imagem
- **Supabase**: Banco de dados e backend
- **Python 3.11**: Linguagem principal
- **Docker**: Containerização
- **Loguru**: Sistema de logs

### 🙏 Agradecimentos

- Comunidade Ultralytics pelo YOLO11
- Equipe FastAPI pelo framework
- Supabase pela plataforma

---

**📞 Para mais informações, consulte a documentação da API em `/docs` após executar o servidor.**