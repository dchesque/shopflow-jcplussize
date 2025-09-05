# Multi-stage build para otimização - Compatível com Debian Trixie
FROM python:3.11-slim AS builder

# Instalar dependências de sistema para compilação
# Corrigido para Debian Trixie (testing)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    unzip \
    pkg-config \
    libgtk-3-dev \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    gfortran \
    openexr \
    python3-numpy \
    libtbbmalloc2 \
    libtbb-dev \
    libdc1394-dev \
    libopenblas-dev \
    liblapack-dev \
    libhdf5-dev \
    gcc \
    g++ \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar e ativar ambiente virtual
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Atualizar pip e instalar ferramentas de build
RUN pip install --upgrade pip setuptools wheel

# Copiar requirements e instalar dependências Python
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Stage de produção
FROM python:3.11-slim AS production

# Instalar apenas runtime dependencies
# Pacotes atualizados para Debian Trixie
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

# Configurar script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Variáveis de ambiente padrão (serão sobrescritas pelo EasyPanel)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    API_HOST=0.0.0.0 \
    API_PORT=3333 \
    NODE_ENV=production \
    LOG_LEVEL=INFO

# Argumentos de build (para usar durante o build se necessário)
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
ENTRYPOINT ["docker-entrypoint.sh"]

# Comando padrão
CMD ["python", "main.py"]