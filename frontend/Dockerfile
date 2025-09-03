# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# MUDE ESTA LINHA:
RUN npm install  # Mudou de 'npm ci' para 'npm install'

# Copia código
COPY . .

# Build variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL

# Build app
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copia arquivos necessários
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]