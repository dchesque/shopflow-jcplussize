# Multi-stage build para otimização
FROM python:3.11-slim as builder

# Instalar dependências de sistema para compilação
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

# Atualizar pip
RUN pip install --upgrade pip setuptools wheel

# Copiar requirements
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Stage de produção
FROM python:3.11-slim as production

# Instalar apenas runtime dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgfortran5 \
    libopenblas0 \
    liblapack3 \
    libjpeg62-turbo \
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

# Criar diretórios necessários
RUN mkdir -p logs uploads temp face_embeddings cache && \
    chmod -R 777 logs uploads temp face_embeddings cache

# Copiar código da aplicação
COPY . /app/

# Download do modelo YOLO se não existir
RUN if [ ! -f "yolo11n.pt" ]; then \
    wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt || \
    echo "Warning: Failed to download YOLO model"; \
    fi

# Variáveis de ambiente (serão sobrescritas pelo EasyPanel)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    API_HOST=0.0.0.0 \
    API_PORT=3333 \
    NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${API_PORT}/api/health || exit 1

# Expor porta
EXPOSE 3333

# Comando de inicialização
CMD ["python", "main.py"]