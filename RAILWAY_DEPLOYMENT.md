# Railway Deployment Guide

## 🚀 Deploy to Railway

### 1. Go to Railway Dashboard
- Visit [railway.app](https://railway.app)
- Sign in with GitHub account (digiunlocks)

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose `soccer-club` repository

### 3. Environment Variables
Set these in Railway dashboard:

#### Backend Variables:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soccer-club
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Frontend Variables:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### 4. Database Setup
- Add MongoDB service in Railway
- Or use MongoDB Atlas (recommended)

### 5. Build Configuration
Railway will auto-detect:
- Backend: Node.js app in `/backend`
- Frontend: React/Vite app in `/frontend`

### 6. Custom Domains
- Railway provides free subdomain
- Can add custom domain in settings

### 7. Environment Files
- Backend: Uses `backend/.env` for local development
- Production: Uses Railway environment variables

## 🔧 Local Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend  
cd frontend
npm install
npm run dev
```

## 📝 Notes
- Railway auto-detects Node.js projects
- Frontend builds automatically
- Backend serves on port 5000
- Frontend serves on port 3000 (development)
