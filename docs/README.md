# 📚 ShopFlow - Documentação Completa

Bem-vindo à documentação completa do **ShopFlow**, o sistema inteligente de análise de fluxo de pessoas para estabelecimentos comerciais.

## 🎯 O que é o ShopFlow?

O ShopFlow é uma solução completa de **Inteligência Artificial** que utiliza visão computacional para analisar o fluxo de pessoas em tempo real, fornecendo insights valiosos sobre comportamento de clientes, otimização de staffing e predições inteligentes.

### ✨ Principais Características

- 🎥 **Detecção Inteligente**: YOLO11 para detecção precisa de pessoas
- 👤 **Reconhecimento Facial**: Sistema LGPD/GDPR compliant para funcionários
- 🎭 **Análise Comportamental**: Padrões de movimento e zonas quentes
- 🎯 **Segmentação de Clientes**: Classificação automática de perfis
- 🔮 **Predições IA**: Previsões de fluxo e necessidade de staffing
- 🔒 **Privacidade Total**: Conformidade total com LGPD/GDPR
- ⚡ **Tempo Real**: WebSocket para métricas instantâneas

## 📖 Documentação

### 📋 Guias Essenciais

| Documento | Descrição | Ideal Para |
|-----------|-----------|------------|
| **[📚 Documentação Completa](BACKEND_DOCUMENTATION.md)** | Guia técnico detalhado do backend | Desenvolvedores e Arquitetos |
| **[🚀 Guia de Deploy](DEPLOY_GUIDE.md)** | Instruções passo a passo para deploy | DevOps e Administradores |
| **[🔗 Exemplos de API](API_EXAMPLES.md)** | Exemplos práticos de uso | Desenvolvedores Frontend |

### 🏗️ Arquitetura do Sistema

```
ShopFlow Sistema Completo
├── 🎥 Backend (FastAPI + Python)
│   ├── Smart Analytics Engine
│   ├── API RESTful
│   ├── WebSocket Tempo Real
│   └── Compliance LGPD/GDPR
│
├── 🌐 Frontend (Next.js + React)
│   ├── Dashboard Analytics
│   ├── Gerenciamento Funcionários
│   └── Configurações Privacidade
│
└── 🔌 Bridge Câmera
    ├── Captura de Frames
    ├── Processamento Local
    └── Comunicação API
```

## 🚀 Quick Start

### 1️⃣ Backend (Obrigatório)

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/shopflow-jcplussize.git
cd shopflow-jcplussize/backend

# Instalar dependências
pip install -r requirements.txt

# Configurar ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Executar
python main.py
```

**Verificar:** http://localhost:8001/api/health

### 2️⃣ Frontend (Opcional)

```bash
# Ir para frontend
cd ../frontend

# Instalar dependências
npm install

# Executar
npm run dev
```

**Acessar:** http://localhost:3000

### 3️⃣ Deploy Produção

**EasyPanel (Recomendado):**
1. Fork o repositório
2. Conectar no EasyPanel
3. Configurar variáveis de ambiente
4. Deploy automático

**Detalhes:** [Guia de Deploy](DEPLOY_GUIDE.md)

## 📊 Endpoints Principais

### 🏥 Sistema
- `GET /api/health` - Status geral
- `GET /docs` - Documentação interativa

### 🎥 Câmera
- `POST /api/camera/process` - Processar frame
- `GET /api/camera/status` - Status da câmera

### 📈 Analytics
- `GET /api/analytics/smart-metrics` - Métricas IA
- `GET /api/analytics/behavior-patterns` - Padrões comportamentais
- `GET /api/analytics/predictions` - Predições

### 👥 Funcionários
- `POST /api/employees/register` - Registrar
- `GET /api/employees/list` - Listar
- `DELETE /api/employees/{id}` - Remover (LGPD)

### 🔒 Privacidade
- `GET /api/privacy/settings` - Configurações
- `GET /api/privacy/compliance-report` - Relatório LGPD

## 🛠️ Configuração Essencial

### Variáveis de Ambiente

```env
# Supabase (Obrigatório)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_KEY=sua-service-key

# API
API_HOST=0.0.0.0
API_PORT=8001

# Segurança
BRIDGE_API_KEY=sua-chave-super-segura

# IA (Opcional)
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5
```

**Arquivo completo:** [.env.example](../backend/.env.example)

## 🧠 Smart Analytics Engine

O coração do sistema com 4 módulos especializados:

### 1. 👤 Face Recognition Manager
- Registro seguro de funcionários
- Reconhecimento em tempo real
- Total conformidade LGPD/GDPR
- Direito ao esquecimento

### 2. 🎭 Behavior Analyzer
- Zonas quentes (heatmap)
- Tempo de permanência
- Padrões de movimento
- Detecção de grupos

### 3. 🎯 Customer Segmentation
- Novos clientes
- Clientes regulares
- Clientes VIP
- Funcionários

### 4. 🔮 Predictive Insights
- Previsão de fluxo
- Necessidade de staffing
- Probabilidade de conversão
- Detecção de anomalias

## 🔒 Privacidade e Segurança

### Conformidade LGPD/GDPR
- ✅ **Direito ao Acesso**: APIs para consultar dados
- ✅ **Direito à Retificação**: Endpoints de atualização
- ✅ **Direito ao Esquecimento**: Exclusão completa
- ✅ **Direito à Portabilidade**: Export de dados
- ✅ **Logs de Auditoria**: Registro completo
- ✅ **Consentimento**: Validação de operações
- ✅ **Minimização**: Coleta apenas necessária
- ✅ **Criptografia**: Dados sensíveis protegidos

### Medidas Técnicas
- 🔐 Autenticação via API Key
- 🛡️ CORS configurado
- 📝 Logs estruturados
- 🔍 Validação rigorosa
- 🔄 Rotação de chaves
- 🚫 Anonimização automática

## 📈 Performance

### Benchmarks Típicos
- **Processamento por Frame**: 20-50ms
- **Detecção YOLO**: 15-30ms
- **Reconhecimento Facial**: 5-15ms
- **Análise Comportamental**: 5-10ms
- **Throughput**: 20-50 FPS

### Otimizações
- ⚡ Processamento assíncrono
- 🔄 Connection pooling
- 💾 Cache inteligente
- 📦 Batch processing
- 🐌 Lazy loading

## 🐛 Troubleshooting

### Problemas Comuns

**Servidor não inicia:**
```bash
# Verificar dependências
pip install -r requirements.txt

