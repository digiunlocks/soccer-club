#!/bin/bash

echo "⚽ Seattle Leopards FC - Deployment Script"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Create directories
echo "Setting up project structure..."
mkdir -p backend/uploads backend/logs

# Install dependencies
echo "Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment files
echo "Setting up environment configuration..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
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
    echo "✅ Created backend/.env file"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Seattle Leopards FC
EOF
    echo "✅ Created frontend/.env file"
fi

# Build frontend
echo "Building frontend for production..."
cd frontend
npm run build
cd ..

# Create startup scripts
echo "Creating startup scripts..."

cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "Starting Seattle Leopards FC in development mode..."

# Start backend
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Development servers started!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "Admin: admin@soccerclub.com / admin123"
echo ""
echo "Press Ctrl+C to stop all servers"

trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

cat > start-prod.sh << 'EOF'
#!/bin/bash
echo "Starting Seattle Leopards FC in production mode..."

# Install PM2 if not available
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start backend with PM2
echo "Starting backend with PM2..."
cd backend
pm2 start server.js --name "soccer-club-backend"

# Serve frontend
echo "Starting frontend server..."
cd ../frontend
pm2 serve dist 3000 --name "soccer-club-frontend"

echo "Production servers started!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Admin: admin@soccerclub.com / admin123"
EOF

chmod +x start-dev.sh start-prod.sh

echo ""
echo "✅ Deployment Complete! 🎉"
echo ""
echo "🚀 Quick Start:"
echo "   Development: ./start-dev.sh"
echo "   Production:  ./start-prod.sh"
echo ""
echo "👑 Admin Credentials:"
echo "   Email: admin@soccerclub.com"
echo "   Password: admin123"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:5173 (dev) or http://localhost:3000 (prod)"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Happy coding! ⚽" 