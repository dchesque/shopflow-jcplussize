# ShopFlow Frontend - Dockerfile para Easypanel
FROM node:18-alpine AS builder

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --silent

# Copiar código fonte
COPY . .

# Build da aplicação Next.js
RUN npm run build

# Imagem de produção
FROM node:18-alpine AS runner

WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicialização
CMD ["node", "server.js"]