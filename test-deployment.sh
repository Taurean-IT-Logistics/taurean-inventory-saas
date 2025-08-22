#!/bin/bash

echo "🧪 Testing Docker Deployment Setup..."

# Check if required files exist
echo "📁 Checking required files..."
files=(
    "docker-compose.yml"
    ".env.example"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "nginx.conf"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    echo "📋 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Test docker-compose configuration
echo "🔧 Validating docker-compose configuration..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has errors"
    docker-compose config
    exit 1
fi

# Test building images (dry run)
echo "🏗️  Testing image builds..."
echo "Building backend image..."
if docker build -t facility-backend:test ./backend > /dev/null 2>&1; then
    echo "✅ Backend Docker image builds successfully"
    docker rmi facility-backend:test > /dev/null 2>&1
else
    echo "❌ Backend Docker image build failed"
    exit 1
fi

echo "Building frontend image..."
if docker build -t facility-frontend:test ./frontend > /dev/null 2>&1; then
    echo "✅ Frontend Docker image builds successfully"
    docker rmi facility-frontend:test > /dev/null 2>&1
else
    echo "❌ Frontend Docker image build failed"
    exit 1
fi

echo ""
echo "🎉 All deployment tests passed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: ./scripts/deploy.sh"
echo "3. Or run: docker-compose up -d"
echo ""
echo "🚀 Ready for deployment!"