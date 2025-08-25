# Getting Started Guide

This guide will help you set up and run the Taurean Inventory Management System locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (v5 or higher)
- **Redis** (v6 or higher)
- **Git**

## Quick Start with Docker

The easiest way to get started is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd taurean-inventory-system

# Start all services with Docker Compose
./quick-start-docker.sh
```

This script will:
- Start MongoDB, Redis, and other dependencies
- Build and start the backend service
- Build and start the frontend service
- Set up the database with initial data

## Manual Setup

If you prefer to set up services manually, follow these steps:

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
MONGO_URI=mongodb://localhost:27017/taurean_inventory
REDIS_URL=redis://localhost:6379

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PASSWORD_TOKEN_SECRET=your_password_token_secret
EMAIL_TOKEN_SECRET=your_email_token_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com

# Frontend and Backend URLs
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:3001

# Paystack (for payments)
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Server
PORT=3001
NODE_ENV=development
```

```bash
# Start the backend
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
# Start the frontend
npm run dev
```

### 3. Database Setup

```bash
# Start MongoDB
mongod

# Start Redis
redis-server

# Seed the database (from backend directory)
cd backend
npm run seed
```

## System Architecture

The system consists of several key components:

### Backend Services
- **User Management**: Authentication, authorization, and user profiles
- **Company Management**: Multi-tenant company setup and management
- **Facility Management**: Facility booking and management system
- **Inventory Management**: Item tracking and management
- **Booking System**: Reservation and scheduling system
- **Payment Processing**: Integration with Paystack for payments
- **Email Service**: React Email templates for notifications
- **Super Admin**: System-wide administration and monitoring

### Frontend Applications
- **User Dashboard**: Customer-facing booking and management interface
- **Admin Dashboard**: Company-specific administration panel
- **Super Admin Dashboard**: System-wide administration interface
- **Public Pages**: Landing page, pricing, and information pages

## Key Features

### Multi-Tenant Architecture
- Each company has isolated data and users
- Role-based access control (User, Staff, Admin, Super Admin)
- Company-specific configurations and branding

### Facility Management
- Facility creation and management
- Availability scheduling and blocking
- Pricing and package management
- Image and description management

### Booking System
- Real-time availability checking
- Booking confirmation and reminders
- Payment processing integration
- Booking history and management

### Inventory Management
- Item tracking and categorization
- Maintenance scheduling
- Usage history and analytics
- Low stock alerts

### Email Notifications
- Welcome emails
- Booking confirmations
- Payment receipts
- System notifications
- Newsletter management

## API Documentation

The backend provides RESTful APIs for all functionality:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Companies**: `/api/companies/*`
- **Facilities**: `/api/facilities/*`
- **Bookings**: `/api/bookings/*`
- **Inventory**: `/api/inventory-items/*`
- **Transactions**: `/api/transaction/*`
- **Subscriptions**: `/api/subscriptions/*`
- **Super Admin**: `/api/super-admin/*`
- **Newsletter**: `/api/newsletter/*`

## Development Workflow

### Backend Development
```bash
cd backend

# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Development
```bash
cd frontend

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Management
```bash
# Access MongoDB shell
mongosh taurean_inventory

# View collections
show collections

# Query data
db.users.find().pretty()
```

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/taurean_inventory` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_BASE_URL` | Frontend application URL | `http://localhost:3000` |
| `BACKEND_BASE_URL` | Backend API URL | `http://localhost:3001` |

### Frontend (.env.local)
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env`
   - Verify MongoDB port (default: 27017)

2. **Redis Connection Failed**
   - Ensure Redis is running: `redis-server`
   - Check Redis URL in `.env`
   - Verify Redis port (default: 6379)

3. **Email Not Working**
   - Check email credentials in `.env`
   - Verify SMTP settings
   - Check if app password is required for Gmail

4. **Payment Integration Issues**
   - Verify Paystack API keys
   - Check webhook configuration
   - Ensure proper SSL in production

5. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify TypeScript configuration

### Logs and Debugging

```bash
# Backend logs
cd backend
npm run dev

# Frontend logs
cd frontend
npm run dev

# Database logs
tail -f /var/log/mongodb/mongod.log
tail -f /var/log/redis/redis-server.log
```

## Production Deployment

For production deployment:

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use strong, unique secrets
   - Configure production database URLs
   - Set up SSL certificates

2. **Database Security**
   - Enable authentication
   - Use connection pooling
   - Set up regular backups
   - Monitor performance

3. **Security Considerations**
   - Enable rate limiting
   - Set up CORS properly
   - Use HTTPS everywhere
   - Implement proper logging

4. **Monitoring**
   - Set up health checks
   - Monitor API performance
   - Track error rates
   - Set up alerts

## Support and Contributing

- **Issues**: Report bugs and feature requests via GitHub issues
- **Documentation**: Improve this guide and API documentation
- **Code**: Submit pull requests for improvements
- **Testing**: Help improve test coverage

## License

This project is licensed under the ISC License.

---

For more detailed information, see the [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md) files.