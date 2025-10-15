# Seattle Leopards FC - Soccer Club Management System

A comprehensive web application for managing a soccer club with player applications, team management, schedules, gallery, and administrative features.

## 🚀 Features

### Public Features
- **Home Page** with dynamic hero content and program search
- **About Page** with club information
- **Teams Page** displaying all club teams
- **Schedules Page** showing upcoming games and events
- **Gallery** with photo and video uploads
- **Contact Page** with club information
- **Application Forms** for Players, Coaches, Referees, and Volunteers
- **User Registration and Login**

### Admin Features
- **Dashboard** with statistics and quick access
- **Hero Content Management** (slideshow, images, videos)
- **Application Management** (view, approve, reject applications)
- **Program Management** (create, edit, delete programs)
- **Team Management** (create, edit, delete teams)
- **Schedule Management** (create, edit, delete schedules)
- **Gallery Management** (upload, manage media)
- **User Management** (manage user accounts)
- **Payment Management** (track donations and payments)
- **Site Settings** (maintenance mode, general settings)
- **News & Blog Management**

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Swiper** for slideshows
- **React Toastify** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate Limiting** for API protection
- **Compression** for performance

### Deployment
- **Docker** containerization
- **Nginx** reverse proxy
- **PM2** process manager

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **Docker** (optional, for containerized deployment)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd soccer-club
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment (.env)
Create `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/soccerclub
MONGO_URI_PROD=mongodb://your-production-mongodb-url

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CORS_ORIGIN_PROD=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10485760
```

#### Frontend Environment (.env)
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Seattle Leopards FC
```

### 4. Start MongoDB
```bash
# Start MongoDB locally
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Application

#### Development Mode
```bash
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

## 👑 Super Admin Access

### Default Admin Credentials
- **Email**: `admin@soccerclub.com`
- **Password**: `admin123`

### How to Access
1. Navigate to the application
2. Click "Sign In" in the navigation
3. Use the credentials above
4. You'll be redirected to the admin dashboard

### Admin Features Available
- **Hero Content Management**: Upload images/videos for the homepage
- **Application Management**: Review and manage all applications
- **Team Management**: Create and manage teams
- **Schedule Management**: Create and manage schedules
- **Gallery Management**: Upload and manage media
- **User Management**: Manage user accounts
- **Site Settings**: Configure maintenance mode and other settings

## 🐳 Docker Deployment

### 1. Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Individual Docker Commands
```bash
# Build backend image
docker build -t soccer-club-backend ./backend

# Build frontend image
docker build -t soccer-club-frontend ./frontend

# Run backend container
docker run -d -p 5000:5000 --name soccer-backend soccer-club-backend

# Run frontend container
docker run -d -p 80:80 --name soccer-frontend soccer-club-frontend
```

## 📁 Project Structure

```
soccer-club/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # File uploads
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── config/      # Configuration files
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app component
│   ├── public/          # Static assets
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Applications
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Submit new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Hero Content
- `GET /api/hero-content/public` - Get public hero content
- `POST /api/hero-content` - Upload hero content (admin)
- `PUT /api/hero-content/:id` - Update hero content (admin)

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team (admin)
- `PUT /api/teams/:id` - Update team (admin)

### Schedules
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Create schedule (admin)
- `PUT /api/schedules/:id` - Update schedule (admin)

### Gallery
- `GET /api/gallery` - Get gallery items
- `POST /api/gallery` - Upload media (admin)
- `DELETE /api/gallery/:id` - Delete media (admin)

## 🔒 Security Features

- **JWT Authentication** for secure API access
- **Password Hashing** with bcrypt
- **CORS Protection** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Helmet** for security headers
- **Input Validation** and sanitization
- **File Upload Restrictions** and validation

## 🚨 Troubleshooting

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

#### File Upload Issues
```bash
# Check upload directory permissions
ls -la backend/uploads/

# Create upload directory if missing
mkdir -p backend/uploads
chmod 755 backend/uploads
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

## 📞 Support

For technical support or questions:
- **Email**: support@soccerclub.com
- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

### Planned Features
- [ ] Email notifications for applications
- [ ] Payment integration (Stripe/PayPal)
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Newsletter subscription
- [ ] Advanced search and filtering

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added gallery and file upload features
- **v1.2.0** - Enhanced admin dashboard and user management
- **v1.3.0** - Added Docker support and deployment scripts

---

**Seattle Leopards FC** - Building champions on and off the field! ⚽ 