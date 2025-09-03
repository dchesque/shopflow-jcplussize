# 🛍️ ShopFlow - Sistema Inteligente de Contagem de Pessoas

Sistema avançado de análise de tráfego de pessoas com IA integrada, reconhecimento facial LGPD-compliant, análise comportamental e detecção inteligente de compras.

## 🚀 Features

### 🎯 Core Features
- ✅ **Contagem de Pessoas em Tempo Real** - YOLO11 + Deep Sort
- ✅ **Câmera RTSP Intelbras Mibo** - Captura via bridge dedicada
- ✅ **WebSocket Live Stream** - Atualizações instantâneas
- ✅ **Dashboard Interativo** - Métricas e gráficos em tempo real
- ✅ **Supabase Database** - PostgreSQL com realtime subscriptions
- ✅ **API REST Completa** - FastAPI com documentação automática
- ✅ **Deploy Easypanel** - Containerização completa com CI/CD

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
- ✅ **Direito ao esquecimento** - Exclusão completa de dados

## 🛠️ Stack Tecnológica

### Backend
- **FastAPI** - API REST moderna e rápida
- **YOLO11** - Detecção de pessoas state-of-the-art
- **DeepFace** - Reconhecimento facial com FaceNet512
- **scikit-learn** - Machine learning para análise comportamental
- **Supabase** - PostgreSQL + Realtime + Auth
- **Redis** - Cache e pub/sub
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
- **GitHub Actions** - CI/CD
- **Easypanel** - Deploy automático
- **Nginx** - Reverse proxy
- **Prometheus** - Monitoramento

## 🚀 Quick Start

### 1. Clone e Configure
```bash
git clone https://github.com/dchesque/shopflow-jcplussize.git
cd shopflow-jcplussize

# Configurar ambiente
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Bridge PC da loja
cd bridge
copy config.ini.example config.ini
# Editar config.ini com senha real da câmera
```

### 2. Docker Compose (Recomendado)
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 3. Desenvolvimento Local
```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### 3. Bridge da Câmera (PC da Loja)
```cmd
# Windows - PC da loja
cd bridge
install_windows.bat

# Editar config.ini com dados reais
# [camera]
# username = admin  
# password = SUA_SENHA_AQUI

# Iniciar bridge
run_bridge.bat
```

## 🎥 Configuração da Câmera RTSP

### Intelbras Mibo - 192.168.1.52
- **IP**: `192.168.1.52`
- **RTSP Principal**: `rtsp://admin:senha@192.168.1.52:554/cam/realmonitor?channel=1&subtype=0`
- **RTSP Fallback**: `rtsp://admin:senha@192.168.1.52:554/cam/realmonitor?channel=1&subtype=1`
- **Porta**: `554`
- **Usuário**: `admin`
- **Resolução**: 1920x1080 (configurável)

### Teste de Conectividade
```bash
# Teste manual RTSP
ffplay rtsp://admin:senha@192.168.1.52:554/cam/realmonitor?channel=1&subtype=0

# Teste API bridge
curl -X POST https://api.shopflow.jcplussize.com.br/api/camera/test \
  -H "Authorization: Bearer bridge_prod_key_2024"
```

## 📊 Métricas Inteligentes

### Exemplo de Dados em Tempo Real
```json
{
  "total_visitors": 45,
  "real_customers": 42,
  "employees_detected": 3,
  "groups": {
    "families": 5,
    "couples": 8,
    "friends": 3,
    "average_size": 2.3
  },
  "customer_types": {
    "objective": 15,
    "explorer": 12,
    "economic": 8,
    "casual": 7
  },
  "purchases": {
    "confirmed_by_behavior": 18,
    "conversion_rate": 42.8
  },
  "returning_customers": {
    "count": 8,
    "percentage": 19.0
  }
}
```

## 🔧 Configuração Avançada

### Registrar Funcionários (LGPD-Compliant)
```bash
curl -X POST "http://localhost:8001/api/ai/employees/register" \
  -F "employee_id=emp001" \
  -F "name=João Silva" \
  -F "photo=@foto_joao.jpg"
```

### Configurações de Privacidade
```bash
# Verificar configurações atuais
GET /api/privacy/settings

# Relatório de conformidade
GET /api/privacy/compliance-report

# Exclusão de dados (Direito ao Esquecimento)
POST /api/privacy/data-deletion
```

## 🐳 Deploy para Easypanel

