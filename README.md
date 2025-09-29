# 🏢 Taurean Inventory Management SaaS Platform

A comprehensive multi-tenant inventory management and facility booking platform built with Node.js, Next.js, and MongoDB. This platform enables companies to manage their facilities, inventory items, bookings, rentals, and financial transactions with advanced payment processing and real-time notifications.

## 🌟 Key Features

### 🏗️ Multi-Tenant Architecture

- **Company Isolation**: Each company has completely isolated data and users
- **Role-Based Access Control**: User, Staff, Admin, and Super Admin roles
- **Company-Specific Branding**: Custom logos, email templates, and configurations
- **Subscription Management**: Flexible pricing plans and usage tracking

### 🏢 Facility Management

- **Facility Creation & Management**: Complete facility lifecycle management
- **Availability Scheduling**: Real-time availability checking and blocking
- **Pricing & Packages**: Flexible pricing models and package management
- **Image & Media Management**: Upload and manage facility images
- **Location & Contact Management**: Detailed facility information

### 📦 Inventory Management

- **Item Management**: Complete inventory item lifecycle
- **Rental Tracking**: Track item rentals and returns
- **Maintenance Scheduling**: Automated maintenance reminders
- **Condition Monitoring**: Track item condition and damage fees
- **Category & Specification Management**: Flexible item categorization

### 📅 Booking & Rental System

- **Real-Time Booking**: Live availability checking and instant booking
- **Rental Management**: Complete rental lifecycle with return tracking
- **Check-in/Check-out**: Digital check-in and check-out process
- **Status Management**: Comprehensive status tracking and updates
- **Automated Reminders**: Email and in-app notification system

### 💳 Advanced Payment Processing

- **Multiple Payment Methods**: Paystack (online), Cash, Cheque, Mobile Money
- **Payment Timing Options**: Full, Advance, and Split payments
- **Payment Verification**: Automated verification for online payments
- **Transaction Reconciliation**: Manual reconciliation for offline payments
- **Payment Scheduling**: Automated payment reminders and tracking

### 🔔 Real-Time Notifications

- **WebSocket Integration**: Real-time updates and notifications
- **Email Notifications**: React Email templates with company branding
- **Automated Reminders**: Booking confirmations, payment due, maintenance alerts
- **Delivery Tracking**: Notification delivery status and retry mechanisms
- **Preference Management**: User notification preferences

### 📊 Financial Management

- **Transaction Tracking**: Complete financial transaction history
- **Invoice Generation**: Automated invoice creation with company branding
- **Tax Management**: Flexible tax configuration and calculation
- **Financial Reports**: Comprehensive reporting and analytics
- **Payout Processing**: Automated payout management

### 🤖 Automated Services

- **Cron Jobs**: Background task automation and scheduling
- **Payment Reminders**: Automated payment due notifications
- **Maintenance Alerts**: Scheduled maintenance reminders
- **Overdue Notifications**: Automated overdue item notifications
- **Email Retry Logic**: Robust email delivery with retry mechanisms

### 👥 User Management

- **Multi-Role System**: User, Staff, Admin, and Super Admin roles
- **Company Roles**: Customizable role-based permissions
- **User Profiles**: Complete user profile management
- **Loyalty System**: Customer loyalty tracking and rewards
- **Activity Tracking**: Comprehensive user activity monitoring

### 🔧 System Administration

