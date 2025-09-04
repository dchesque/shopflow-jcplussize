# 🛍️ ShopFlow - Sistema Inteligente de Contagem de Pessoas

Sistema avançado de análise de tráfego de pessoas com IA integrada, reconhecimento facial LGPD-compliant, análise comportamental e detecção inteligente de compras.

**🔗 Deploy**: Backend porta 3333, Frontend porta 3000  
**🗄️ Database**: Supabase.com  
**🎥 Câmera**: RTSP Intelbras Mibo  

## 🚀 Features

### 🎯 Core Features
- ✅ **Contagem de Pessoas em Tempo Real** - YOLO11 + Deep Sort
- ✅ **Câmera RTSP Intelbras Mibo** - Captura via bridge dedicada
- ✅ **WebSocket Live Stream** - Atualizações instantâneas
- ✅ **Dashboard Interativo** - Métricas e gráficos em tempo real
- ✅ **Supabase Database** - PostgreSQL com realtime subscriptions
- ✅ **API REST Completa** - FastAPI com documentação automática
- ✅ **Deploy EasyPanel** - Containerização completa

### 🧠 Smart Analytics (IA)
- 🎭 **Reconhecimento Facial LGPD-Compliant** - Identifica funcionários sem armazenar fotos
- ⏰ **Análise Temporal** - Detecta compras reais baseado no comportamento
- 🧬 **Re-identificação Comportamental** - 75%+ precisão sem usar faces
- 👥 **Detecção de Grupos** - Famílias, casais, amigos automaticamente
- 📊 **Métricas Inteligentes** - Insights automáticos sobre comportamento de clientes

### 🔒 Privacidade & Conformidade
- ✅ **LGPD/GDPR Compliant** - Privacy by design
- ✅ **Nunca armazena faces** - Apenas embeddings matemáticos
- ✅ **Auto-limpeza** - Dados removidos automaticamente
- ✅ **Auditoria completa** - Logs de todas as operações

## 🛠️ Stack Tecnológica

### Backend
- **FastAPI** - API REST moderna e rápida
- **YOLO11** - Detecção de pessoas state-of-the-art
- **scikit-learn** - Machine learning para análise comportamental
- **Supabase** - PostgreSQL + Realtime + Auth
- **WebSocket** - Comunicação em tempo real

### Frontend
- **Next.js 15** - React framework com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderno
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações
- **Zustand** - Estado global
- **Radix UI** - Componentes acessíveis

### DevOps
- **Docker** - Containerização
- **EasyPanel** - Deploy e hosting
- **GitHub Actions** - CI/CD

## 🚀 Quick Start - Deploy

### 📋 Pré-requisitos
- Conta EasyPanel ativa
- Supabase.com configurado
- Repositório Git

### 1️⃣ Backend Service no EasyPanel

```yaml
Nome: shopflow-backend
Build Path: /backend
Dockerfile: Dockerfile.easypanel
Port: 3333
Domain: [seu-dominio-backend]
```

**Environment Variables:**
```env
SUPABASE_URL=[sua-supabase-url]
SUPABASE_ANON_KEY=[sua-anon-key]
SUPABASE_SERVICE_KEY=[sua-service-key]
JWT_SECRET=[seu-jwt-secret]
API_HOST=0.0.0.0
API_PORT=3333
ALLOWED_ORIGINS=["https://[seu-dominio-frontend]"]
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.6
BRIDGE_API_KEY=[sua-bridge-key]
LOG_LEVEL=INFO
```

### 2️⃣ Frontend Service no EasyPanel

```yaml
Nome: shopflow-frontend
Build Path: /frontend
Dockerfile: Dockerfile.easypanel
Port: 3000
Domain: [seu-dominio-frontend]
```

**Build Args:**
```env
NEXT_PUBLIC_SUPABASE_URL=[sua-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-anon-key]
NEXT_PUBLIC_API_URL=https://[seu-dominio-backend]
```

### 3️⃣ Database Setup no Supabase