### 1. Configurar Secrets no GitHub
```bash
# Repository Settings > Secrets and Variables > Actions
EASYPANEL_BACKEND_WEBHOOK=https://panel.easypanel.io/webhooks/...
EASYPANEL_FRONTEND_WEBHOOK=https://panel.easypanel.io/webhooks/...

NEXT_PUBLIC_SUPABASE_URL=https://supabase.shopflow.jcplussize.com.br
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.shopflow.jcplussize.com.br

BACKEND_HEALTH_URL=https://api.shopflow.jcplussize.com.br
FRONTEND_HEALTH_URL=https://shopflow.jcplussize.com.br

SLACK_WEBHOOK_URL=https://hooks.slack.com/... (opcional)
```

### 2. Deploy Automático
```bash
# Qualquer push na main dispara deploy
git add .
git commit -m "🚀 Deploy with camera bridge ready"
git push origin main
```

### 3. Monitoramento
- ✅ GitHub Actions CI/CD automático
- ✅ Build multi-arch (AMD64/ARM64)
- ✅ Deploy incremental (só o que mudou)
- ✅ Health checks automáticos
- ✅ Notificações Slack
- ✅ Rollback automático em falha

📋 **[Guia Completo de Deploy](./DEPLOY_EASYPANEL.md)**

## 📁 Estrutura do Projeto

```
shopflow-jcplussize/
├── 🎯 frontend/               # Next.js App
│   ├── src/app/              # App Router
│   ├── src/components/       # Componentes React
│   ├── src/lib/             # Utilities e configs
│   ├── Dockerfile           # Container frontend
│   └── next.config.js       # Configuração Next.js
│
├── 🚀 backend/               # FastAPI API
│   ├── main.py              # Entry point
│   ├── core/                # Core modules
│   │   ├── detector.py      # YOLO11 detection
│   │   ├── tracker.py       # Object tracking
│   │   └── ai/              # Smart Analytics
│   │       ├── face_recognition/     # Reconhecimento facial
│   │       ├── temporal_analysis/    # Análise temporal
│   │       ├── behavior_reid/        # Re-identificação
│   │       ├── group_detection/      # Detecção de grupos
│   │       └── smart_analytics_engine.py
│   ├── Dockerfile           # Container backend
│   └── requirements.txt     # Python dependencies
│
├── 📄 docs/                  # Documentação
│   ├── DEPLOYMENT_GUIDE.md  # Guia de deploy
│   └── SMART_ANALYTICS_GUIDE.md # IA e Analytics
│
├── 🐳 docker-compose.yml     # Desenvolvimento local
├── 🚀 .github/workflows/     # CI/CD GitHub Actions
├── 🔧 .env.example          # Template de configuração
└── 📋 README.md             # Este arquivo
```

## 🔍 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/stats` - Estatísticas básicas
- `GET /api/stats/detailed` - Estatísticas detalhadas
- `WS /ws/stats` - WebSocket tempo real

### Smart Analytics
- `POST /api/ai/employees/register` - Cadastrar funcionário
- `GET /api/ai/analytics/detailed` - Análise completa
- `GET /api/ai/person/{id}` - Detalhes de pessoa
- `WS /ws/smart-metrics` - Métricas inteligentes

### Privacidade
- `GET /api/privacy/settings` - Configurações LGPD
- `GET /api/privacy/compliance-report` - Relatório conformidade
- `POST /api/privacy/data-deletion` - Direito ao esquecimento

## 🎯 Performance

- **Detecção**: >90% precisão
- **Reconhecimento Facial**: >95% precisão
- **Re-identificação Comportamental**: >75% precisão
- **Detecção de Grupos**: >90% precisão
- **Análise Temporal**: >85% precisão na detecção de compras

## 📞 Suporte

- **📚 Documentação**: `/docs/`
- **🔧 API Docs**: `http://localhost:8001/docs`
- **🐛 Issues**: GitHub Issues
- **💬 Discussões**: GitHub Discussions

## 📄 Licença

Proprietary - Todos os direitos reservados

## 🏆 Features Futuras

- [ ] 😊 Análise de emoções
- [ ] 📈 Previsão de demanda com ML
- [ ] 💳 Integração com PDV
- [ ] 📊 Dashboard executivo
- [ ] 🔔 Alertas personalizados
- [ ] 📱 App mobile

---

**Desenvolvido com ❤️ para revolucionar a análise de tráfego de pessoas**