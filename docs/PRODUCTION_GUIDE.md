# 🚀 ShopFlow - Guia de Produção

## 📋 Visão Geral

Este guia contém todas as informações necessárias para deploy e manutenção do ShopFlow em ambiente de produção.

## 🏗️ Arquitetura de Produção

```
ShopFlow Production Architecture
├── 🌐 Frontend (Vercel/Netlify)
│   ├── Next.js Application
│   ├── Static Assets (CDN)
│   └── Edge Functions
│
├── 🖥️ Backend (EasyPanel/Docker)
│   ├── FastAPI Application
│   ├── YOLO AI Processing
│   └── File Storage
│
├── 🗄️ Database (Supabase)
│   ├── PostgreSQL
│   ├── Real-time Subscriptions
│   └── Storage Buckets
│
├── 📊 Monitoring
│   ├── Sentry (Error Tracking)
│   ├── Vercel Analytics
│   └── Custom Monitoring
│
└── 🔄 CI/CD (GitHub Actions)
    ├── Testing Pipeline
    ├── Build & Deploy
    └── Backup Automation
```

## 🌍 Variáveis de Ambiente

### Frontend (.env.production)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend API
NEXT_PUBLIC_API_URL=https://api.shopflow.com
NEXT_PUBLIC_BACKEND_URL=https://api.shopflow.com

# Analytics
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# Environment
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Backend (.env)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# API Configuration
API_HOST=0.0.0.0
API_PORT=8001
API_DEBUG=False

# Security
BRIDGE_API_KEY=your-production-api-key

# AI Configuration
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

## 🚀 Deploy Procedures

### 1. Frontend Deploy (Vercel)

#### Configuração Inicial
1. Fork o repositório
2. Conectar ao Vercel
3. Configurar variáveis de ambiente
4. Configure o build:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs"
}
```

#### Deploy Commands
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# Deploy with environment
vercel --env NEXT_PUBLIC_API_URL=https://api.shopflow.com
```

### 2. Backend Deploy (EasyPanel)

#### Configuração Docker
```dockerfile
# Build commands já configurados no Dockerfile
docker build -t shopflow-backend .
docker run -p 8001:8001 shopflow-backend
```

#### EasyPanel Setup
1. Create new service
2. Connect GitHub repository
3. Set build context: `./backend`
4. Configure environment variables
5. Set port: `8001`
6. Deploy

### 3. Database Setup (Supabase)

#### Configuração Inicial
```sql
-- Enable Row Level Security
ALTER TABLE camera_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all operations for authenticated users" 
ON camera_events FOR ALL 
TO authenticated 
USING (true);

-- Enable Real-time
ALTER TABLE camera_events REPLICA IDENTITY FULL;
```

#### Backup Configuration
```sql
-- Schedule automated backups
SELECT cron.schedule('daily-backup', '0 2 * * *', 'SELECT pg_dump...');
```

## 📊 Monitoring & Alerting

### 1. Sentry Configuration

#### Error Tracking
- Frontend errors: Client-side JavaScript errors
- Backend errors: Python exceptions and API errors
- Performance monitoring: Core Web Vitals, API response times
- User context: Authenticated user information

#### Alert Rules
```javascript
// Critical errors alert immediately
if (error.level === 'fatal') {
  notify.slack('#critical-alerts');
  notify.email('team@shopflow.com');
}

// Performance degradation
if (performance.lcp > 4000) {
  notify.slack('#performance-alerts');
}
```

### 2. Uptime Monitoring

#### Health Checks
```bash
# Frontend health check
curl https://shopflow.vercel.app/api/health

# Backend health check
curl https://api.shopflow.com/api/health

# Database health check
curl https://api.shopflow.com/api/analytics/health
```

