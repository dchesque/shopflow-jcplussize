#!/bin/bash
set -e

# ShopFlow Backend Docker Entrypoint
# Otimizado para EasyPanel deployment

echo "🚀 Starting ShopFlow Backend with Smart AI Analytics..."

# Verificar variáveis de ambiente essenciais
required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_KEY" "API_PORT")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ ERROR: Required environment variable $var is not set"
        exit 1
    fi
done

# Aguardar banco de dados (se necessário)
if [ -n "$DATABASE_URL" ]; then
    echo "⏳ Waiting for database to be ready..."
    sleep 5
fi

# Executar migrações ou inicializações se necessário
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Running database migrations..."
    python -c "
import asyncio
from core.database import DatabaseManager
async def migrate():
    db = DatabaseManager()
    await db.initialize()
    print('✅ Database initialized')
asyncio.run(migrate())
" || echo "⚠️ Migration failed or not needed"
fi

# Testar módulos de IA se solicitado
if [ "$TEST_AI_ON_STARTUP" = "true" ]; then
    echo "🧪 Testing AI modules on startup..."
    python test_ai.py || echo "⚠️ AI tests failed but continuing..."
fi

# Verificar se modelos existem
if [ ! -f "yolo11n.pt" ]; then
    echo "⚠️ YOLO model not found, downloading..."
    wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt || echo "❌ Failed to download YOLO model"
fi

# Limpar cache se solicitado
if [ "$CLEAR_CACHE_ON_STARTUP" = "true" ]; then
    echo "🧹 Clearing cache directories..."
    rm -rf cache/* temp/* || true
fi

# Configurações de performance baseadas no ambiente
if [ "$ENVIRONMENT" = "production" ]; then
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
echo "   Port: $API_PORT"
echo "   Workers: ${WORKERS:-1}"
echo "   Environment: ${NODE_ENV:-development}"
echo "   Face Recognition: ${ENABLE_FACE_RECOGNITION:-true}"
echo "   Debug Mode: ${API_DEBUG:-false}"

# Health check interno antes de iniciar
echo "🔍 Running pre-startup health check..."
python -c "
import asyncio
from pathlib import Path

async def health_check():
    try:
        # Verificar módulos críticos
        from core.config import get_settings
        from core.ai.smart_analytics_engine import SmartAnalyticsEngine
        from core.ai.privacy_config import privacy_manager
        
        settings = get_settings()
        print('✅ Configuration loaded')
        
        # Verificar diretórios
        dirs = ['logs', 'uploads', 'temp', 'face_embeddings']
        for d in dirs:
            Path(d).mkdir(exist_ok=True)
        print('✅ Directories created')
        
        print('✅ Pre-startup health check passed')
        return True
        
    except Exception as e:
        print(f'❌ Pre-startup health check failed: {e}')
        return False

success = asyncio.run(health_check())
exit(0 if success else 1)
" || {
    echo "❌ Pre-startup health check failed!"
    exit 1
}

echo "✅ All checks passed, starting server..."

# Executar comando principal
exec "$@"