# Multi-stage build otimizado para produção
FROM python:3.11-slim AS builder

# Instalar dependências de sistema necessárias para compilação
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    pkg-config \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Criar e ativar ambiente virtual
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Atualizar pip e instalar ferramentas de build
RUN pip install --upgrade pip setuptools wheel

# Criar requirements temporário sem dlib/face_recognition problemáticos
COPY requirements.txt /tmp/requirements_orig.txt
RUN grep -v "dlib\|face_recognition\|face-recognition" /tmp/requirements_orig.txt > /tmp/requirements.txt || cp /tmp/requirements_orig.txt /tmp/requirements.txt

# Instalar dependências Python (sem dlib e face_recognition)
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Tentar instalar face_recognition de forma alternativa (opcional)
RUN pip install --no-cache-dir opencv-python-headless || true

# Stage de produção
FROM python:3.11-slim AS production

# Instalar apenas runtime dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgfortran5 \
    libopenblas0 \
    liblapack3 \
    libjpeg-turbo-progs \
    libpng16-16 \
    libtiff6 \
    curl \
    wget \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copiar venv do builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Configurar diretório de trabalho
WORKDIR /app

# Criar diretórios necessários com permissões adequadas
RUN mkdir -p logs uploads temp face_embeddings cache && \
    chmod -R 777 logs uploads temp face_embeddings cache

# Copiar código da aplicação
COPY . /app/

# Download do modelo YOLO se não existir
RUN if [ ! -f "yolo11n.pt" ]; then \
    wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt || \
    echo "Warning: Failed to download YOLO model, will download at runtime"; \
    fi

# Criar script de entrada simplificado
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting ShopFlow Backend..."\n\
echo "📋 Environment: ${NODE_ENV:-production}"\n\
echo "🔧 Port: ${API_PORT:-3333}"\n\
\n\
# Verificar modelo YOLO\n\
if [ ! -f "yolo11n.pt" ]; then\n\
    echo "⚠️ Downloading YOLO model..."\n\
    wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt\n\
fi\n\
\n\
# Criar diretórios se necessário\n\
mkdir -p logs uploads temp face_embeddings cache\n\
\n\
echo "✅ Starting server..."\n\
exec "$@"' > /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Variáveis de ambiente padrão
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    API_HOST=0.0.0.0 \
    API_PORT=3333 \
    NODE_ENV=production \
    LOG_LEVEL=INFO \
    ENABLE_FACE_RECOGNITION=false

# Argumentos de build (para usar durante o build)
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_KEY
ARG JWT_SECRET
ARG BRIDGE_API_KEY
ARG GIT_SHA

# Salvar argumentos como ENV vars para runtime
ENV SUPABASE_URL=${SUPABASE_URL} \
    SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY} \
    SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY} \
    JWT_SECRET=${JWT_SECRET} \
    BRIDGE_API_KEY=${BRIDGE_API_KEY} \
    GIT_SHA=${GIT_SHA}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${API_PORT}/api/health || exit 1

# Expor porta
EXPOSE 3333

# Usar entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Comando padrão
CMD ["python", "main.py"]