FROM python:3.11-slim

# Dependências sistema para OpenCV e YOLO11
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
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

# Copia requirements primeiro (cache Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baixa modelos YOLO11 durante build
RUN python -c "from ultralytics import YOLO; YOLO('yolo11n.pt'); YOLO('yolo11m.pt')"

# Baixa modelo DeepFace se necessário
RUN python -c "from deepface import DeepFace; DeepFace.build_model('Facenet512')" || true

# Copia aplicação
COPY . .

# Cria diretórios necessários
RUN mkdir -p /app/logs /app/temp /app/models /app/uploads /app/face_embeddings

# Cria usuário não-root
RUN useradd --create-home --shell /bin/bash shopflow && \
    chown -R shopflow:shopflow /app

USER shopflow

EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/api/health || exit 1

# Comando produção
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]