- **Super Admin Panel**: System-wide management and monitoring
- **Company Management**: Company onboarding and management
- **User Management**: User account management and permissions
- **System Monitoring**: Health checks and performance monitoring
- **Analytics Dashboard**: Comprehensive system analytics

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taurean-inventory-saas
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```

4. **Configure your environment**
   - Update database connection strings
   - Configure email settings
   - Set up Paystack credentials
   - Configure JWT secrets

5. **Start the services**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Initial Setup

1. **Create Super Admin**
   - Register a new account
   - Access the super admin panel
   - Configure system settings

2. **Company Onboarding**
   - Visit `/user/host` for company onboarding
   - Complete company registration
   - Access admin dashboard at `/admin`

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • User Dashboard│    │ • REST API      │    │ • Collections   │
│ • Admin Panel   │    │ • WebSocket     │    │ • Indexes       │
│ • Super Admin   │    │ • Cron Jobs     │    │ • Aggregations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   Background    │    │   File Storage  │
│   Services      │    │   Services      │    │                 │
│                 │    │                 │    │                 │
│ • Paystack      │    │ • Email Queue   │    │ • Images        │
│ • SMTP Server   │    │ • Notifications │    │ • Documents     │
│ • Redis Cache   │    │ • Cron Jobs     │    │ • Exports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Taurean IT Platform                      │
├─────────────────────────────────────────────────────────────────┤
│  Super Admin Layer (System-wide Management)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ User Management │  │ Company Mgmt    │  │ System Monitor  │ │
│  │ Analytics       │  │ Subscription    │  │ Health Checks   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Company Layer (Isolated Tenant Data)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Company A       │  │ Company B       │  │ Company C       │ │
│  │ • Users         │  │ • Users         │  │ • Users         │ │
│  │ • Facilities    │  │ • Facilities    │  │ • Facilities    │ │
│  │ • Bookings      │  │ • Bookings      │  │ • Bookings      │ │
│  │ • Inventory     │  │ • Inventory     │  │ • Inventory     │ │
│  │ • Transactions  │  │ • Transactions  │  │ • Transactions  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Database Architecture

### Core Collections Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB Collections                       │
├─────────────────────────────────────────────────────────────────┤
│  User Management          │  Company Management                │
│  ┌─────────────────┐      │  ┌─────────────────┐                │
│  │ users           │      │  │ companies        │                │
│  │ companyroles    │      │  │ companyjoinreq   │                │
│  │ tokens          │      │  │ subscriptions    │                │
│  └─────────────────┘      │  └─────────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│  Facility Management       │  Inventory Management              │
│  ┌─────────────────┐      │  ┌─────────────────┐                │
│  │ facilities      │      │  │ inventoryitems  │                │
│  │ bookings        │      │  │ rentals          │                │
│  │ reviews         │      │  │ paymentschedules │                │
│  └─────────────────┘      │  └─────────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│  Financial Management      │  System Management                 │
│  ┌─────────────────┐      │  ┌─────────────────┐                │
│  │ transactions    │      │  │ notifications   │                │
│  │ pendingtransact │      │  │ notificationlogs │                │
│  │ invoices        │      │  │ supporttickets  │                │
│  │ taxes           │      │  │ systemalerts    │                │
│  │ payouts         │      │  └─────────────────┘                │
│  └─────────────────┘      │                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Environment Configuration

### Complete Environment Setup

#### Backend Environment (.env)
```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
MONGO_URI=mongodb://localhost:27017/taurean_inventory
REDIS_URL=redis://localhost:6379

# ===========================================
# JWT AUTHENTICATION SECRETS
# ===========================================
# Generate secure 32+ character secrets
ACCESS_TOKEN_SECRET=your_super_secure_access_token_secret_minimum_32_characters_long
REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_minimum_32_characters_long
PASSWORD_TOKEN_SECRET=your_super_secure_password_reset_token_secret_minimum_32_characters_long
EMAIL_TOKEN_SECRET=your_super_secure_email_verification_token_secret_minimum_32_characters_long

# ===========================================
# EMAIL CONFIGURATION (SMTP)
# ===========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false

# ===========================================
# PAYSTACK PAYMENT INTEGRATION
# ===========================================
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret_here

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=3001
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:3001

# ===========================================
# SUPER ADMIN CONFIGURATION
# ===========================================
SUPER_ADMIN_COMPANY_NAME=Taurean IT
SUPER_ADMIN_COMPANY_DESCRIPTION=Creator and operator of the Taurean Inventory SaaS platform
SUPER_ADMIN_COMPANY_LOCATION=Ghana
SUPER_ADMIN_COMPANY_EMAIL=admin@taureanitlogistics.com
SUPER_ADMIN_COMPANY_PHONE=+233000000000
SUPER_ADMIN_COMPANY_CURRENCY=GHS
SUPER_ADMIN_COMPANY_FEE_PERCENT=5
SUPER_ADMIN_INVOICE_PREFIX=TIL
SUPER_ADMIN_LICENSE_KEY_PREFIX=TAUREAN-IT

