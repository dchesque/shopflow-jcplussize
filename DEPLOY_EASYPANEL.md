# 🚀 ShopFlow - Deploy Completo no Easypanel

Sistema de análise inteligente de fluxo de clientes com câmera RTSP Intelbras Mibo configurada.

## 📋 Pré-requisitos

### 🎥 Câmera Configurada
- **Modelo**: Intelbras Mibo
- **IP**: `192.168.1.52`
- **RTSP URL**: `rtsp://admin:senha@192.168.1.52:554/cam/realmonitor?channel=1&subtype=0`
- **Porta**: `554`
- **Usuário**: `admin`
- **Senha**: `[configurar no config.ini]`

### 🌐 Domínios Necessários
- **Frontend**: `shopflow.jcplussize.com.br`
- **Backend API**: `api.shopflow.jcplussize.com.br`
- **Supabase**: `supabase.shopflow.jcplussize.com.br`

## 🚀 Deploy no Easypanel

### 1. 📊 Deploy do Supabase

**Criar serviço Supabase:**
```yaml
Nome: shopflow-supabase
Imagem: supabase/supabase:latest
Porta: 8000
Domain: supabase.shopflow.jcplussize.com.br
```

**Variáveis de Ambiente:**
```env
POSTGRES_PASSWORD=sua_senha_super_forte
JWT_SECRET=jwt-token-com-pelo-menos-32-caracteres-mude-em-producao
ANON_KEY=[gerar nova chave]
SERVICE_ROLE_KEY=[gerar nova chave]
```

### 2. 🚀 Deploy do Backend

**Criar serviço Backend:**
```yaml
Nome: shopflow-backend
GitHub: https://github.com/dchesque/shopflow-jcplussize
Path: /backend
Dockerfile: /backend/Dockerfile
Porta: 8001
Domain: api.shopflow.jcplussize.com.br
```

**Variáveis de Ambiente do Backend:**
```env
# Supabase Connection
SUPABASE_URL=http://shopflow-supabase:8000
SUPABASE_ANON_KEY=[copiar do supabase]
SUPABASE_SERVICE_KEY=[copiar do supabase]
DATABASE_URL=postgresql://postgres:senha@shopflow-supabase:5432/postgres

# API Settings
API_HOST=0.0.0.0
API_PORT=8001
API_DEBUG=false
API_SECRET_KEY=chave-secreta-super-forte-producao

# AI/YOLO11
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.6
YOLO_IOU=0.45
ENABLE_GPU=auto

# Smart Analytics
FACE_RECOGNITION_ENABLED=true
BEHAVIOR_ANALYSIS_ENABLED=true
GROUP_DETECTION_ENABLED=true
TEMPORAL_ANALYSIS_ENABLED=true

# Bridge Authentication
BRIDGE_SECRET=chave-bridge-super-secreta
BRIDGE_API_KEY=bridge_prod_key_2024

# Security
CORS_ORIGINS=["https://shopflow.jcplussize.com.br"]

# Redis (se usando)
REDIS_URL=redis://shopflow-redis:6379/0

# Logging
LOG_LEVEL=INFO
```

### 3. 🎯 Deploy do Frontend

**Criar serviço Frontend:**
```yaml
Nome: shopflow-frontend
GitHub: https://github.com/dchesque/shopflow-jcplussize
Path: /frontend
Dockerfile: /frontend/Dockerfile
Porta: 3000
Domain: shopflow.jcplussize.com.br
```

**Build Args do Frontend:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.shopflow.jcplussize.com.br
NEXT_PUBLIC_SUPABASE_ANON_KEY=[copiar do supabase]
NEXT_PUBLIC_API_URL=https://api.shopflow.jcplussize.com.br
```

**Variáveis de Ambiente do Frontend:**
```env
NODE_ENV=production
NEXT_PUBLIC_SMART_ANALYTICS_ENABLED=true
NEXT_PUBLIC_FACE_RECOGNITION_ENABLED=true
NEXT_PUBLIC_REALTIME_ENABLED=true
```

### 4. 💾 Redis (Opcional mas Recomendado)

**Criar serviço Redis:**
```yaml
Nome: shopflow-redis
Imagem: redis:7-alpine
Porta: 6379
Command: redis-server --appendonly yes
```

## 💻 Bridge - PC da Loja

### 1. Download e Instalação

**No PC da loja (Windows):**
```cmd
# 1. Clone o repositório
git clone https://github.com/dchesque/shopflow-jcplussize.git
cd shopflow-jcplussize\bridge

