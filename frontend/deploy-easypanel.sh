#!/bin/bash

# Deploy script for Easypanel
set -e

echo "🚀 Starting ShopFlow Frontend deployment to Easypanel..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: $2 is not set${NC}"
        exit 1
    fi
}

# Load environment variables from .env.production or .env.vps
if [ -f .env.vps ]; then
    echo -e "${GREEN}Loading environment from .env.vps${NC}"
    export $(cat .env.vps | grep -v '^#' | xargs)
elif [ -f .env.production ]; then
    echo -e "${GREEN}Loading environment from .env.production${NC}"
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}Warning: No .env.vps or .env.production file found${NC}"
fi

# Validate required environment variables
echo "Validating environment variables..."
check_env "$NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_URL"
check_env "$NEXT_PUBLIC_SUPABASE_ANON_KEY" "NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Optional: Set default values
DOMAIN=${DOMAIN:-"shopflow.yourdomain.com"}
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"https://api.shopflow.yourdomain.com"}

echo -e "${GREEN}Environment validated successfully${NC}"

# Build Docker image
echo "Building Docker image..."
docker build \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -t shopflow-frontend:latest \
    -t shopflow-frontend:$(date +%Y%m%d-%H%M%S) \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Optional: Push to registry if configured
if [ ! -z "$DOCKER_REGISTRY" ]; then
    echo "Pushing to Docker registry: $DOCKER_REGISTRY"
    docker tag shopflow-frontend:latest $DOCKER_REGISTRY/shopflow-frontend:latest
    docker push $DOCKER_REGISTRY/shopflow-frontend:latest
    echo -e "${GREEN}✅ Image pushed to registry${NC}"
fi

# Display deployment information
echo ""
echo "========================================="
echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo "========================================="
echo ""
echo "To deploy on Easypanel:"
echo "1. Push the image to your registry (if not done)"
echo "2. In Easypanel, create a new app or update existing"
echo "3. Use the following configuration:"
echo ""
echo "   Image: shopflow-frontend:latest"
echo "   Port: 3000"
echo "   Environment Variables:"
echo "     - NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_KEY]"
echo "     - NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "     - NODE_ENV=production"
echo ""
echo "   Domain: $DOMAIN"
echo ""
echo "========================================="

# Optional: Run locally for testing
read -p "Do you want to test the container locally? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting container locally on port 3000..."
    docker run -d \
        --name shopflow-frontend-test \
        -p 3000:3000 \
        -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
        -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
        -e NODE_ENV=production \
        shopflow-frontend:latest
    
    echo -e "${GREEN}Container started. Access at http://localhost:3000${NC}"
    echo "To stop: docker stop shopflow-frontend-test && docker rm shopflow-frontend-test"
fi