# ===========================================
# FILE UPLOAD CONFIGURATION
# ===========================================
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf

# ===========================================
# RATE LIMITING CONFIGURATION
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# ===========================================
# CRON JOB CONFIGURATION
# ===========================================
CRON_TIMEZONE=Africa/Accra
ENABLE_CRON_JOBS=true

# ===========================================
# NOTIFICATION CONFIGURATION
# ===========================================
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=5000
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=5000
```

#### Frontend Environment (.env.local)
```env
# ===========================================
# API CONFIGURATION
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001

# ===========================================
# PAYSTACK CONFIGURATION
# ===========================================
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_NAME=Taurean Inventory Management
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# FEATURE FLAGS
# ===========================================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true

# ===========================================
# EXTERNAL SERVICES
# ===========================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### System Core Functionalities

#### 🏢 Multi-Tenant Architecture
- **Company Isolation**: Each company operates independently with isolated data
- **Role-Based Access**: User, Staff, Admin, and Super Admin roles with granular permissions
- **Subscription Management**: Flexible pricing plans with usage tracking
- **Company Branding**: Custom logos, email templates, and configurations

#### 💳 Advanced Payment System
- **Multiple Payment Methods**: 
  - Paystack (Online payments)
  - Cash (Manual confirmation)
  - Cheque (Manual confirmation)
  - Mobile Money (Future integration)
- **Payment Timing Options**:
  - Full Payment (Immediate)
  - Advance Payment (Partial upfront)
  - Split Payment (Multiple installments)
- **Payment Verification**: Automated verification for online payments
- **Transaction Reconciliation**: Manual reconciliation for cash/cheque payments

#### 📅 Booking & Rental Management
- **Facility Bookings**: Real-time availability checking and booking
- **Inventory Rentals**: Item rental with return tracking
- **Check-in/Check-out**: Digital check-in and check-out process
- **Status Tracking**: Complete lifecycle management
- **Automated Reminders**: Email and in-app notifications

#### 🔔 Notification System
- **Real-Time Notifications**: WebSocket-based instant notifications
- **Email Notifications**: React Email templates with company branding
- **Automated Reminders**: Booking confirmations, payment due, maintenance alerts
- **Delivery Tracking**: Notification delivery status and retry mechanisms
- **Preference Management**: User notification preferences

#### 📊 Financial Management
- **Transaction Tracking**: Complete financial transaction history
- **Invoice Generation**: Automated invoice creation
- **Tax Management**: Flexible tax configuration
- **Financial Reports**: Comprehensive reporting and analytics
- **Payout Processing**: Automated payout management

#### 🤖 Automated Services
- **Cron Jobs**: Background task automation
- **Payment Reminders**: Automated payment due notifications
- **Maintenance Alerts**: Scheduled maintenance reminders
- **Overdue Notifications**: Automated overdue item notifications
- **Email Retry Logic**: Robust email delivery with retry mechanisms

### Database Collections Overview

#### Core Collections
- **users**: User accounts and profiles
- **companies**: Multi-tenant company data
- **companyroles**: Role-based permissions
- **facilities**: Facility management
- **bookings**: Booking reservations
- **inventoryitems**: Inventory management
- **rentals**: Item rental tracking
- **transactions**: Financial transactions
- **paymentschedules**: Payment scheduling
- **notifications**: Real-time notifications
- **notificationlogs**: Delivery tracking
- **supporttickets**: Customer support
- **systemalerts**: System monitoring

#### Key Relationships
- Users belong to Companies (Multi-tenant)
- Bookings link Users, Facilities, and Transactions
- Rentals link Users, Inventory Items, and Transactions
- Transactions track all financial activities
- Notifications provide real-time updates
- Payment Schedules manage installment payments

### Database Indexes

