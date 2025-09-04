# Multi-stage build para EasyPanel com AI otimizado
FROM python:3.11-slim AS builder

# Instalar dependências de sistema completas para compilação
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
    libatlas-base-dev \
    python3-numpy \
    libtbb2 \
    libtbb-dev \
    libdc1394-22-dev \
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

# Instalar dlib primeiro (necessário para face recognition)
RUN pip install --no-cache-dir dlib

WORKDIR /app

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-baixar modelos necessários
RUN wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt -O yolo11n.pt

# Stage de produção otimizado
FROM python:3.11-slim AS production

LABEL maintainer="ShopFlow Team"
LABEL description="ShopFlow Backend with Smart AI Analytics"
LABEL version="2.0.0"

# Instalar apenas dependências runtime essenciais
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgfortran5 \
    libatlas-base-dev \
    libopenblas-dev \
    liblapack-dev \
    libjpeg62-turbo \
    libpng16-16 \
    libtiff5 \
    curl \
    wget \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Copiar bibliotecas compiladas (incluindo dlib)
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar modelo YOLO já baixado
COPY --from=builder /app/yolo11n.pt ./yolo11n.pt

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários para AI
RUN mkdir -p logs uploads temp face_embeddings models cache && \
    chmod -R 755 logs uploads temp face_embeddings models cache

# Criar usuário não-root para segurança
RUN groupadd -r shopflow && useradd -r -g shopflow shopflow && \
    chown -R shopflow:shopflow /app

# Mudar para usuário não-root
USER shopflow

# Variáveis de ambiente otimizadas para EasyPanel
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    NODE_ENV=production \
    API_HOST=0.0.0.0 \
    API_PORT=3333 \
    API_DEBUG=false \
    LOG_LEVEL=INFO

# Configurações de performance para AI
ENV OMP_NUM_THREADS=2 \
    OPENBLAS_NUM_THREADS=2 \
    MKL_NUM_THREADS=2 \
    WORKERS=1 \
    WORKER_TIMEOUT=120

# Health check para EasyPanel
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3333/api/health || exit 1

# Expor porta EasyPanel
EXPOSE 3333

# Comando otimizado para produção
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3333", "--workers", "1", "--access-log", "--proxy-headers"]