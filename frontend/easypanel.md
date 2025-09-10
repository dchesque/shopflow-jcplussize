# ShopFlow Frontend - Easypanel Deployment Guide

## 📋 Pré-requisitos

- Docker instalado localmente
- Conta no Easypanel
- Supabase configurado
- Registro Docker (opcional, mas recomendado)

## 🚀 Deploy Rápido

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.vps` ou `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_API_URL=https://api.seudominio.com
DOMAIN=shopflow.seudominio.com
```

### 2. Build da Imagem

```bash
# Dar permissão ao script (Linux/Mac)
chmod +x deploy-easypanel.sh

# Executar o deploy
./deploy-easypanel.sh
```

Ou manualmente:

```bash
# Build da imagem
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="sua_url" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave" \
  -t shopflow-frontend:latest .

# Testar localmente
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="sua_url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave" \
  shopflow-frontend:latest
```

## 📦 Configuração no Easypanel

### Método 1: Deploy via GitHub

1. Faça push do código para o GitHub
2. No Easypanel, crie um novo app
3. Selecione "GitHub" como fonte
4. Configure:
   - **Build Command**: `docker build -t app .`
   - **Port**: `3000`
   - **Health Check Path**: `/api/health`

### Método 2: Deploy via Docker Registry

1. Faça push da imagem para um registry:

```bash
# Docker Hub
docker tag shopflow-frontend:latest seu-usuario/shopflow-frontend:latest
docker push seu-usuario/shopflow-frontend:latest

# GitHub Container Registry
docker tag shopflow-frontend:latest ghcr.io/seu-usuario/shopflow-frontend:latest
docker push ghcr.io/seu-usuario/shopflow-frontend:latest
```

2. No Easypanel:
   - Crie novo app
   - Selecione "Docker Image"
   - Image: `seu-usuario/shopflow-frontend:latest`
   - Port: `3000`

### Variáveis de Ambiente no Easypanel

Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

### Configurações Avançadas

#### Domínio Customizado
1. Vá em "Domains" no Easypanel
2. Adicione seu domínio
3. Configure o DNS apontando para o IP do Easypanel

#### SSL/HTTPS
- Easypanel configura automaticamente Let's Encrypt

#### Recursos
Recomendado para produção:
- **CPU**: 0.5-1 vCPU
- **RAM**: 512MB-1GB
- **Replicas**: 2+ para alta disponibilidade

## 🔍 Monitoramento

### Health Check
O app possui health check em `/api/health`

### Logs
```bash
# Via Easypanel UI
# Ou via CLI se configurado
docker logs shopflow-frontend
```

### Métricas
- CPU Usage
- Memory Usage
- Request Count
- Response Time

## 🛠️ Troubleshooting

### Problema: Build falha
```bash
# Verificar logs de build
docker build . --no-cache --progress=plain
```

### Problema: App não inicia
```bash
# Verificar variáveis de ambiente
docker run --rm shopflow-frontend:latest env

# Verificar logs
docker logs shopflow-frontend
```

### Problema: Erro 500
- Verifique as variáveis de ambiente
- Confirme conexão com Supabase
- Verifique logs do container

## 🔄 CI/CD com GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Easypanel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        env:
          REGISTRY: ghcr.io
          IMAGE_NAME: ${{ github.repository }}-frontend
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          
          docker build \
            --build-arg NEXT_PUBLIC_SUPABASE_URL="${{ secrets.SUPABASE_URL }}" \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${{ secrets.SUPABASE_ANON_KEY }}" \
            -t $REGISTRY/$IMAGE_NAME:latest \
            -t $REGISTRY/$IMAGE_NAME:${{ github.sha }} \
            ./frontend
          
          docker push $REGISTRY/$IMAGE_NAME:latest
          docker push $REGISTRY/$IMAGE_NAME:${{ github.sha }}
      
      - name: Deploy to Easypanel
        run: |
          # Webhook do Easypanel para trigger deploy
          curl -X POST ${{ secrets.EASYPANEL_WEBHOOK_URL }}
```

## 📊 Otimizações Aplicadas

### Docker
- ✅ Multi-stage build (reduz tamanho em ~70%)
- ✅ Alpine Linux (imagem mínima)
- ✅ Standalone build do Next.js
- ✅ Cache de dependências
- ✅ .dockerignore otimizado
- ✅ Health check integrado
- ✅ Non-root user

### Next.js
- ✅ Output standalone
- ✅ Compressão gzip/brotli
- ✅ Image optimization
- ✅ Code splitting automático
- ✅ Tree shaking
- ✅ Minificação
- ✅ Remove console.log em produção

### Performance
- ✅ CDN para assets estáticos
- ✅ Cache headers otimizados
- ✅ Lazy loading de componentes
- ✅ Prefetch de rotas

## 📈 Métricas Esperadas

- **Tamanho da imagem**: ~150MB
- **Tempo de build**: 2-5 minutos
- **Tempo de startup**: <10 segundos
- **Memory usage**: 200-400MB
- **Lighthouse Score**: 90+

## 🔗 Links Úteis

- [Easypanel Docs](https://easypanel.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Build local testado
- [ ] Health check funcionando
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Monitoramento configurado
- [ ] Backup do banco configurado
- [ ] Logs centralizados
- [ ] Alertas configurados
- [ ] Documentação atualizada