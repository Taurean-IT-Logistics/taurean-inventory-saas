#!/bin/bash

# Deployment script for Facility Management Platform
set -e

echo "🚀 Starting deployment of Facility Management Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Dependencies check passed ✅"
}

# Check if .env file exists
check_env() {
    print_status "Checking environment configuration..."
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        print_warning "Required: JWT secrets, Paystack keys, and secure passwords."
        read -p "Press enter to continue after editing .env file..."
    fi
    
    # Check for required variables
    source .env
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production" ]; then
        print_error "Please set a secure JWT_SECRET in .env file"
        exit 1
    fi
    
    if [ -z "$PAYSTACK_SECRET_KEY" ] || [ "$PAYSTACK_SECRET_KEY" = "sk_test_your_paystack_secret_key" ]; then
        print_error "Please set your PAYSTACK_SECRET_KEY in .env file"
        exit 1
    fi
    
    print_status "Environment configuration check passed ✅"
}

# Build and start services
deploy() {
    print_status "Building and starting services..."
    
    # Pull latest images
    print_status "Pulling base images..."
    docker-compose pull mongodb redis
    
    # Build application images
    print_status "Building application images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Exit"; then
        print_error "Some services failed to start. Checking logs..."
        docker-compose logs
        exit 1
    fi
    
    # Check backend health
    for i in {1..30}; do
        if curl -f http://localhost:3001/health &> /dev/null; then
            print_status "Backend is healthy ✅"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend health check failed"
            docker-compose logs backend
            exit 1
        fi
        sleep 2
    done
    
    # Check frontend health
    for i in {1..30}; do
        if curl -f http://localhost:3000/ &> /dev/null; then
            print_status "Frontend is healthy ✅"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend health check failed"
            docker-compose logs frontend
            exit 1
        fi
        sleep 2
    done
}

# Setup initial data
setup_initial_data() {
    print_status "Setting up initial data..."
    
    # Wait a bit more for database to be fully ready
    sleep 10
    
    # Run database seeding
    print_status "Seeding database with initial data..."
    docker-compose exec backend npm run seed
    
    if [ $? -eq 0 ]; then
        print_status "Database seeding completed ✅"
    else
        print_warning "Database seeding failed or already completed"
    fi
}

# Show deployment info
show_info() {
    print_status "🎉 Deployment completed successfully!"
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:3001"
    echo "   API Docs:  http://localhost:3001/api-docs"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs:     docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart:       docker-compose restart"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    print_status "Ready for use! 🚀"
}

# Main deployment flow
main() {
    echo "================================================="
    echo "   Facility Management Platform Deployment"
    echo "================================================="
    echo ""
    
    check_dependencies
    check_env
    deploy
    setup_initial_data
    show_info
}

# Handle script arguments
case "$1" in
    "dev")
        print_status "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    "prod")
        print_status "Starting production environment with Nginx..."
        docker-compose --profile production up -d
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose restart
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        print_warning "This will remove all containers and volumes. Data will be lost!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker system prune -f
            print_status "Cleanup completed"
        fi
        ;;
    *)
        main
        ;;
esac