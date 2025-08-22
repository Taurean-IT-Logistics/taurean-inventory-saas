# ⚡ Quick Setup Guide - Taurean IT Logistics Platform

Choose your preferred setup method:

## 🐳 Option 1: Docker Setup (Recommended - 5 minutes)

### Prerequisites
- Docker and Docker Compose installed

### Steps
```bash
# 1. Clone repository
git clone https://github.com/theniitettey/taurean-inventory-saas.git
cd taurean-inventory-saas

# 2. Setup environment
cp .env.example .env

# 3. Edit .env with your settings (REQUIRED)
nano .env
# Set: JWT_SECRET, PAYSTACK keys, EMAIL credentials

# 4. Start everything with one command
./quick-start-docker.sh

# That's it! 🎉
```

**Access URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

---

## 🔧 Option 2: Manual Setup (15 minutes)

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- Redis (optional but recommended)

### Backend Setup
```bash
# 1. Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org

# 2. Start MongoDB
sudo mkdir -p /data/db
sudo chown -R mongodb:mongodb /data/db
sudo -u mongodb mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log

# 3. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run build
npm run seed
npm start
```

### Frontend Setup
```bash
# In new terminal
cd frontend
npm install
npm run build
npm start
```

---

## 🚀 Production Setup (30 minutes)

### Quick Production Deployment
```bash
# 1. Setup production server (Ubuntu 20.04+)
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Clone and deploy
git clone https://github.com/theniitettey/taurean-inventory-saas.git
cd taurean-inventory-saas

# 4. Setup production environment
cp .env.example .env.production
# Edit with production settings

# 5. Deploy with SSL
docker-compose --profile production up -d

# 6. Setup domain and SSL
# Point your domain to server IP
# SSL certificates will be automatically handled
```

---

## ⚙️ Required Environment Variables

### Critical Settings (Must Change)
```bash
# Generate secure JWT secrets (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters

# Paystack payment keys (from dashboard.paystack.com)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# Email SMTP settings
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Optional Settings
```bash
# Database (auto-configured for Docker)
MONGODB_URI=mongodb://localhost:27017/facility_management

# Redis (optional but recommended)
REDIS_URL=redis://localhost:6379

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

---

## 🔑 Default Access

After setup, use these credentials:

**Super Admin:**
- Email: `admin@taureanitlogistics.com`
- Password: `admin123`

**Test Company Creation:**
- Use the onboarding flow at `/user/host`
- Complete company registration
- Access admin dashboard at `/admin`

---

## 🧪 Quick Test

### Test API Health
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy",...}
```

### Test Frontend
```bash
curl http://localhost:3000/
# Should return: HTML page
```

### Test Email (after SMTP setup)
```bash
curl -X GET http://localhost:3001/api/v1/email/test-config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod
# Or start manually
sudo -u mongodb mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log
```

**Port Already in Use:**
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill processes if needed
sudo kill -9 PID_NUMBER
```

**Email Not Working:**
```bash
# For Gmail, generate App Password:
# 1. Enable 2FA on your Google account
# 2. Go to Security > 2-Step Verification > App passwords
# 3. Generate password for "Mail"
# 4. Use this password in EMAIL_PASS
```

**Docker Issues:**
```bash
# Check Docker status
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check container logs
docker-compose logs backend
```

---

## 📞 Support

**Need Help?**
- 📧 Email: support@taureanitlogistics.com
- 📖 Full Documentation: See `DEPLOYMENT.md`
- 🐛 Issues: Create GitHub issue
- 💬 Chat: Use the built-in support system

---

## 🎯 Next Steps After Setup

1. **🏢 Create Your Company** - Use onboarding flow
2. **⚙️ Configure Settings** - Email, currency, branding
3. **🏗️ Add Facilities** - Create your facility listings
4. **👥 Invite Users** - Add team members
5. **💳 Setup Payments** - Configure Paystack
6. **📧 Test Emails** - Verify email delivery
7. **🚀 Go Live** - Start accepting bookings!

**🎉 Your platform is ready for business!**