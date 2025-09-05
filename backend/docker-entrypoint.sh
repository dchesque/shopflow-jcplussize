#!/bin/bash
set -e

# Logging
echo "🚀 Starting ShopFlow Backend..."
echo "📋 Environment: ${NODE_ENV:-development}"
echo "🔧 Port: ${API_PORT:-3333}"

# Verificar se o modelo YOLO existe
if [ ! -f "yolo11n.pt" ]; then
    echo "⚠️ YOLO model not found, downloading..."
    wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt || echo "❌ Failed to download YOLO model"
fi

# Criar diretórios se não existirem
mkdir -p logs uploads temp face_embeddings cache
chmod -R 777 logs uploads temp face_embeddings cache

# Limpar cache se solicitado
if [ "$CLEAR_CACHE_ON_STARTUP" = "true" ]; then
    echo "🧹 Clearing cache directories..."
    rm -rf cache/* temp/* || true
fi

# Configurações de performance baseadas no ambiente
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Production mode: optimizing for performance..."
    export WORKERS=${WORKERS:-1}
    export WORKER_CONNECTIONS=${WORKER_CONNECTIONS:-1000}
else
    echo "🔧 Development mode: optimizing for debugging..."
    export WORKERS=1
    export API_DEBUG=true
fi

# Log de configurações importantes (sem secrets)
echo "📋 Configuration:"
echo "   API Host: ${API_HOST:-0.0.0.0}"
echo "   API Port: ${API_PORT:-3333}"
echo "   Workers: ${WORKERS:-1}"
echo "   Environment: ${NODE_ENV:-development}"
echo "   Debug Mode: ${API_DEBUG:-false}"
echo "   YOLO Confidence: ${YOLO_CONFIDENCE:-0.6}"
echo "   Git SHA: ${GIT_SHA:-unknown}"

# Health check interno antes de iniciar
echo "🔍 Running pre-startup health check..."
python -c "
import sys
try:
    from core.config import settings
    print('✅ Configuration loaded')
    
    # Verificar módulos críticos
    import cv2
    print('✅ OpenCV loaded')
    
    from ultralytics import YOLO
    print('✅ YOLO loaded')
    
    from core.database import SupabaseManager
    print('✅ Database module loaded')
    
    from core.ai.smart_analytics_engine import SmartAnalyticsEngine
    print('✅ AI modules loaded')
    
    print('✅ Pre-startup health check passed')
except Exception as e:
    print(f'❌ Pre-startup health check failed: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Pre-startup health check failed! Exiting..."
    exit 1
fi

echo "✅ All checks passed, starting server..."
echo "=================================="

# Executar comando principal
exec "$@"