# 🚀 Shop Flow - Guia de Deploy Completo

## Pré-requisitos

### Sistema Operacional
- **Ubuntu 20.04+** / **CentOS 8+** / **Windows Server 2019+**
- **RAM**: Mínimo 8GB (Recomendado 16GB)
- **CPU**: 4 cores (Recomendado 8 cores)
- **Storage**: 100GB SSD
- **GPU** (Opcional): NVIDIA RTX para YOLOv8

### Software Necessário
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose python3.10 python3.10-pip nodejs npm git

# CentOS/RHEL
sudo yum install -y docker docker-compose python3 python3-pip nodejs npm git

# Windows
# Instalar Docker Desktop, Python 3.10, Node.js 18+, Git
```

## 📋 Estrutura do Deploy

```
shopflow-production/
├── docker-compose.prod.yml
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── supabase/
│   ├── docker-compose.yml
│   └── volumes/
├── backend/
├── bridge/
├── frontend/
└── monitoring/
```

## 🐳 Deploy com Docker (Recomendado)

### 1. Configurar Supabase Self-hosted
```bash
cd shopflow/supabase
# Configurar variáveis de produção
cp .env .env.prod
nano .env.prod
```

**.env.prod:**
```bash
POSTGRES_PASSWORD=SUPER_STRONG_PASSWORD_HERE
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-change-in-production
ANON_KEY=your_generated_anon_key
SERVICE_ROLE_KEY=your_generated_service_role_key
```

```bash
# Iniciar Supabase
docker-compose -f docker-compose.yml --env-file .env.prod up -d

# Verificar se está rodando
docker-compose ps
```

### 2. Deploy do Backend
```bash
cd ../backend

# Build da imagem
docker build -t shopflow-backend:latest .

# Arquivo docker-compose para produção
```

**docker-compose.backend.yml:**
```yaml
version: '3.8'
services:
  backend:
    image: shopflow-backend:latest
    restart: unless-stopped
    ports:
      - "8001:8001"
    environment:
      - SUPABASE_URL=http://supabase_kong:8000
      - SUPABASE_SERVICE_KEY=${SERVICE_ROLE_KEY}
      - API_HOST=0.0.0.0
      - API_PORT=8001
      - YOLO_MODEL=yolo11n.pt
      - LOG_LEVEL=INFO
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
      - ./face_embeddings:/app/face_embeddings
    depends_on:
      - supabase
    networks:
      - shopflow-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - shopflow-network

volumes:
  redis-data:

networks:
  shopflow-network:
    external: true
```

```bash
# Deploy backend
docker-compose -f docker-compose.backend.yml up -d
```

### 3. Deploy do Frontend
```bash
cd ../frontend

# Build de produção
npm run build

# Dockerfile de produção
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build e deploy
docker build -t shopflow-frontend:latest .
docker run -d -p 3000:80 --name shopflow-frontend shopflow-frontend:latest
```

### 4. Deploy do Bridge (PC da Loja)
```bash
cd ../bridge

# Instalar dependências
pip install -r requirements.txt

# Configurar para produção
cp .env .env.prod
nano .env.prod
```

**.env.prod:**
```bash
CAMERA_RTSP_URL=rtsp://admin:password@IP_DA_CAMERA:554/stream1
VPS_URL=https://your-domain.com/api
VPS_API_KEY=your_production_api_key
```

```bash
# Instalar como serviço (Linux)
sudo cp camera_bridge.service /etc/systemd/system/
sudo systemctl enable camera_bridge
sudo systemctl start camera_bridge
```

## 🌐 Deploy com Nginx + SSL

### Configuração do Nginx
```nginx
# /etc/nginx/sites-available/shopflow
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:8001;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### Configurar SSL com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d your-domain.com

# Auto-renovação
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Configurações de Produção

### Variáveis de Ambiente de Produção

**Backend (.env.prod):**
```bash
# Supabase
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_KEY=your_service_role_key

# API
API_HOST=0.0.0.0
API_PORT=8001
API_DEBUG=false
API_SECRET_KEY=your_super_secret_production_key

# AI/ML
YOLO_MODEL=yolo11m.pt  # Modelo médio para produção
YOLO_CONFIDENCE=0.7
FACE_RECOGNITION_ENABLED=true

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/shopflow/backend.log

# Performance
WORKER_PROCESSES=4
MAX_CONNECTIONS=1000

# Security
ALLOWED_ORIGINS=["https://your-domain.com"]
CORS_CREDENTIALS=true
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws
NODE_ENV=production
```

## 📊 Monitoramento

### 1. Setup de Logs
```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/shopflow
```

**/etc/logrotate.d/shopflow:**
```
/var/log/shopflow/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    create 644 shopflow shopflow
}
```

### 2. Monitoramento com Prometheus
```yaml
# monitoring/docker-compose.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  prometheus-data:
  grafana-data:
```