#### Monitoring Scripts
```python
# monitoring/health_check.py
import requests
import time
import logging

def check_frontend():
    response = requests.get('https://shopflow.vercel.app/api/health')
    return response.status_code == 200

def check_backend():
    response = requests.get('https://api.shopflow.com/api/health')
    return response.status_code == 200

def main():
    if not check_frontend():
        alert('Frontend is down')
    
    if not check_backend():
        alert('Backend is down')
```

### 3. Performance Monitoring

#### Key Metrics
- **Frontend**: LCP, FID, CLS, FCP, TTFB
- **Backend**: Response time, throughput, error rate
- **Database**: Connection pool usage, query performance
- **AI**: Processing time per frame, accuracy metrics

#### Dashboard Setup
```javascript
// Custom metrics for Vercel Analytics
import { track } from '@vercel/analytics';

// Track user interactions
track('camera_view_opened', { camera_id: 'cam_001' });
track('employee_registered', { department: 'sales' });
track('analytics_export', { report_type: 'daily' });
```

## 🔒 Security Checklist

### 1. Frontend Security
- [x] HTTPS enforced
- [x] CSP headers configured
- [x] XSS protection enabled
- [x] CSRF protection
- [x] Secure cookies
- [x] Environment variables secured

### 2. Backend Security
- [x] API key authentication
- [x] Rate limiting configured
- [x] Input validation
- [x] SQL injection protection
- [x] File upload restrictions
- [x] CORS properly configured

### 3. Database Security
- [x] Row Level Security (RLS)
- [x] Encrypted at rest
- [x] SSL/TLS connections
- [x] Backup encryption
- [x] Access logging
- [x] Regular security updates

## 💾 Backup & Recovery

### 1. Automated Backups

#### Daily Backups
```bash
# Database backup
0 2 * * * python /scripts/backup.py --type database

# Configuration backup
0 1 * * 1 python /scripts/backup.py --type config

# Media files backup
0 3 * * 0 python /scripts/backup.py --type media
```

#### Full Weekly Backup
```bash
# Complete system backup
0 3 * * 0 python /scripts/backup.py --type full
```

### 2. Disaster Recovery

#### Recovery Procedures
1. **Database Recovery**
   ```bash
   # Restore from backup
   psql -d shopflow_prod < database_backup_20250101_020000.sql
   ```

2. **Application Recovery**
   ```bash
   # Redeploy from backup
   docker run -d shopflow-backend:backup-20250101
   ```

3. **Configuration Recovery**
   ```bash
   # Restore configuration files
   tar -xzf config_backup_20250101.tar.gz
   ```

#### RTO/RPO Targets
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 24 hours
- **Data retention**: 30 days local, 1 year offsite

### 3. Monitoring Backups

#### Backup Validation
```python
# scripts/validate_backup.py
def validate_backup(backup_file):
    # Check file integrity
    # Verify backup contents
    # Test restoration process
    pass

def notify_backup_status(status, details):
    # Send notification to team
    # Update monitoring dashboard
    pass
```

## 🔧 Maintenance Procedures

### 1. Regular Maintenance

#### Weekly Tasks
- [ ] Review error logs
- [ ] Check system performance
- [ ] Validate backup integrity
- [ ] Update dependencies (if needed)
- [ ] Review security alerts

#### Monthly Tasks
- [ ] Full system health check
- [ ] Capacity planning review
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] Performance optimization review

### 2. Update Procedures

#### Frontend Updates
```bash
# Development
npm run build
npm run test

# Staging deploy
vercel --staging

# Production deploy (after validation)
vercel --prod
```

#### Backend Updates
```bash
# Build new image
docker build -t shopflow-backend:v2.1.0 .

# Deploy to staging
docker run -p 8002:8001 shopflow-backend:v2.1.0

# Deploy to production (zero-downtime)
# Use blue-green deployment or rolling updates
```

### 3. Scaling Considerations

#### Horizontal Scaling
- **Frontend**: Automatic via Vercel Edge Network
- **Backend**: Docker containers with load balancer
- **Database**: Supabase handles scaling automatically

