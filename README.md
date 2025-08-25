# Taurean IT Logistics - Facility Management Platform

A comprehensive SaaS facility management platform built with Next.js, Node.js, and MongoDB.

## Features

- 🏢 **Multi-tenant Architecture** - Complete company isolation
- 📊 **Comprehensive Dashboards** - User, Admin, and Super Admin dashboards
- 💳 **Payment Integration** - Paystack payment processing with callbacks
- 🧾 **Modern Invoice System** - Professional PDF generation with company branding
- 📱 **Real-time Updates** - Socket.io integration for live notifications
- 💬 **Chat System** - Built-in support ticket and messaging system
- 📈 **Analytics & Reporting** - Business insights and data export (CSV/Excel)
- 🔐 **Role-based Access Control** - Granular permissions system
- 🌍 **Multi-currency Support** - GHS, USD, EUR, GBP, NGN
- 📱 **Mobile Responsive** - Optimized for all devices

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd facility-management-platform
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

**Required Environment Variables:**

```env
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Paystack (Get from https://paystack.com/)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
```

### 3. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **API Documentation**: http://localhost:3001/api-docs

## Production Deployment

### With Nginx (Recommended)

```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d
```

### SSL Configuration

1. Place your SSL certificates in the `ssl/` directory:

   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. Uncomment the HTTPS server block in `nginx.conf`

3. Update your domain name in the nginx configuration

## Development Setup

If you prefer to run without Docker:

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Services

| Service  | Port   | Description                |
| -------- | ------ | -------------------------- |
| Frontend | 3000   | Next.js application        |
| Backend  | 3001   | Node.js API server         |
| MongoDB  | 27017  | Database                   |
| Redis    | 6379   | Caching & sessions         |
| Nginx    | 80/443 | Reverse proxy (production) |

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Database   │
│   (Next.js) │◄──►│  (Node.js)  │◄──►│ (MongoDB)   │
│    :3000    │    │    :3001    │    │   :27017    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Nginx    │    │    Redis    │    │   Socket.io │
│ (Proxy/SSL) │    │ (Cache/Pub) │    │ (Real-time) │
│  :80/:443   │    │    :6379    │    │   Embedded  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Key Features

### 🏢 Multi-Tenant SaaS

- Complete data isolation between companies
- Company-specific branding and settings
- Super admin oversight capabilities

### 💳 Payment Processing

- Paystack integration with webhooks
- Payment verification and callbacks
- Multi-currency support
- Automated receipt generation

### 🧾 Invoice System

- Professional PDF templates
- Company branding integration
- Tax calculation with schedules
- Automated numbering systems

### 📊 Analytics & Reporting

- Business performance metrics
- Revenue and booking analytics
- Data export (CSV/Excel)
- Real-time dashboard updates

### 💬 Communication

- Built-in chat system
- Support ticket management
- Real-time notifications
- File attachments

## API Documentation

Once running, visit http://localhost:3001/api-docs for complete API documentation.

## Environment Variables

| Variable              | Description           | Default             |
| --------------------- | --------------------- | ------------------- |
| `MONGO_ROOT_USERNAME` | MongoDB root username | admin               |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | password123         |
| `MONGO_DATABASE`      | Database name         | facility_management |
| `REDIS_PASSWORD`      | Redis password        | redis123            |
| `JWT_SECRET`          | JWT signing secret    | Required            |
| `JWT_REFRESH_SECRET`  | JWT refresh secret    | Required            |
| `PAYSTACK_SECRET_KEY` | Paystack secret key   | Required            |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key   | Required            |
| `EMAIL_HOST`          | SMTP host             | Optional            |
| `EMAIL_PORT`          | SMTP port             | 587                 |
| `EMAIL_USER`          | SMTP username         | Optional            |
| `EMAIL_PASS`          | SMTP password         | Optional            |

## Health Checks

The application includes health checks for all services:

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend health
curl http://localhost:3000/

# Check all services
docker-compose ps
```

## Scaling

For production scaling, consider:

1. **Database Scaling**: MongoDB replica sets or sharding
2. **Load Balancing**: Multiple backend instances behind nginx
3. **Caching**: Redis cluster for session management
4. **CDN**: Static asset delivery
5. **Monitoring**: Add Prometheus/Grafana for metrics

## Backup

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup

# Backup volumes
docker run --rm -v facility-management-platform_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 27017, 6379 are available
2. **Permission issues**: Check Docker daemon permissions
3. **Memory issues**: Ensure adequate RAM (minimum 4GB recommended)
4. **PDF generation issues**: Puppeteer requires additional dependencies (included in Docker)

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## Workflow Status

[![Build Status](https://img.shields.io/github/actions/workflow/status/theniitettey/taurean-inventory-saas/ci-cd.yml?branch=main&label=Build&style=flat-square)](https://github.com/theniitettey//taurean-inventory-saas/actions/workflows/ci-cd.yml)
[![Test Status](https://img.shields.io/github/actions/workflow/status/theniitettey/taurean-inventory-saas/pr-check.yml?branch=main&label=Tests&style=flat-square)](https://github.com/theniitettey/taurean-inventory-saas/actions/workflows/pr-check.yml)

## Support

For support and questions:

- Email: support@taureanitlogistics.com
- Documentation: [API Docs](http://localhost:3001/api-docs)

## License

Proprietary - All rights reserved to Taurean IT Logistics