### 3. Health Checks
```bash
# Script de monitoramento
#!/bin/bash
# /opt/shopflow/health_check.sh

# Verificar serviços
services=("supabase" "backend" "frontend" "bridge")

for service in "${services[@]}"; do
    if ! systemctl is-active --quiet "$service"; then
        echo "ALERT: $service is down"
        # Enviar alerta (email, Slack, etc.)
    fi
done

# Verificar endpoints
curl -f http://localhost:8001/api/health || echo "Backend health check failed"
curl -f http://localhost:3000 || echo "Frontend health check failed"
```

## 🔒 Segurança

### 1. Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 8080    # Bridge (apenas da rede local)

# Bloquear acesso direto aos serviços internos
sudo ufw deny 8001     # Backend direto
sudo ufw deny 5432     # PostgreSQL
sudo ufw deny 6379     # Redis
```

### 2. Backup Strategy
```bash
#!/bin/bash
# /opt/shopflow/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/shopflow"

# Backup do PostgreSQL
docker exec supabase_postgres pg_dump -U postgres shopflow > "$BACKUP_DIR/db_$DATE.sql"

# Backup dos embeddings faciais
tar -czf "$BACKUP_DIR/embeddings_$DATE.tar.gz" /opt/shopflow/face_embeddings

# Backup dos uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /opt/shopflow/uploads

# Limpar backups antigos (manter 30 dias)
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

# Upload para S3 (opcional)
# aws s3 sync $BACKUP_DIR s3://your-backup-bucket/shopflow/
```

### 3. Updates e Manutenção
```bash
#!/bin/bash
# /opt/shopflow/update.sh

# Parar serviços
systemctl stop shopflow-backend
systemctl stop shopflow-frontend

# Backup antes do update
/opt/shopflow/backup.sh

# Pull das atualizações
cd /opt/shopflow
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Reiniciar serviços
systemctl start shopflow-backend
systemctl start shopflow-frontend

# Verificar se está funcionando
sleep 30
curl -f http://localhost:8001/api/health
```

## 🚨 Troubleshooting

### Problemas Comuns

**1. Backend não inicia**
```bash
# Verificar logs
docker logs shopflow-backend
tail -f /var/log/shopflow/backend.log

# Verificar dependências
docker-compose -f docker-compose.prod.yml ps
```

**2. Supabase não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker exec supabase_postgres psql -U postgres -c "SELECT 1"

# Verificar conexão de rede
docker network ls
docker network inspect shopflow-network
```

**3. YOLOv8 não carrega**
```bash
# Verificar se modelo existe
ls -la /opt/shopflow/backend/yolo11*.pt

# Download manual do modelo
cd /opt/shopflow/backend
wget https://github.com/ultralytics/assets/releases/download/v8.0.0/yolo11n.pt
```

**4. Bridge não conecta**
```bash
# Verificar câmera RTSP
ffprobe rtsp://admin:password@IP_CAMERA:554/stream1

# Verificar conexão com VPS
curl -I https://your-domain.com/api/health

# Verificar logs do bridge
tail -f /opt/shopflow/bridge/logs/bridge.log
```

## 📋 Checklist de Deploy

- [ ] Supabase rodando e acessível
- [ ] PostgreSQL com dados de exemplo carregados
- [ ] Backend respondendo em `/api/health`
- [ ] YOLOv8 modelo carregado com sucesso
- [ ] Frontend servindo corretamente
- [ ] WebSocket funcionando
- [ ] Bridge conectando com câmera
- [ ] Bridge enviando frames para VPS
- [ ] SSL certificado válido
- [ ] Nginx proxy funcionando
- [ ] Logs sendo gravados corretamente
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Firewall configurado
- [ ] Health checks funcionando

## 🎯 Performance Tuning

### Backend Optimization
```python
# backend/core/config.py
WORKER_PROCESSES = multiprocessing.cpu_count()
MAX_CONNECTIONS = 1000
YOLO_BATCH_SIZE = 4  # Para GPU
FACE_RECOGNITION_BATCH = 8
```

### Database Optimization
```sql
-- Indexes para performance
CREATE INDEX CONCURRENTLY idx_people_events_timestamp ON people_events(timestamp);
CREATE INDEX CONCURRENTLY idx_people_events_action ON people_events(action);
CREATE INDEX CONCURRENTLY idx_current_stats_date ON current_stats(date);

-- Configurações PostgreSQL
-- shared_buffers = 256MB
-- effective_cache_size = 1GB
-- work_mem = 16MB
```

### Frontend Optimization
```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    unoptimized: true
  }
}
```

## 📞 Suporte Pós-Deploy

**Monitoramento 24/7:**
- Health checks a cada 5 minutos
- Alertas por email/Slack
- Dashboard Grafana em `https://your-domain.com:3001`

**Manutenção Programada:**
- Backup diário às 2:00 AM
- Limpeza de logs semanal
- Updates de segurança mensais
- Review de performance trimestral