# Verificar variáveis
echo $SUPABASE_URL

# Ver logs
tail -f logs/app.log
```

**Erro de conexão Supabase:**
```bash
# Verificar URL e chaves
# Renovar chaves no dashboard Supabase
```

**Modelo YOLO não carrega:**
```bash
# Verificar conexão internet
# Modelo baixa automaticamente
```

**Guia completo:** [Deploy Guide - Troubleshooting](DEPLOY_GUIDE.md#-troubleshooting)

## 📚 Exemplos de Uso

### Python
```python
from shopflow_client import ShopFlowClient

client = ShopFlowClient("http://localhost:8001", "sua-api-key")

# Health check
health = client.health_check()
print("Sistema saudável:", health['status'] == 'healthy')

# Processar frame
result = client.process_frame("./frame.jpg")
print(f"Pessoas detectadas: {result['people_count']}")
```

### JavaScript
```javascript
const client = new ShopFlowClient('http://localhost:8001', 'sua-api-key');

// Métricas em tempo real via WebSocket
client.connectWebSocket((data) => {
    console.log('Métricas:', data);
});
```

### cURL
```bash
# Health check
curl http://localhost:8001/api/health

# Processar frame
curl -X POST http://localhost:8001/api/camera/process \
  -H "Authorization: Bearer SUA_API_KEY" \
  -F "frame=@frame.jpg" \
  -F "timestamp=$(date -Iseconds)" \
  -F "camera_id=cam_001"
```

**Exemplos completos:** [API Examples](API_EXAMPLES.md)

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** as mudanças (`git commit -m 'Add AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Diretrizes
- Seguir padrões de código existentes
- Adicionar testes para novas funcionalidades
- Atualizar documentação
- Manter compatibilidade com LGPD/GDPR

## 📞 Suporte

### 🔍 Recursos de Ajuda
- **[📖 Documentação Completa](BACKEND_DOCUMENTATION.md)** - Referência técnica
- **[🚀 Guia de Deploy](DEPLOY_GUIDE.md)** - Instalação e deploy
- **[🔗 Exemplos de API](API_EXAMPLES.md)** - Código pronto
- **[📊 API Docs](http://localhost:8001/docs)** - Swagger interativo (servidor rodando)

### 📬 Contato
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/shopflow-jcplussize/issues)
- 📧 **Email**: suporte@shopflow.com
- 💬 **Discord**: [Comunidade ShopFlow](https://discord.gg/shopflow)

### 🆘 Suporte Urgente
Para problemas críticos em produção:
1. Verificar [Status Page](https://status.shopflow.com)
2. Consultar [Troubleshooting](DEPLOY_GUIDE.md#-troubleshooting)
3. Abrir issue prioritário no GitHub
4. Contato direto: urgent@shopflow.com

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](../LICENSE) para detalhes.

### Reconhecimentos
- **[Ultralytics](https://ultralytics.com/)** - YOLO11
- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
- **[OpenCV](https://opencv.org/)** - Visão computacional

## 🎯 Roadmap

### 🔄 Versão Atual (2.0.0)
- ✅ Smart Analytics Engine completo
- ✅ 4 módulos de IA integrados
- ✅ Conformidade LGPD/GDPR total
- ✅ WebSocket tempo real
- ✅ Deploy EasyPanel otimizado

### 🚀 Próximas Versões

**v2.1.0 - Analytics Avançado**
- 📊 Dashboard avançado com gráficos
- 📈 Relatórios customizáveis
- 📱 App mobile companion
- 🔔 Notificações inteligentes

**v2.2.0 - Integrações**
- 🛒 Integração com sistemas POS
- 📧 Alertas por email/SMS
- 📊 Export para BI tools
- 🔌 Webhooks customizáveis

**v3.0.0 - Multi-Store**
- 🏪 Suporte multi-loja
- 🌐 Dashboard centralizado
- 👥 Multi-tenancy
- 📊 Analytics comparativo

---

**🚀 Comece agora:** Siga o [Guia de Deploy](DEPLOY_GUIDE.md) para ter seu ShopFlow rodando em minutos!

**💡 Dúvidas?** Consulte os [Exemplos de API](API_EXAMPLES.md) para código pronto para usar.

**🔧 Problemas?** Veja o [Troubleshooting](DEPLOY_GUIDE.md#-troubleshooting) para soluções rápidas.

---

**Feito com ❤️ para revolucionar o varejo com Inteligência Artificial**