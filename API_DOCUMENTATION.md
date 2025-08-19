# 📚 API Documentation - Taurean IT Logistics Facility Management Platform

## 🌐 API Overview

The Taurean IT Logistics Facility Management Platform provides a comprehensive REST API for managing facilities, bookings, payments, and communications in a multi-tenant SaaS environment.

**Base URL**: `http://localhost:3001/api/v1`  
**Production URL**: `https://api.yourdomain.com/api/v1`  
**Interactive Documentation**: `http://localhost:3001/api-docs`

## 🔐 Authentication

### Bearer Token Authentication

Most endpoints require authentication using Bearer tokens in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting Access Tokens

**Login Endpoint:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

## 📧 Email System API

### Test Email Configuration
```bash
GET /api/v1/email/test-config
Authorization: Bearer <token>
```

### Send Test Email
```bash
POST /api/v1/email/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test email message"
}
```

### Send Invoice Email
```bash
POST /api/v1/email/invoice/{invoiceId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "attachPDF": true
}
```

### Send Bulk Email
```bash
POST /api/v1/email/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Important Announcement",
  "message": "This is an important message",
  "recipients": ["user1@example.com", "user2@example.com"]
}
```

### Email Settings Management
```bash
# Get email settings
GET /api/v1/email/settings/{companyId}
Authorization: Bearer <token>

# Update email settings
PUT /api/v1/email/settings/{companyId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailSettings": {
    "sendInvoiceEmails": true,
    "sendReceiptEmails": true,
    "sendBookingConfirmations": true,
    "sendBookingReminders": true,
    "customFromName": "Your Company",
    "emailSignature": "Best regards,\nYour Team"
  }
}
```

## 🧾 Invoice & Receipt API

### Download Invoice PDF
```bash
GET /api/v1/invoices/{invoiceId}/download
Authorization: Bearer <token>

# Response: PDF file download
```

### Download Receipt PDF
```bash
GET /api/v1/invoices/receipts/{receiptId}/download
Authorization: Bearer <token>

# Response: PDF file download
```

### Create Invoice
```bash
POST /api/v1/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "user_id_here",
  "currency": "GHS",
  "lines": [
    {
      "description": "Conference Room Booking",
      "quantity": 1,
      "unitPrice": 100.00,
      "duration": 4,
      "durationPeriod": "Hours"
    }
  ],
  "taxScheduleId": "tax_schedule_id_here"
}
```

### Pay Invoice
```bash
POST /api/v1/invoices/{invoiceId}/pay
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "card",
  "provider": "visa",
  "reference": "paystack_reference_here",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## 📊 Export API

### Export Transactions
```bash
# Export as CSV
GET /api/v1/transactions/export?format=csv&startDate=2024-01-01&endDate=2024-12-31&type=all
Authorization: Bearer <token>

# Export as Excel
GET /api/v1/transactions/export?format=excel&type=income
Authorization: Bearer <token>
```

### Export User Transactions
```bash
GET /api/v1/transactions/export/user?format=csv
Authorization: Bearer <token>
```

### Export Bookings
```bash
GET /api/v1/transactions/export/bookings?format=excel&startDate=2024-01-01
Authorization: Bearer <token>
```

### Export Invoices
```bash
GET /api/v1/transactions/export/invoices?format=csv
Authorization: Bearer <token>
```

## 💳 Payment Processing API

### Initialize Payment
```bash
POST /api/v1/transactions/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "customer@example.com",
  "amount": 1000,
  "facility": "facility_id_here",
  "description": "Facility booking payment",
  "category": "booking",
  "currency": "GHS"
}
```

### Verify Payment
```bash
GET /api/v1/transactions/verify/{reference}
Authorization: Bearer <token>
```

### Payment Webhook (No Auth Required)
```bash
POST /api/v1/transactions/webhook
Content-Type: application/json

