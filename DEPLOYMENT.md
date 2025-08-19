# 🚀 Deployment Guide - Taurean IT Logistics Facility Management Platform

This guide provides comprehensive instructions for deploying the platform in different environments.

## 📋 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Docker Deployment (Recommended)](#docker-deployment-recommended)
3. [Manual Deployment (Standalone)](#manual-deployment-standalone)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

## 🔧 Environment Variables

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-mongodb-password-here
MONGO_DATABASE=facility_management
MONGODB_URI=mongodb://admin:your-secure-mongodb-password-here@localhost:27017/facility_management?authSource=admin

# ============================================
# REDIS CONFIGURATION (For Sessions & Caching)
# ============================================
REDIS_PASSWORD=your-secure-redis-password-here
REDIS_URL=redis://:your-secure-redis-password-here@localhost:6379

# ============================================
# JWT SECRETS (CRITICAL - CHANGE IN PRODUCTION!)
# ============================================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long-change-in-production
ACCESS_TOKEN_SECRET=your-access-token-secret-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
PASSWORD_TOKEN_SECRET=your-password-token-secret-change-in-production
EMAIL_TOKEN_SECRET=your-email-token-secret-change-in-production

# ============================================
# PAYSTACK CONFIGURATION (Required for Payments)
# ============================================
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@yourcompany.com

# ============================================
# APPLICATION URLS
# ============================================
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here

# ============================================
# APPLICATION SETTINGS
# ============================================
PORT=3000
NODE_ENV=development
CONFIG_LEVEL=development
ENV=development
SALT_ROUNDS=12

# ============================================
# TOKEN EXPIRATION SETTINGS
# ============================================
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=30d
PASSWORD_TOKEN_EXPIRATION=1h
EMAIL_TOKEN_EXPIRATION=24h

# ============================================
# PLATFORM SETTINGS
# ============================================
PLATFORM_NAME=Taurean IT Logistics Platform
```

### 🔐 Security Configuration

**For Production, ensure you:**

1. **Generate Strong JWT Secrets:**
```bash
# Generate secure random strings (minimum 32 characters)
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
openssl rand -base64 32  # For ACCESS_TOKEN_SECRET
```

2. **Use Strong Database Passwords:**
```bash
# Generate secure database password
openssl rand -base64 16
```

3. **Configure Production URLs:**
```bash
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com/api/v1
```

## 🐳 Docker Deployment (Recommended)

### Prerequisites

- Docker and Docker Compose installed
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/theniitettey/taurean-inventory-saas.git
cd taurean-inventory-saas

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration
nano .env

# 3. Deploy with Docker Compose
docker-compose up -d

# 4. Check status
docker-compose ps
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js React application |
| Backend | 3001 | Node.js API server |
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache & sessions |
| Nginx | 80/443 | Reverse proxy (production) |

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Clean up (removes all data!)
docker-compose down -v
docker system prune -f

# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Production with Nginx SSL
docker-compose --profile production up -d
```

### Docker Environment Setup

Create `.env` file with Docker-specific settings:

```bash
# Docker MongoDB
MONGODB_URI=mongodb://admin:password123@mongodb:27017/facility_management?authSource=admin

# Docker Redis
REDIS_URL=redis://:redis123@redis:6379

# Docker URLs (internal network)
FRONTEND_URL=http://frontend:3000
BACKEND_URL=http://backend:3000
NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
```

## 🔧 Manual Deployment (Standalone)

### Prerequisites

- Node.js 18+ installed
- MongoDB 7.0+ installed and running
- Redis installed and running (optional but recommended)
- Git

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Build the application
npm run build

# 5. Seed initial data
npm run seed

# 6. Start the backend
npm start
# Or for development
npm run dev
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Build the application
npm run build

# 4. Start the frontend
npm start
# Or for development
npm run dev
```

### Database Setup (Manual)

#### MongoDB Installation

**Ubuntu/Debian:**
```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb/brew/mongodb-community
```

**Windows:**
```bash
# Download and install from https://www.mongodb.com/try/download/community
# Follow the installation wizard
```

#### Redis Installation (Optional)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

### Manual Environment Configuration

**Backend `.env` (backend/.env):**
```bash
# Database
MONGO_URI=mongodb://127.0.0.1:27017/facility_management

# JWT Secrets
ACCESS_TOKEN_SECRET=your-access-token-secret-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here
PASSWORD_TOKEN_SECRET=your-password-token-secret-here
EMAIL_TOKEN_SECRET=your-email-token-secret-here

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application
PORT=3000
NODE_ENV=production
CONFIG_LEVEL=production
ENV=production
SALT_ROUNDS=12

# Redis (if using)
REDIS_URL=redis://localhost:6379

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

**Frontend Environment (frontend/.env.local):**
```bash
NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
```

## 🌐 Production Deployment

### Option 1: Docker Production (Recommended)

```bash
# 1. Setup production environment
cp .env.example .env.production

# 2. Edit production settings
nano .env.production

# 3. Deploy with production profile
docker-compose --profile production up -d

# 4. Setup SSL certificates (place in ssl/ directory)
# ssl/cert.pem
# ssl/key.pem

# 5. Update nginx.conf with your domain
# Uncomment HTTPS server block
```

### Option 2: Manual Production

```bash
# 1. Setup production server (Ubuntu 20.04+)
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 for process management
sudo npm install -g pm2

# 4. Install and configure MongoDB (see manual setup above)

# 5. Install and configure Nginx
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. Clone and setup application
git clone https://github.com/theniitettey/taurean-inventory-saas.git
cd taurean-inventory-saas

# 7. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with production settings
npm run build
pm2 start dist/index.js --name "facility-backend"

# 8. Setup frontend
cd ../frontend
npm install
# Edit .env.local with production settings
npm run build
pm2 start npm --name "facility-frontend" -- start

# 9. Configure Nginx (copy nginx.conf to /etc/nginx/sites-available/)
sudo ln -s /etc/nginx/sites-available/facility-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 10. Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Production Environment Variables

```bash
# Production URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com/api/v1

# Production Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/facility_management?retryWrites=true&w=majority

# Production Redis (Redis Cloud recommended)
REDIS_URL=redis://username:password@redis-cloud-url:port

# Production Email (SendGrid, Mailgun, or SMTP)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key

# Security
NODE_ENV=production
JWT_SECRET=super-long-random-production-secret-64-characters-minimum
```

## 🔍 Service Health Checks

### Backend Health Check
```bash
curl http://localhost:3001/health
# Expected response: {"status":"healthy","timestamp":"...","service":"facility-management-backend"}
```

### Frontend Health Check
```bash
curl http://localhost:3000/
# Expected: HTML response with status 200
```

### Database Health Check
```bash
# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Redis
redis-cli ping
# Expected: PONG
```

### API Endpoints Test
```bash
# Test API availability
curl http://localhost:3001/api/v1/auth/health
curl http://localhost:3001/api-docs
```

## 📊 Monitoring & Logs

### Docker Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Manual Deployment Logs
```bash
# PM2 logs
pm2 logs facility-backend
pm2 logs facility-frontend

# System logs
sudo journalctl -u mongod
sudo journalctl -u nginx
```

### Log Locations
- **Backend Logs**: `backend/logs/`
- **MongoDB Logs**: `/var/log/mongodb/mongod.log`
- **Nginx Logs**: `/var/log/nginx/`

## 🚀 Quick Start Scripts

### Docker Quick Start
```bash
#!/bin/bash
# quick-start-docker.sh

echo "🚀 Starting Facility Management Platform with Docker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration!"
    echo "Required: JWT secrets, Paystack keys, email settings"
    exit 1
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🏥 Checking service health..."
curl -f http://localhost:3001/health && echo "✅ Backend healthy"
curl -f http://localhost:3000/ && echo "✅ Frontend healthy"

echo "🎉 Platform is ready!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "API Docs: http://localhost:3001/api-docs"
```

### Manual Quick Start
```bash
#!/bin/bash
# quick-start-manual.sh

echo "🚀 Starting Facility Management Platform Manually..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }
command -v mongod >/dev/null 2>&1 || { echo "❌ MongoDB not installed"; exit 1; }

# Start MongoDB
echo "🍃 Starting MongoDB..."
sudo systemctl start mongod || mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log

# Start Redis (if available)
echo "🔴 Starting Redis..."
redis-server --daemonize yes --requirepass redis123 || echo "⚠️  Redis not available (optional)"

# Setup Backend
echo "🔧 Setting up Backend..."
cd backend
npm install
npm run build
npm run seed
npm start &
BACKEND_PID=$!

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd ../frontend
npm install
npm run build
npm start &
FRONTEND_PID=$!

echo "✅ Services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"

# Save PIDs for cleanup
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

echo "To stop services: kill \$(cat backend.pid frontend.pid)"
```

## 🔧 Configuration Examples

### Gmail SMTP Configuration
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Setup Gmail App Password:**
1. Enable 2-factor authentication
2. Go to Google Account settings
3. Security → 2-Step Verification → App passwords
4. Generate app password for "Mail"

### SendGrid Configuration
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Mailgun Configuration
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

### Production Database (MongoDB Atlas)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/facility_management?retryWrites=true&w=majority
```

### Production Redis (Redis Cloud)
```bash
REDIS_URL=redis://username:password@redis-xxxxx.c1.us-east-1-2.ec2.cloud.redislabs.com:port
```

## 🌐 Nginx Configuration

### Development Proxy (nginx-dev.conf)
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Production SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

**2. Email Not Sending**
```bash
# Test email configuration
curl -X GET http://localhost:3001/api/v1/email/test-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check email credentials
# Verify SMTP settings
# Check firewall rules for SMTP ports
```

**3. Payment Issues**
```bash
# Verify Paystack keys
# Check webhook URL configuration
# Test payment endpoints
curl -X POST http://localhost:3001/api/v1/transaction/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email":"test@example.com","amount":1000}'
```

**4. Frontend Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

**5. Docker Issues**
```bash
# Check Docker service
sudo systemctl status docker

# Check container logs
docker-compose logs backend

# Restart containers
docker-compose restart

# Check resource usage
docker stats
```

### Performance Optimization

**Production Optimizations:**
```bash
# Backend
NODE_ENV=production
npm run build
pm2 start dist/index.js -i max  # Cluster mode

# Frontend
npm run build
# Use CDN for static assets
# Enable gzip compression in Nginx

# Database
# Use MongoDB replica sets
# Configure proper indexes
# Monitor query performance

# Redis
# Configure persistence
# Set appropriate memory limits
# Use Redis Cluster for scale
```

## 📈 Scaling Considerations

### Horizontal Scaling
```bash
# Multiple backend instances
pm2 start dist/index.js -i 4  # 4 instances

# Load balancer configuration
# Database replica sets
# Redis cluster
# CDN for static assets
```

### Monitoring Setup
```bash
# PM2 monitoring
pm2 install pm2-server-monit

# Application metrics
# Database monitoring
# Email delivery monitoring
# Payment processing monitoring
```

## 🎯 Quick Reference

### Essential Commands

**Docker:**
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose ps             # Check status
```

**Manual:**
```bash
npm run dev                   # Development mode
npm run build                 # Build for production
npm start                     # Production mode
npm run seed                  # Seed database
```

**Database:**
```bash
mongosh                       # MongoDB shell
redis-cli                     # Redis CLI
```

### Default Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Default Credentials

After seeding, use these credentials to access the platform:
- **Super Admin**: admin@taureanitlogistics.com / admin123
- **Test Company**: Create via onboarding flow

---

## 🎉 **Ready for Production!**

The platform is fully configured and ready for deployment. Choose your preferred method:

- **🐳 Docker (Recommended)**: One-command deployment with all services
- **🔧 Manual**: Full control over each component
- **☁️ Cloud**: Deploy to AWS, DigitalOcean, or similar

**All SOW requirements are implemented and the platform is enterprise-ready!**