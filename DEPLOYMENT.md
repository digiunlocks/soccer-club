# 🚀 Seattle Leopards FC - Deployment Guide

This guide provides step-by-step instructions for deploying the Seattle Leopards FC soccer club application.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (v5 or higher)
- **Git** (for cloning the repository)
- **Docker** (optional, for containerized deployment)

## 🎯 Quick Start Options

### Option 1: Automated Deployment (Recommended)

#### Linux/Mac
```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

#### Windows
```cmd
# Run the deployment script
deploy.bat
```

### Option 2: Manual Deployment

#### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd soccer-club

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### Step 2: Environment Configuration

**Backend (.env)**
```bash
cd backend
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/soccerclub
MONGO_URI_PROD=mongodb://localhost:27017/soccerclub
JWT_SECRET=soccer-club-super-secret-jwt-key-2024
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
CORS_ORIGIN_PROD=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10485760
EOF
cd ..
```

**Frontend (.env)**
```bash
cd frontend
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Seattle Leopards FC
EOF
cd ..
```

#### Step 3: Start MongoDB
```bash
# Start MongoDB locally
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Step 4: Start the Application

**Development Mode:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Production Mode:**
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name "soccer-club-backend"
cd ..

# Serve frontend with PM2
cd frontend
pm2 serve dist 3000 --name "soccer-club-frontend"
cd ..
```

### Option 3: Docker Deployment

#### Step 1: Build and Start with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Step 2: Individual Docker Commands
```bash
# Build backend image
docker build -t soccer-club-backend ./backend

# Build frontend image
docker build -t soccer-club-frontend ./frontend

# Run MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Run backend container
docker run -d -p 5000:5000 --name soccer-backend soccer-club-backend

# Run frontend container
docker run -d -p 3000:80 --name soccer-frontend soccer-club-frontend
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/soccerclub` |
| `JWT_SECRET` | JWT signing secret | `soccer-club-super-secret-jwt-key-2024` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `MAX_FILE_SIZE` | Max file upload size (bytes) | `10485760` |

#### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Application name | `Seattle Leopards FC` |

## 👑 Admin Access

### Default Credentials
- **Email**: `admin@soccerclub.com`
- **Password**: `admin123`

### How to Access
1. Navigate to the application
2. Click "Sign In" in the navigation
3. Use the credentials above
4. You'll be redirected to the admin dashboard

## 📊 Health Checks

### Application Health
```bash
# Backend health check
curl http://localhost:5000/health

# Frontend health check (Docker)
curl http://localhost:3000/health

# Expected response: {"status":"OK","timestamp":"...","uptime":...}
```

### Service Status
```bash
# PM2 status (if using PM2)
pm2 status

# Docker status (if using Docker)
docker-compose ps

# MongoDB status
mongo --eval "db.runCommand('ping')"
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if MongoDB is running
mongod --version

# Check if port 5000 is available
netstat -an | grep 5000

# Check environment variables
cat backend/.env
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for missing dependencies
npm audit
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongo --eval "db.runCommand('ping')"

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

#### Docker Issues
```bash
# Check Docker logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Clean up Docker
docker system prune -f
```

### Performance Optimization

#### Backend
- Enable compression middleware
- Implement caching for static content
- Use database indexing for queries
- Monitor memory usage with PM2

#### Frontend
- Optimize images and assets
- Enable code splitting
- Use lazy loading for components
- Implement service worker for caching

## 🔒 Security Considerations

### Production Deployment
1. **Change default passwords** - Update admin credentials
2. **Use strong JWT secrets** - Generate a secure random string
3. **Enable HTTPS** - Use SSL certificates
4. **Configure CORS properly** - Set specific origins
5. **Set up firewall rules** - Restrict access to necessary ports
6. **Regular updates** - Keep dependencies updated
7. **Database security** - Use authentication and encryption
8. **File upload restrictions** - Validate file types and sizes

### Environment Variables for Production
```bash
# Backend production .env
NODE_ENV=production
MONGO_URI=mongodb://username:password@your-mongodb-url/soccerclub
JWT_SECRET=your-super-secure-jwt-secret-here
CORS_ORIGIN=https://yourdomain.com
```

## 📈 Monitoring

### PM2 Monitoring (Production)
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all
```

### Docker Monitoring
```bash
# View container stats
docker stats

# View logs
docker-compose logs -f

# Monitor resource usage
docker system df
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Rebuild frontend
cd frontend && npm run build && cd ..

# Restart services
pm2 restart all
# or
docker-compose down && docker-compose up -d --build
```

### Database Backup
```bash
# Create backup
mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Restore backup
mongorestore /backup/backup-folder
```

## 📞 Support

For technical support or questions:
- **Email**: support@soccerclub.com
- **Documentation**: Check the README.md file
- **Issues**: Create an issue in the repository

---

**Seattle Leopards FC** - Building champions on and off the field! ⚽ 