# 2. Execute o instalador
install_windows.bat
```

### 2. Configuração

**Edite `config.ini` com a senha real da câmera:**
```ini
[camera]
rtsp_url = rtsp://192.168.1.52:554/cam/realmonitor?channel=1&subtype=0
rtsp_fallback = rtsp://192.168.1.52:554/cam/realmonitor?channel=1&subtype=1
username = admin
password = SUA_SENHA_REAL_AQUI

[server]
api_url = https://api.shopflow.jcplussize.com.br
api_key = bridge_prod_key_2024

[settings]
fps = 15
quality = high
reconnect_timeout = 10
```

### 3. Inicialização

**Execute a bridge:**
```cmd
run_bridge.bat
```

**Ou para inicialização automática (Windows Service):**
```cmd
# Em desenvolvimento - usar Task Scheduler por enquanto
```

## 🔧 Configurações Finais

### 1. Supabase Database Schema

**Execute no Supabase SQL Editor:**
```sql
-- Tabela de eventos da câmera
CREATE TABLE camera_events (
    id BIGSERIAL PRIMARY KEY,
    camera_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    people_count INTEGER DEFAULT 0,
    customers_count INTEGER DEFAULT 0,
    employees_count INTEGER DEFAULT 0,
    groups_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    frame_width INTEGER,
    frame_height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_camera_events_timestamp ON camera_events(timestamp);
CREATE INDEX idx_camera_events_camera_id ON camera_events(camera_id);

-- Tabela de estatísticas em tempo real
CREATE TABLE realtime_stats (
    id BIGSERIAL PRIMARY KEY,
    total_visitors INTEGER DEFAULT 0,
    current_customers INTEGER DEFAULT 0,
    employees_detected INTEGER DEFAULT 0,
    last_update TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir registro inicial
INSERT INTO realtime_stats (total_visitors, current_customers, employees_detected) VALUES (0, 0, 0);
```

### 2. Configurar Realtime

**No Supabase Dashboard > API:**
- Ativar Realtime
- Adicionar tabelas: `camera_events`, `realtime_stats`

### 3. Testar Conectividade

**Teste da bridge:**
```cmd
curl -X POST https://api.shopflow.jcplussize.com.br/api/camera/test \
  -H "Authorization: Bearer bridge_prod_key_2024"
```

**Deve retornar:**
```json
{
  "success": true,
  "message": "Bridge connection OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "server": "ShopFlow API v1.0"
}
```

## 📊 Monitoramento

### Logs do Backend
```bash
# No Easypanel, visualizar logs do container backend
```

### Logs da Bridge
```cmd
# No PC da loja
type bridge\logs\bridge.log
```

### Métricas da API
- Health Check: `https://api.shopflow.jcplussize.com.br/api/health`
- Camera Status: `https://api.shopflow.jcplussize.com.br/api/camera/status`
- Docs: `https://api.shopflow.jcplussize.com.br/docs`

## 🔒 Segurança

### Firewall PC da Loja
```cmd
# Permitir apenas conexões HTTPS saindo
# Bloquear acesso direto à API do exterior
```

### SSL/TLS
- Todos os domínios com certificado SSL via Easypanel
- Bridge usa HTTPS para comunicar com API

### Autenticação
- Bridge autenticada via API key
- Supabase com RLS ativado
- Logs de auditoria ativos

## 🚨 Troubleshooting

### Bridge não conecta na câmera
```cmd
# Teste RTSP manualmente
ffplay rtsp://admin:senha@192.168.1.52:554/cam/realmonitor?channel=1&subtype=0
```

### API retorna 401
- Verificar `BRIDGE_API_KEY` no backend
- Verificar `api_key` no config.ini da bridge

### Frontend não carrega
- Verificar se build args foram passados corretamente
- Verificar logs do container frontend

### Sem dados no dashboard
- Verificar logs do backend
- Verificar conexão Supabase
- Verificar se bridge está enviando frames

## ✅ Checklist de Deploy

- [ ] Supabase rodando com banco configurado
- [ ] Backend deployado com todas as variáveis
- [ ] Frontend deployado com build args corretos
- [ ] Bridge instalada no PC da loja
- [ ] Câmera conectando via RTSP
- [ ] Bridge enviando frames para API
- [ ] Dashboard mostrando dados em tempo real
- [ ] SSL funcionando em todos os domínios
- [ ] Logs sendo gravados corretamente

## 📞 Suporte

**Em caso de problemas:**
1. Verificar logs do container com problema
2. Testar conectividade entre serviços
3. Verificar configurações de rede/firewall
4. Consultar documentação da API em `/docs`

---

🎉 **Deploy concluído! Sistema ShopFlow funcionando com IA completa e câmera RTSP.**