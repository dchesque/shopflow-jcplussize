#!/bin/bash

# Script para testar integração Frontend-Backend
echo "🔍 Testando Integração ShopFlow Frontend-Backend"
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# URLs
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

# Contador de testes
TESTS_PASSED=0
TESTS_FAILED=0

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local data=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "204" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
        ((TESTS_FAILED++))
    fi
}

# 1. Testar Backend Health
echo ""
echo "1️⃣ Backend Tests"
echo "-----------------"
test_endpoint "GET" "$BACKEND_URL/health" "Backend Health Check" ""
test_endpoint "GET" "$BACKEND_URL/api/employees/list" "List Employees" ""
test_endpoint "GET" "$BACKEND_URL/api/employees/list?search=john&status=active&page=1&limit=10" "List with Filters" ""

# 2. Testar Frontend Health
echo ""
echo "2️⃣ Frontend Tests"
echo "------------------"
test_endpoint "GET" "$FRONTEND_URL/api/health" "Frontend Health Check" ""

# 3. Testar CORS
echo ""
echo "3️⃣ CORS Tests"
echo "--------------"
echo -n "Testing: CORS headers... "
cors_test=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/employees/list" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" | grep -i "access-control-allow-origin")

if [ ! -z "$cors_test" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi

# 4. Testar Conectividade Frontend -> Backend
echo ""
echo "4️⃣ Integration Tests"
echo "---------------------"
echo -n "Testing: Frontend to Backend connectivity... "

# Criar um script Node.js temporário para testar
cat > /tmp/test-integration.js << 'EOF'
const http = require('http');

const testBackend = () => {
    return new Promise((resolve) => {
        http.get('http://localhost:8000/health', (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
};

testBackend().then(success => {
    process.exit(success ? 0 : 1);
});
EOF

if node /tmp/test-integration.js 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi

# 5. Verificar Variáveis de Ambiente
echo ""
echo "5️⃣ Environment Variables"
echo "-------------------------"

check_env_file() {
    local file=$1
    local var=$2
    
    if [ -f "$file" ]; then
        if grep -q "$var" "$file"; then
            echo -e "${GREEN}✓${NC} $var found in $file"
        else
            echo -e "${YELLOW}⚠${NC} $var not found in $file"
        fi
    else
        echo -e "${RED}✗${NC} $file not found"
    fi
}

echo "Frontend (.env.local):"
check_env_file "frontend/.env.local" "NEXT_PUBLIC_SUPABASE_URL"
check_env_file "frontend/.env.local" "NEXT_PUBLIC_API_URL"

echo ""
echo "Backend (.env):"
check_env_file "backend/.env" "SUPABASE_URL"
check_env_file "backend/.env" "API_PORT"

# Resumo
echo ""
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All integration tests passed!${NC}"
    echo "The frontend and backend are fully integrated."
else
    echo -e "\n${YELLOW}⚠️ Some tests failed.${NC}"
    echo "Please check the configuration and try again."
fi

# Cleanup
rm -f /tmp/test-integration.js

echo ""
echo "================================================"
echo "💡 Quick Start Commands:"
echo "================================================"
echo "Backend:  cd backend && python main.py"
echo "Frontend: cd frontend && npm run dev"
echo "Bridge:   cd bridge && npm start"
echo ""