# Paystack webhook payload
{
  "event": "charge.success",
  "data": { ... }
}
```

## 🏢 Company Management API

### Company Onboarding
```bash
POST /api/v1/companies/onboard
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data:
name: "Company Name"
contactEmail: "contact@company.com"
contactPhone: "+233 24 123 4567"
location: "Accra, Ghana"
currency: "GHS"
settlement_bank: "bank_code"
account_number: "1234567890"
file: <logo_file>
```

### Get Company Profile
```bash
GET /api/v1/companies/profile
Authorization: Bearer <token>
```

### Update Company Settings
```bash
PUT /api/v1/companies/{companyId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Company Name",
  "currency": "USD",
  "invoiceFormat": {
    "type": "prefix",
    "prefix": "INV-"
  }
}
```

## 📅 Booking Management API

### Create Booking
```bash
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "facility": "facility_id_here",
  "startDate": "2024-01-15T09:00:00Z",
  "endDate": "2024-01-15T17:00:00Z",
  "totalAmount": 800,
  "currency": "GHS"
}
```

### Check Availability
```bash
POST /api/v1/bookings/check-availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "facilityId": "facility_id_here",
  "startDate": "2024-01-15T09:00:00Z",
  "endDate": "2024-01-15T17:00:00Z"
}
```

### Get User Bookings
```bash
GET /api/v1/bookings/me
Authorization: Bearer <token>
```

### Get Company Bookings
```bash
GET /api/v1/bookings/company
Authorization: Bearer <token>
```

## 🏗️ Facility Management API

### Create Facility
```bash
POST /api/v1/facilities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Conference Room A",
  "description": "Large conference room with projector",
  "capacity": 20,
  "pricePerHour": 50,
  "currency": "GHS",
  "amenities": ["projector", "whiteboard", "wifi"],
  "availability": {
    "monday": { "start": "08:00", "end": "18:00" },
    "tuesday": { "start": "08:00", "end": "18:00" }
  }
}
```

### Get Company Facilities
```bash
GET /api/v1/facilities/company
Authorization: Bearer <token>
```

### Update Facility
```bash
PUT /api/v1/facilities/{facilityId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Conference Room A",
  "pricePerHour": 60
}
```

## 👥 User Management API

### Create User
```bash
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+233 24 123 4567",
  "role": "user"
}
```

### Get Company Users
```bash
GET /api/v1/users/company
Authorization: Bearer <token>
```

### Update User Role
```bash
PUT /api/v1/users/{userId}/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "staff"
}
```

## 🔧 Super Admin API

### Get System Statistics
```bash
GET /api/v1/super-admin/statistics
Authorization: Bearer <super-admin-token>
```

### Get All Companies
```bash
GET /api/v1/super-admin/companies
Authorization: Bearer <super-admin-token>
```

### Activate Company Subscription
```bash
POST /api/v1/super-admin/companies/{companyId}/subscription/activate
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "plan": "annual",
  "duration": 12
}
```

### Get All Users
```bash
GET /api/v1/super-admin/users
Authorization: Bearer <super-admin-token>
```

### Assign User to Company
```bash
POST /api/v1/super-admin/users/{userId}/assign-company
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "companyId": "company_id_here"
}
```

## 💰 Tax Management API

### Get Tax Schedules
```bash
GET /api/v1/tax-schedules
Authorization: Bearer <token>
```

### Create Tax Schedule (Super Admin Only)
```bash
POST /api/v1/tax-schedules
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "name": "Ghana Tax Schedule 2024",
  "components": [
    { "name": "NHIL", "rate": 0.025 },
    { "name": "GETFund", "rate": 0.025 },
    { "name": "VAT", "rate": 0.125 }
  ],
  "startDate": "2024-01-01T00:00:00Z",
  "sunsetDate": "2024-12-31T23:59:59Z",
  "taxOnTax": false
}
```

## 🔔 Notification API

### Get User Notifications
```bash
GET /api/v1/notifications/user
Authorization: Bearer <token>
```

### Mark Notification as Read
```bash
PATCH /api/v1/notifications/{notificationId}/read
Authorization: Bearer <token>
```

### Get Notification Preferences
```bash
GET /api/v1/notifications/preferences
Authorization: Bearer <token>
```

### Update Notification Preferences
```bash
PATCH /api/v1/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": true,
  "push": true,
  "sms": false,
  "bookingNotifications": true,
  "paymentNotifications": true
}
```

## 📦 Inventory Management API

### Create Inventory Item
```bash
POST /api/v1/inventory-items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Projector",
  "description": "HD Projector for presentations",
  "category": "equipment",
  "quantity": 5,
  "pricePerUnit": 25,
  "currency": "GHS"
}
```

### Get Company Inventory
```bash
GET /api/v1/inventory-items/company
Authorization: Bearer <token>
```

### Update Inventory Item
```bash
PUT /api/v1/inventory-items/{itemId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 10,
  "pricePerUnit": 30
}
```

## 🛒 Cart Management API

### Add to Cart
```bash
POST /api/v1/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "facility_or_item_id",
  "type": "facility",
  "quantity": 1
}
```

### Get Cart Items
```bash
GET /api/v1/cart
Authorization: Bearer <token>
```

### Checkout Cart
```bash
POST /api/v1/cart/checkout
Authorization: Bearer <token>
```

### Clear Cart
```bash
POST /api/v1/cart/clear
Authorization: Bearer <token>
```

## 💬 Support System API

### Create Support Ticket
```bash
POST /api/v1/support/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Payment Issue",
  "description": "Having trouble with payment processing",
  "priority": "high",
  "category": "payment"
}
```

### Get User Tickets
```bash
GET /api/v1/support/tickets/user
Authorization: Bearer <token>
```

### Send Message to Ticket
```bash
POST /api/v1/support/tickets/{ticketId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Thank you for your help",
  "senderType": "user"
}
```

## 📈 Analytics & Reporting API

### Get Cash Flow Summary
```bash
GET /api/v1/cashflow/summary
Authorization: Bearer <token>
```

### Get Cash Flow Anomalies
```bash
GET /api/v1/cashflow/anomalies
Authorization: Bearer <token>
```

### Get User Statistics
```bash
GET /api/v1/users/statistics
Authorization: Bearer <token>
```

## 🔄 Real-time Features (Socket.io)

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Event Listeners
```javascript
// Booking events
socket.on('BookingCreated', (data) => {
  console.log('New booking created:', data);
});

