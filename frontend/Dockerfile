# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files primeiro para cache layers
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci --frozen-lockfile && \
    npm cache clean --force

# Copiar todo o código fonte (incluindo arquivos de config)
COPY . .

# Build variables (com valores default para EasyPanel)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY  
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

# Definir variáveis de ambiente para o build
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-"https://orzzycayjzgcuvcsrxsi.supabase.co"}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yenp5Y2F5anpnY3V2Y3NyeHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDg4MjQsImV4cCI6MjA3MjQ4NDgyNH0.VDxim7htKDFDO_RjeIHIMW1lxeEaDDZAjOBkxUSfclg"}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"https://shopflow-backend.hshars.easypanel.host"}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL:-"wss://shopflow-backend.hshars.easypanel.host"}

# Build da aplicação com standalone output
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar dumb-init e curl para healthcheck
RUN apk add --no-cache dumb-init curl

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar arquivos do standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Mudar para usuário não-root
USER nextjs

# Variáveis de ambiente runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Health check (usando endpoint que existe)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Expor porta
EXPOSE 3000

# Usar dumb-init para melhor handling de processos
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar (usando standalone server)
CMD ["node", "server.js"]