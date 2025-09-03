# ShopFlow Backend - Dockerfile para Easypanel
FROM python:3.10-slim

# Variáveis de ambiente para Python
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependências do sistema necessárias para OpenCV e AI
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    wget \
    curl \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN useradd --create-home --shell /bin/bash shopflow
WORKDIR /app

# Copiar requirements primeiro para cache eficiente
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/logs /app/face_embeddings /app/models

# Copiar código da aplicação
COPY . .

# Alterar proprietário dos arquivos
RUN chown -R shopflow:shopflow /app

# Mudar para usuário não-root
USER shopflow

# Download do modelo YOLO11 na build
RUN python -c "from ultralytics import YOLO; YOLO('yolo11n.pt')"

# Expor porta
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Comando de inicialização
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]