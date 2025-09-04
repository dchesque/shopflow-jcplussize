# Multi-stage build para otimização
FROM python:3.11-slim AS base

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    ffmpeg \
    curl \
    gcc \
    g++ \
    pkg-config \
    libhdf5-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-baixar modelo YOLO11 no stage base (onde wget está disponível)
RUN wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt -O yolo11n.pt

# Production stage
FROM python:3.11-slim AS production

# Instalar apenas dependências runtime necessárias (incluindo wget para o health check funcionar)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar dependências instaladas
COPY --from=base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=base /usr/local/bin /usr/local/bin

# Copiar modelo YOLO11 já baixado
COPY --from=base /app/yolo11n.pt ./yolo11n.pt

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários com permissões
RUN mkdir -p logs uploads temp && \
    chmod 755 logs uploads temp

# Criar usuário não-root
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app

# Mudar para usuário não-root
USER appuser

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    API_HOST=0.0.0.0 \
    API_PORT=8001 \
    LOG_LEVEL=INFO

# Health check (usando endpoint correto que existe)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Expor porta
EXPOSE 8001

# Comando de inicialização
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]