#### Vertical Scaling
- Monitor resource usage
- Scale containers based on demand
- Optimize AI processing for batch operations

## 🚨 Incident Response

### 1. Incident Classification

#### Severity Levels
- **P0 (Critical)**: Complete system outage
- **P1 (High)**: Major feature unavailable
- **P2 (Medium)**: Minor feature issue
- **P3 (Low)**: Cosmetic or enhancement

### 2. Response Procedures

#### P0 Incident Response
1. **Immediate Response** (0-15 min)
   - Acknowledge incident
   - Assemble response team
   - Begin diagnosis

2. **Investigation** (15-60 min)
   - Identify root cause
   - Implement temporary fix
   - Communicate status

3. **Resolution** (1-4 hours)
   - Deploy permanent fix
   - Verify system stability
   - Post-incident review

### 3. Communication Plan

#### Internal Communication
- Slack: #incidents channel
- Email: team@shopflow.com
- Phone: Emergency contact list

#### External Communication
- Status page updates
- Customer notifications
- Social media updates (if needed)

## 📈 Performance Optimization

### 1. Frontend Optimization

#### Build Optimization
```javascript
// next.config.js production optimizations
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion'],
  },
  
  compiler: {
    removeConsole: true,
  }
}
```

#### Runtime Optimization
- Code splitting by route
- Lazy loading of components
- Image optimization with Next.js Image
- CDN for static assets

### 2. Backend Optimization

#### API Performance
```python
# Performance optimizations
- Connection pooling
- Query optimization
- Caching strategies
- Async processing
```

#### AI Processing
```python
# YOLO optimization
- Batch processing
- GPU acceleration (if available)
- Model quantization
- Frame sampling optimization
```

## 📊 KPIs & Metrics

### 1. Technical KPIs

#### Performance Metrics
- **Frontend**: Lighthouse score > 90
- **Backend**: API response time < 200ms
- **Uptime**: 99.9% availability
- **Error rate**: < 0.1%

#### Security Metrics
- **Vulnerability scan**: Weekly
- **Security incidents**: 0 per month
- **Compliance**: 100% LGPD/GDPR

### 2. Business KPIs

#### Usage Metrics
- **Active users**: Daily/Monthly
- **Feature adoption**: Usage per feature
- **Customer satisfaction**: NPS score
- **Support tickets**: Volume and resolution time

## 📞 Support & Troubleshooting

### 1. Common Issues

#### Frontend Issues
```bash
# Build failures
npm run build -- --verbose

# Runtime errors
Check Sentry dashboard

# Performance issues
npm run analyze
```

#### Backend Issues
```bash
# Service not starting
docker logs shopflow-backend

# Database connection
Check Supabase dashboard

# AI processing errors
Check model files and GPU/CPU usage
```

### 2. Emergency Contacts

- **Team Lead**: team-lead@shopflow.com
- **DevOps**: devops@shopflow.com
- **On-call**: +1-xxx-xxx-xxxx
- **Sentry**: Configure alerts
- **Vercel**: Support dashboard

---

## 📋 Production Checklist

Before going live, ensure:

### Security
- [ ] All environment variables configured
- [ ] HTTPS enforced
- [ ] API keys rotated
- [ ] Security headers configured
- [ ] Access logs enabled
- [ ] Backup encryption enabled

### Performance
- [ ] Lighthouse score > 90
- [ ] Load testing completed
- [ ] CDN configured
- [ ] Database optimized
- [ ] Monitoring configured

### Reliability
- [ ] Health checks working
- [ ] Backup automation configured
- [ ] Disaster recovery tested
- [ ] Incident response plan ready
- [ ] Team trained on procedures

### Compliance
- [ ] LGPD compliance verified
- [ ] Privacy policy updated
- [ ] Terms of service current
- [ ] Data retention configured
- [ ] Audit logging enabled

---

**📅 Document Version**: v1.0  
**📅 Last Updated**: January 2025  
**📅 Next Review**: Quarterly