Execute no **Supabase SQL Editor**:

```sql
-- Tabela de eventos da câmera
CREATE TABLE IF NOT EXISTS camera_events (
    id BIGSERIAL PRIMARY KEY,
    camera_id TEXT NOT NULL DEFAULT 'main',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    people_count INTEGER DEFAULT 0,
    customers_count INTEGER DEFAULT 0,
    employees_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camera_events_timestamp ON camera_events(timestamp);

-- Tabela de estatísticas em tempo real
CREATE TABLE IF NOT EXISTS realtime_stats (
    id BIGSERIAL PRIMARY KEY,
    total_visitors INTEGER DEFAULT 0,
    current_customers INTEGER DEFAULT 0,
    last_update TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO realtime_stats (total_visitors, current_customers) VALUES (0, 0) ON CONFLICT DO NOTHING;
```

**Habilitar Realtime:**
- Supabase Dashboard > Database > Replication
- Add tables: `camera_events`, `realtime_stats`

## 🖥️ Deploy Local (desenvolvimento)

### Backend
```bash
cd backend
cp .env.example .env
# Edite .env com suas configurações
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
# Edite .env.local com suas configurações
npm install
npm run dev
```

### Docker Compose
```bash
docker-compose up -d
```

## 💻 Bridge - PC da Loja

### Instalação Windows
```cmd
cd bridge
install_windows.bat
```

### Configuração
Edite `config.ini`:
```ini
[camera]
rtsp_url = rtsp://[usuario]:[senha]@[ip-camera]:554/cam/realmonitor?channel=1&subtype=0
username = [usuario-camera]
password = [senha-camera]

[server]
api_url = https://[seu-dominio-backend]
api_key = [sua-bridge-key]
```

### Executar Bridge
```cmd
run_bridge.bat
```

## ✅ Verificação

### Health Checks
```bash
# Backend
curl https://[seu-backend]/api/health

# Frontend
curl https://[seu-frontend]/api/health

# API Docs
curl https://[seu-backend]/docs
```

### Bridge Test
```bash
curl -X POST https://[seu-backend]/api/camera/test \
  -H "Authorization: Bearer [sua-bridge-key]"
```

## 📊 Monitoramento

### Logs
- **Backend**: Container logs no EasyPanel
- **Frontend**: Container logs no EasyPanel
- **Bridge**: `bridge/logs/bridge.log`

### Endpoints de Status
- **API Health**: `/api/health`
- **Camera Status**: `/api/camera/status`
- **API Documentation**: `/docs`

## 🔒 Segurança

- 🔐 **JWT Secrets** únicos por ambiente
- 🌐 **CORS** configurado corretamente
- 🔑 **API Keys** para bridge authentication
- 🛡️ **SSL/TLS** automático via EasyPanel
- 📝 **Logs** de auditoria completos

## 🚨 Troubleshooting

### Backend não inicia
1. Verificar environment variables
2. Testar conexão Supabase
3. Verificar logs do container

### Frontend não carrega
1. Verificar build args
2. Confirmar backend running
3. Testar health endpoints

### Câmera não conecta
1. Testar RTSP URL manualmente
2. Verificar config.ini da bridge
3. Checar firewall/rede

### Erro 401 API
1. Verificar BRIDGE_API_KEY
2. Confirmar headers Authorization
3. Testar com curl

## 📞 Suporte

- 📖 **Documentação**: Consulte este README
- 🔍 **Debug**: Use `/docs` para testar API
- 📊 **Logs**: Container logs no EasyPanel
- 🗄️ **Database**: Supabase Dashboard > Logs

## 📄 Arquivos de Configuração

- `.env.production` - Configurações para EasyPanel
- `.env.local` - Configurações para localhost
- `.env.example` - Template sem chaves
- `Dockerfile.easypanel` - Docker otimizado
- `docker-compose.yml` - Deploy local

---

🎉 **ShopFlow pronto para uso com IA completa e câmera RTSP!**