# 🚀 ShopFlow Backend - Guia de Deploy

## 📋 Índice

- [🏠 Deploy Local (Localhost)](#-deploy-local-localhost)
- [☁️ Deploy EasyPanel (Produção)](#️-deploy-easypanel-produção)
- [🐳 Deploy Docker](#-deploy-docker)
- [🔧 Configuração Supabase](#-configuração-supabase)
- [🛠️ Troubleshooting](#️-troubleshooting)

---

## 🏠 Deploy Local (Localhost)

### 1. Pré-requisitos
- **Python 3.11+** instalado
- **Git** instalado
- Conta **Supabase** (gratuita)

### 2. Instalação Passo a Passo

#### 2.1 Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/shopflow-jcplussize.git
cd shopflow-jcplussize/backend
```

#### 2.2 Criar Ambiente Virtual
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Instalar Dependências
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2.4 Configurar Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
# Windows: notepad .env
# Linux/Mac: nano .env
```

**Exemplo de configuração local (.env):**
```env
# Supabase - Obter em https://supabase.com/dashboard
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsI...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsI...

# API Local
API_HOST=127.0.0.1
API_PORT=8001
API_DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Segurança
BRIDGE_API_KEY=desenvolvimento-local-2024

# IA
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5

# Storage
UPLOAD_DIR=uploads
SAVE_SNAPSHOTS=True

# Logs
LOG_LEVEL=DEBUG
```

#### 2.5 Criar Diretórios
```bash
mkdir -p uploads logs face_embeddings
```

#### 2.6 Executar o Servidor
```bash
python main.py
```

#### 2.7 Verificar Funcionamento
```bash
# Em outro terminal
curl http://localhost:8001/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-04T10:30:00.000Z",
  "version": "2.0.0",
  "components": {
    "database": true,
    "detector": true,
    "smart_engine": true
  }
}
```

### 3. Acessar Documentação
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

---

## ☁️ Deploy EasyPanel (Produção)

### 1. Pré-requisitos
- Conta **EasyPanel**
- Repositório Git público ou privado
- Conta **Supabase** configurada

### 2. Deploy Passo a Passo

#### 2.1 Preparar Repositório
Certifique-se que seu repositório tem:
- ✅ `Dockerfile` na pasta backend
- ✅ `requirements.txt` atualizado
- ✅ `.env.example` configurado
- ✅ `.gitignore` incluindo `.env`

#### 2.2 Configurar Projeto no EasyPanel

**1. Criar Novo Projeto:**
- Acesse seu painel EasyPanel
- Clique em "**+ Create**"
- Escolha "**App**"

**2. Configurar Source:**
- **Type**: Git Repository
- **Repository**: `https://github.com/seu-usuario/shopflow-jcplussize.git`
- **Branch**: `main`
- **Build Path**: `/backend`

**3. Configurar Build:**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`
- **Port**: `8001`

#### 2.3 Configurar Variáveis de Ambiente

**Variáveis Essenciais para EasyPanel:**

```env
# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...

# API EasyPanel
API_HOST=0.0.0.0
API_PORT=8001
API_DEBUG=False

# CORS (ajustar para seu domínio)
ALLOWED_ORIGINS=https://seu-app.easypanel.host,https://seu-dominio.com

# Segurança (GERAR CHAVE FORTE!)
BRIDGE_API_KEY=gere-uma-chave-super-secreta-aqui-128-bits

# IA Otimizada para Produção
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.6
YOLO_DEVICE=cpu

# Performance
MAX_IMAGE_SIZE=1280
NUM_WORKERS=2
MEMORY_LIMIT=1024

# Storage
UPLOAD_DIR=uploads
SAVE_SNAPSHOTS=False

# Logging Produção
LOG_LEVEL=INFO
LOG_MAX_SIZE=50

# Timezone
TZ=America/Sao_Paulo
```

#### 2.4 Deploy

1. **Configurar Domínio** (opcional):
   - Vá em "Domains"
   - Adicione seu domínio personalizado
   - Configure DNS conforme instruções

2. **Deploy**:
   - Clique em "**Deploy**"
   - Aguarde o build (5-10 minutos)
   - Monitore logs em tempo real

3. **Verificar Deploy**:
   ```bash
   curl https://seu-app.easypanel.host/api/health
   ```

#### 2.5 Configurar SSL (HTTPS)
- EasyPanel configura SSL automaticamente
- Aguarde propagação (pode levar alguns minutos)
- Teste: `https://seu-app.easypanel.host`

#### 2.6 Configurar Health Check
- **Path**: `/api/health`
- **Port**: `8001`
- **Timeout**: `30s`
- **Interval**: `60s`

### 3. Monitoramento Produção

#### 3.1 Logs
```bash
# Ver logs em tempo real no EasyPanel
# Ou via CLI (se disponível)
easypanel logs -f seu-app
```

#### 3.2 Métricas
- CPU/Memória: Painel EasyPanel
- Requests: Logs da aplicação
- Erros: Filtrar logs por "ERROR"

#### 3.3 Alertas
Configure alertas para:
- Alto uso de CPU (>80%)
- Alto uso de memória (>90%)
- Health check falhando
- Muitos erros 5xx

---

## 🐳 Deploy Docker

### 1. Docker Local

#### 1.1 Build da Imagem
```bash
cd backend
docker build -t shopflow-backend:latest .
```

#### 1.2 Executar Container
```bash
# Com arquivo .env
docker run -p 8001:8001 --env-file .env shopflow-backend:latest

# Ou com variáveis inline
docker run -p 8001:8001 \
  -e SUPABASE_URL=https://seu-projeto.supabase.co \
  -e SUPABASE_ANON_KEY=sua-chave \
  -e SUPABASE_SERVICE_KEY=sua-service-key \
  -e BRIDGE_API_KEY=sua-bridge-key \
  shopflow-backend:latest
```

### 2. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  shopflow-backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - BRIDGE_API_KEY=${BRIDGE_API_KEY}
      - API_HOST=0.0.0.0
      - API_PORT=8001
      - API_DEBUG=false
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Opcional: Nginx como reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - shopflow-backend
    restart: unless-stopped
```

**Executar:**
```bash
docker-compose up -d
```

---

## 🔧 Configuração Supabase

### 1. Criar Projeto Supabase

1. **Acesse**: https://supabase.com
2. **Criar conta** (gratuita)
3. **New Project**:
   - Name: `shopflow-backend`
   - Database Password: `senha-forte-aqui`
   - Region: `South America (São Paulo)` ou mais próxima

### 2. Configurar Tabelas (Opcional)

O sistema funciona sem tabelas customizadas, mas você pode criar para análises avançadas:

```sql
-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  registered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  removed_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabela de eventos de câmera
CREATE TABLE IF NOT EXISTS camera_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camera_id TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  people_count INTEGER DEFAULT 0,
  customers_count INTEGER DEFAULT 0,
  employees_count INTEGER DEFAULT 0,
  groups_count INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  frame_width INTEGER DEFAULT 0,
  frame_height INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_camera_events_timestamp ON camera_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_camera_events_camera_id ON camera_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
```

### 3. Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_events ENABLE ROW LEVEL SECURITY;

-- Política para service role (backend)
CREATE POLICY "Service role can do anything" ON employees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON camera_events
  FOR ALL USING (auth.role() = 'service_role');
```

### 4. Obter Chaves

1. **Vá para**: Settings > API
2. **Copie**:
   - **URL**: `https://xxx.supabase.co`
   - **anon key**: `eyJhbGci...` (pública)
   - **service_role key**: `eyJhbGci...` (⚠️ privada)

---

## 🛠️ Troubleshooting

### ❌ Problemas Comuns

#### 1. **Erro: "Connection refused" no health check**
```
curl: (7) Failed to connect to localhost port 8001
```

**Soluções:**
```bash
# Verificar se o servidor está rodando
ps aux | grep python

# Verificar porta
netstat -tulpn | grep 8001

# Verificar logs
tail -f logs/app.log

# Reiniciar servidor
python main.py
```

#### 2. **Erro Supabase: "Invalid JWT"**
```
ERROR: Invalid JWT
```

**Soluções:**
```bash
# Verificar variáveis de ambiente
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# Renovar chaves no Supabase Dashboard
# Settings > API > Reset service_role key
```

#### 3. **Erro YOLO: "Model not found"**
```
ERROR: yolo11n.pt not found
```

**Soluções:**
```bash
# Verificar conexão internet (modelo baixa automaticamente)
ping google.com

# Download manual
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolo11n.pt

# Verificar permissões
chmod 755 .
```

#### 4. **Erro Docker: "Permission denied"**
```
ERROR: Permission denied: './uploads'
```

**Soluções:**
```bash
# Criar diretórios com permissões
mkdir -p uploads logs face_embeddings
chmod 755 uploads logs face_embeddings

# No Dockerfile, adicionar:
USER 1000:1000
```

#### 5. **EasyPanel: Build Failed**
```
ERROR: Failed to build
```

**Soluções:**
1. **Verificar requirements.txt**:
   ```bash
   pip freeze > requirements.txt
   ```

2. **Verificar Dockerfile**:
   ```dockerfile
   FROM python:3.11-slim
   # ... resto do Dockerfile
   ```

3. **Verificar logs de build** no painel EasyPanel

4. **Testar build local**:
   ```bash
   docker build -t test .
   ```

#### 6. **Alto Uso de Memória**
```
WARNING: High memory usage
```

**Soluções:**
```env
# Reduzir modelo YOLO
YOLO_MODEL=yolo11n.pt

# Reduzir tamanho de imagem
MAX_IMAGE_SIZE=1280

# Reduzir workers
NUM_WORKERS=1

# Definir limite de memória
MEMORY_LIMIT=512
```

### 🔍 Debug Avançado

#### 1. **Logs Detalhados**
```env
# .env para debug
LOG_LEVEL=DEBUG
API_DEBUG=True
SAVE_DEBUG_FRAMES=True
```

#### 2. **Profiling de Performance**
```python
# Adicionar ao main.py para debug
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# ... código da aplicação ...

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)
```

#### 3. **Monitoramento Sistema**
```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Processos Python
ps aux | grep python

# Conectões rede
netstat -tulpn | grep 8001
```

### 📞 Obter Ajuda

1. **Verificar logs**:
   ```bash
   tail -100 logs/app.log | grep ERROR
   ```

2. **Testar endpoints**:
   ```bash
   curl -v http://localhost:8001/api/health
   ```

3. **Documentação API**:
   - http://localhost:8001/docs

4. **Issues GitHub**:
   - https://github.com/seu-usuario/shopflow-jcplussize/issues

5. **Suporte Direto**:
   - Email: suporte@shopflow.com

---

## ✅ Checklist Final

### Deploy Local
- [ ] Python 3.11+ instalado
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Arquivo `.env` configurado
- [ ] Supabase configurado
- [ ] Diretórios criados (`uploads`, `logs`, `face_embeddings`)
- [ ] Servidor iniciado (`python main.py`)
- [ ] Health check OK (`curl localhost:8001/api/health`)

### Deploy EasyPanel
- [ ] Repositório Git configurado
- [ ] Dockerfile funcional
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Health check OK
- [ ] SSL configurado (HTTPS)
- [ ] Domínio customizado (opcional)

### Deploy Docker
- [ ] Dockerfile otimizado
- [ ] Docker Compose configurado (opcional)
- [ ] Volumes para persistência
- [ ] Health check configurado
- [ ] Logs acessíveis

### Produção
- [ ] Variáveis de ambiente seguras
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] SSL/HTTPS ativo
- [ ] Firewall configurado

---

**🚀 Pronto! Seu ShopFlow Backend está rodando!**

Para mais detalhes, consulte a [Documentação Completa](BACKEND_DOCUMENTATION.md).