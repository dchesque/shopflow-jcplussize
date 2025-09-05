# Multi-stage build otimizado com dlib pré-compilado
FROM python:3.11-slim AS builder

# Instalar dependências necessárias incluindo cmake atualizado
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    wget \
    pkg-config \
    gcc \
    g++ \
    # Dependências específicas para dlib
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar CMake mais recente manualmente (para resolver o problema do dlib)
RUN wget -q https://github.com/Kitware/CMake/releases/download/v3.28.0/cmake-3.28.0-linux-x86_64.tar.gz && \
    tar -xzf cmake-3.28.0-linux-x86_64.tar.gz && \
    cp -r cmake-3.28.0-linux-x86_64/bin/* /usr/local/bin/ && \
    cp -r cmake-3.28.0-linux-x86_64/share/* /usr/local/share/ && \
    rm -rf cmake-3.28.0-linux-x86_64*

# Criar e ativar ambiente virtual
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Atualizar pip e instalar ferramentas de build
RUN pip install --upgrade pip setuptools wheel

# Instalar dlib usando wheel pré-compilado (muito mais rápido!)
RUN pip install --no-cache-dir \
    dlib-bin \
    face_recognition \
    face-recognition-models

# Copiar requirements e instalar outras dependências
COPY requirements.txt /tmp/
# Remover dlib/face_recognition do requirements pois já instalamos
RUN grep -v "dlib\|face_recognition\|face-recognition" /tmp/requirements.txt > /tmp/requirements_clean.txt || cp /tmp/requirements.txt /tmp/requirements_clean.txt
RUN pip install --no-cache-dir -r /tmp/requirements_clean.txt

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
    libx11-6 \
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

# Criar diretórios necessários
RUN mkdir -p logs uploads temp face_embeddings cache && \
    chmod -R 777 logs uploads temp face_embeddings cache

# Copiar código da aplicação
COPY . /app/

# Download do modelo YOLO
RUN wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt || echo "YOLO will be downloaded at runtime"

# Criar script de entrada
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
# Verificar face_recognition\n\
python -c "import face_recognition; print(\"✅ Face recognition disponível\")" || echo "⚠️ Face recognition não disponível"\n\
\n\
echo "✅ Starting server..."\n\
exec "$@"' > /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    API_HOST=0.0.0.0 \
    API_PORT=3333 \
    NODE_ENV=production \
    LOG_LEVEL=INFO

# Argumentos de build
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_KEY
ARG JWT_SECRET
ARG BRIDGE_API_KEY
ARG GIT_SHA

# Converter ARGs em ENVs
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

# Entrypoint e comando
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["python", "main.py"]