socket.on('BookingUpdated', (data) => {
  console.log('Booking updated:', data);
});

// Transaction events
socket.on('TransactionCreated', (data) => {
  console.log('New transaction:', data);
});

// Invoice events
socket.on('InvoiceCreated', (data) => {
  console.log('New invoice:', data);
});

socket.on('InvoicePaid', (data) => {
  console.log('Invoice paid:', data);
});
```

### Joining Rooms
```javascript
// Join company room for company-specific updates
socket.emit('join', `company:${companyId}`);

// Join ticket room for support chat
socket.emit('join-ticket', ticketId);
```

## 📊 Response Formats

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## 🔍 Query Parameters

### Common Query Parameters

**Pagination:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort field (e.g., "createdAt", "-updatedAt")

**Filtering:**
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `status` - Filter by status
- `type` - Filter by type
- `search` - Search term

**Export:**
- `format` - Export format ("csv" or "excel")

### Example with Query Parameters
```bash
GET /api/v1/transactions?page=1&limit=50&sort=-createdAt&type=income&startDate=2024-01-01
Authorization: Bearer <token>
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Validation Error - Input validation failed |
| 500 | Internal Server Error |

## 🔐 Permission Levels

### User Roles
- **user** - Basic user access to own data
- **staff** - Company staff with limited admin access
- **admin** - Company administrator with full company access
- **superAdmin** - Platform administrator with global access

