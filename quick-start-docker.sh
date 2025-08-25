#!/bin/bash

# Facility Management Platform - Docker Quick Start
# This script sets up and starts the entire platform using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "================================================="
    echo "   Facility Management Platform - Docker Setup"
    echo "================================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

setup_environment() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        
        print_warning "IMPORTANT: Please edit .env file with your configuration!"
        echo ""
        echo "Required configurations:"
        echo "1. JWT_SECRET - Generate a secure random string (32+ characters)"
        echo "2. PAYSTACK_SECRET_KEY - Your Paystack secret key"
        echo "3. PAYSTACK_PUBLIC_KEY - Your Paystack public key"
        echo "4. EMAIL_USER - Your email address for SMTP"
        echo "5. EMAIL_PASS - Your email password or app password"
        echo ""
        
        read -p "Press Enter to continue after editing .env file, or Ctrl+C to exit..."
    fi
    
    # Validate critical environment variables
    source .env
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-in-production" ]; then
        print_error "Please set a secure JWT_SECRET in .env file"
        echo "Generate one with: openssl rand -base64 32"
        exit 1
    fi
    
    if [ -z "$PAYSTACK_SECRET_KEY" ] || [[ "$PAYSTACK_SECRET_KEY" == *"your_paystack"* ]]; then
        print_error "Please set your PAYSTACK_SECRET_KEY in .env file"
        echo "Get your keys from: https://dashboard.paystack.com/#/settings/developer"
        exit 1
    fi
    
    print_success "Environment configuration validated"
}

start_services() {
    print_info "Starting Docker services..."
    
    # Pull latest base images
    print_info "Pulling base images..."
    docker-compose pull mongodb redis || print_warning "Could not pull some images (continuing...)"
    
    # Build application images
    print_info "Building application images..."
    docker-compose build --no-cache
    
    # Start all services
    print_info "Starting all services..."
    docker-compose up -d
    
    print_success "Services started successfully"
}

wait_for_services() {
    print_info "Waiting for services to be ready..."
    
    # Wait for backend to be healthy
    print_info "Checking backend health..."
    for i in {1..60}; do
        if curl -f http://localhost:3001/health &> /dev/null; then
            print_success "Backend is healthy"
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "Backend health check timeout"
            print_info "Checking backend logs..."
            docker-compose logs backend | tail -20
            exit 1
        fi
        sleep 2
        echo -n "."
    done
    
    # Wait for frontend to be ready
    print_info "Checking frontend health..."
    for i in {1..30}; do
        if curl -f http://localhost:3000/ &> /dev/null; then
            print_success "Frontend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend health check timeout"
            print_info "Checking frontend logs..."
            docker-compose logs frontend | tail -20
            exit 1
        fi
        sleep 2
        echo -n "."
    done
}

seed_database() {
    print_info "Setting up initial data..."
    
    # Wait a bit more for database to be fully ready
    sleep 10
    
    # Run database seeding
    print_info "Seeding database with initial admin user..."
    docker-compose exec backend npm run seed
    
    if [ $? -eq 0 ]; then
        print_success "Database seeding completed"
    else
        print_warning "Database seeding failed or already completed"
    fi
}

show_summary() {
    echo ""
    print_success "🎉 Platform deployment completed successfully!"
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend:     http://localhost:3000"
    echo "   Backend API:  http://localhost:3001"
    echo "   API Docs:     http://localhost:3001/api-docs"
    echo ""
    echo "🔐 Default Login (after seeding):"
    echo "   Email:    admin@taureanitlogistics.com"
    echo "   Password: admin123"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs:      docker-compose logs -f"
    echo "   Stop platform:  docker-compose down"
    echo "   Restart:        docker-compose restart"
    echo "   Update:         git pull && docker-compose up -d --build"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    print_success "Platform is ready for use! 🚀"
    echo ""
    echo "📖 For detailed documentation, see DEPLOYMENT.md"
}

# Main execution
main() {
    print_header
    check_prerequisites
    setup_environment
    start_services
    wait_for_services
    seed_database
    show_summary
}

# Handle script arguments
case "$1" in
    "dev")
        print_info "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d
        print_success "Development environment started!"
        ;;
    "prod")
        print_info "Starting production environment with Nginx..."
        docker-compose --profile production up -d
        print_success "Production environment started!"
        ;;
    "stop")
        print_info "Stopping all services..."
        docker-compose down
        print_success "All services stopped"
        ;;
    "restart")
        print_info "Restarting all services..."
        docker-compose restart
        print_success "All services restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        echo "📊 Service Status:"
        docker-compose ps
        echo ""
        echo "🏥 Health Checks:"
        curl -f http://localhost:3001/health && print_success "Backend healthy" || print_error "Backend unhealthy"
        curl -f http://localhost:3000/ &> /dev/null && print_success "Frontend healthy" || print_error "Frontend unhealthy"
        ;;
    "clean")
        print_warning "This will remove all containers and volumes. Data will be lost!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker system prune -f
            print_success "Cleanup completed"
        fi
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Start full platform"
        echo "  dev        Start development environment"
        echo "  prod       Start production environment"
        echo "  stop       Stop all services"
        echo "  restart    Restart all services"
        echo "  logs       View logs"
        echo "  status     Check service status"
        echo "  clean      Remove all data (destructive)"
        echo "  help       Show this help"
        ;;
    *)
        main
        ;;
esac