#### Performance Indexes
```javascript
// Users Collection
db.users.createIndex({ email: 1 });
db.users.createIndex({ username: 1 });
db.users.createIndex({ company: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isSuperAdmin: 1 });

// Companies Collection
db.companies.createIndex({ name: 1 });
db.companies.createIndex({ isActive: 1 });
db.companies.createIndex({ "subscription.status": 1 });

// Facilities Collection
db.facilities.createIndex({ company: 1 });
db.facilities.createIndex({ isActive: 1 });
db.facilities.createIndex({ "location.city": 1 });

// Bookings Collection
db.bookings.createIndex({ user: 1 });
db.bookings.createIndex({ facility: 1 });
db.bookings.createIndex({ company: 1 });
db.bookings.createIndex({ startDate: 1, endDate: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ paymentStatus: 1 });

// Transactions Collection
db.transactions.createIndex({ user: 1 });
db.transactions.createIndex({ company: 1 });
db.transactions.createIndex({ type: 1 });
db.transactions.createIndex({ category: 1 });
db.transactions.createIndex({ createdAt: -1 });
db.transactions.createIndex({ isReconciled: 1 });

// Notifications Collection
db.notifications.createIndex({ user: 1 });
db.notifications.createIndex({ company: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });
```

## 📁 Project Structure

```
taurean-inventory-saas/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # MongoDB models
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Express middlewares
│   │   ├── utils/           # Utility functions
│   │   ├── emails/          # Email templates
│   │   ├── realtime/        # Socket.io setup
│   │   └── scripts/         # Database scripts
│   └── package.json
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js app router
│   │   ├── admin/           # Admin dashboard
│   │   ├── user/            # User dashboard
│   │   ├── super-admin/     # Super admin panel
│   │   └── api/             # API routes
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utility libraries
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

### User Management
- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/roles` - Assign company role

### Company Management
- `GET /companies` - Get all companies (Super Admin)
- `POST /companies` - Create company
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company
- `POST /companies/:id/join-request` - Request to join company

### Facility Management
- `GET /facilities` - Get company facilities
- `POST /facilities` - Create facility
- `PUT /facilities/:id` - Update facility
- `DELETE /facilities/:id` - Delete facility
- `GET /facilities/:id/availability` - Check availability

### Booking Management
- `GET /bookings` - Get user bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking
- `POST /bookings/:id/check-in` - Check-in
- `POST /bookings/:id/check-out` - Check-out

### Inventory Management
- `GET /inventory` - Get company inventory
- `POST /inventory` - Add inventory item
- `PUT /inventory/:id` - Update inventory item
- `DELETE /inventory/:id` - Delete inventory item
- `GET /inventory/:id/rentals` - Get item rental history

### Rental Management
- `GET /rentals` - Get user rentals
- `POST /rentals` - Create rental
- `PUT /rentals/:id` - Update rental
- `POST /rentals/:id/return` - Return rental item

### Transaction Management
- `GET /transactions` - Get company transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `POST /transactions/:id/reconcile` - Reconcile transaction

### Payment Processing
- `POST /payments/paystack/initialize` - Initialize Paystack payment
- `POST /payments/paystack/verify` - Verify Paystack payment
- `POST /payments/schedule` - Create payment schedule
- `GET /payments/schedule` - Get payment schedules

### Notification System
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `POST /notifications/mark-all-read` - Mark all notifications as read

## 🛠️ Development

### Backend Development

```bash
# Install dependencies
cd backend
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Frontend Development

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Setup

```bash
# Start MongoDB
mongod

# Start Redis
redis-server

# Run database seeds (if available)
cd backend
npm run seed
```

## 🚀 Deployment

### Production Environment Variables

Ensure all environment variables are properly configured for production:

- Database connection strings
- JWT secrets (use strong, unique secrets)
- Email configuration
- Payment gateway credentials
- File storage configuration
- Logging configuration

### Build and Deploy

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build

# Start production servers
# Backend
cd backend && npm start

# Frontend
cd frontend && npm start
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- Multi-tenant architecture
- Advanced payment processing
- Real-time notifications
- Comprehensive booking and rental management