### Required Permissions
- **viewInvoices** - View invoice data
- **manageTransactions** - Create/edit transactions
- **manageBookings** - Create/edit bookings
- **manageUsers** - User management
- **manageSettings** - Company settings
- **accessFinancials** - Financial data access

## 📱 Mobile API Considerations

### Headers for Mobile Apps
```bash
Content-Type: application/json
Authorization: Bearer <token>
User-Agent: YourApp/1.0.0 (iOS/Android)
Accept: application/json
```

### Optimized Endpoints for Mobile
```bash
# Lightweight user profile
GET /api/v1/auth/profile

# Mobile-optimized booking list
GET /api/v1/bookings/me?limit=10&fields=id,facility,startDate,status

# Quick facility search
GET /api/v1/facilities/search?q=conference&available=true
```

## 🧪 Testing the API

### Using cURL
```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | \
  jq -r '.data.tokens.accessToken')

# Use token for authenticated requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/facilities/company
```

### Using Postman
1. Import the OpenAPI spec from `/api-docs`
2. Set up environment variables for base URL and token
3. Use the pre-configured requests

### Using JavaScript/Node.js
```javascript
const API_BASE = 'http://localhost:3001/api/v1';
let token = null;

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  token = data.data.tokens.accessToken;
  return data;
}

// Make authenticated request
async function apiRequest(endpoint, options = {}) {
  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

// Example usage
await login('admin@example.com', 'admin123');
const facilities = await apiRequest('/facilities/company');
```

## 🔧 Development Tools

### API Testing Tools
- **Swagger UI**: http://localhost:3001/api-docs
- **Postman Collection**: Import from OpenAPI spec
- **Insomnia**: Import from OpenAPI spec

### Monitoring
- **Health Check**: `GET /health`
- **API Status**: `GET /api/v1/status`
- **Logs**: Check backend logs for detailed information

## 📋 Rate Limiting

### Default Limits
- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **File Upload**: 10 requests per minute
- **Email Sending**: 50 emails per hour

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🌐 CORS Configuration

### Allowed Origins
- `http://localhost:3000` (Development)
- `https://yourdomain.com` (Production)

### Allowed Methods
- GET, POST, PUT, DELETE, PATCH, OPTIONS

### Allowed Headers
- Authorization, Content-Type, Accept

---

## 🎯 Quick Start Examples

### Complete Booking Flow
```javascript
// 1. Login
const auth = await login('user@example.com', 'password');

// 2. Get available facilities
const facilities = await apiRequest('/facilities/company');

// 3. Check availability
const availability = await apiRequest('/bookings/check-availability', {
  method: 'POST',
  body: JSON.stringify({
    facilityId: 'facility_id',
    startDate: '2024-01-15T09:00:00Z',
    endDate: '2024-01-15T17:00:00Z'
  })
});

// 4. Create booking
const booking = await apiRequest('/bookings', {
  method: 'POST',
  body: JSON.stringify({
    facility: 'facility_id',
    startDate: '2024-01-15T09:00:00Z',
    endDate: '2024-01-15T17:00:00Z',
    totalAmount: 400
  })
});

// 5. Initialize payment
const payment = await apiRequest('/transactions/initialize', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    amount: 400,
    booking: booking.data._id,
    category: 'booking'
  })
});

// 6. Redirect to payment URL
window.location.href = payment.data.authorization_url;
```

### Company Onboarding Flow
```javascript
// 1. Register user
const user = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@company.com',
    password: 'secure123'
  })
});

// 2. Onboard company
const formData = new FormData();
formData.append('name', 'My Company');
formData.append('contactEmail', 'contact@company.com');
formData.append('location', 'Accra, Ghana');
formData.append('currency', 'GHS');

const company = await apiRequest('/companies/onboard', {
  method: 'POST',
  body: formData
});

// 3. Setup facilities and start operations
```

---

**📖 For complete API reference, visit the interactive documentation at `/api-docs` when the server is running.**