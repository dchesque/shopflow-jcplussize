FROM python:3.11-slim

# Dependências sistema para OpenCV e YOLO11
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    ffmpeg \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia requirements primeiro para cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download modelo YOLO11
RUN wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt -O yolo11n.pt

# Copia código
COPY . .

# Cria diretórios necessários
RUN mkdir -p logs uploads temp

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV API_HOST=0.0.0.0
ENV API_PORT=8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

EXPOSE 8001

CMD ["python", "main.py"]