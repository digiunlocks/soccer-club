@echo off
echo ⚽ Seattle Leopards FC - Deployment Script
echo ==========================================

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm --version

REM Create directories
echo Setting up project structure...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\logs" mkdir backend\logs

REM Install dependencies
echo Installing dependencies...

echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Create environment files
echo Setting up environment configuration...

REM Backend .env
if not exist "backend\.env" (
    echo PORT=5000> backend\.env
    echo NODE_ENV=development>> backend\.env
    echo MONGO_URI=mongodb://localhost:27017/soccerclub>> backend\.env
    echo MONGO_URI_PROD=mongodb://localhost:27017/soccerclub>> backend\.env
    echo JWT_SECRET=soccer-club-super-secret-jwt-key-2024>> backend\.env
    echo JWT_EXPIRE=7d>> backend\.env
    echo CORS_ORIGIN=http://localhost:5173>> backend\.env
    echo CORS_ORIGIN_PROD=http://localhost:5173>> backend\.env
    echo RATE_LIMIT_WINDOW=15>> backend\.env
    echo RATE_LIMIT_MAX=100>> backend\.env
    echo MAX_FILE_SIZE=10485760>> backend\.env
    echo ✅ Created backend\.env file
)

REM Frontend .env
if not exist "frontend\.env" (
    echo VITE_API_URL=http://localhost:5000/api> frontend\.env
    echo VITE_APP_NAME=Seattle Leopards FC>> frontend\.env
    echo ✅ Created frontend\.env file
)

REM Build frontend
echo Building frontend for production...
cd frontend
call npm run build
cd ..

REM Create startup scripts
echo Creating startup scripts...

REM Development startup script
echo @echo off > start-dev.bat
echo echo Starting Seattle Leopards FC in development mode... >> start-dev.bat
echo. >> start-dev.bat
echo echo Starting backend server... >> start-dev.bat
echo cd backend >> start-dev.bat
echo start "Backend Server" npm start >> start-dev.bat
echo cd .. >> start-dev.bat
echo. >> start-dev.bat
echo echo Starting frontend development server... >> start-dev.bat
echo cd frontend >> start-dev.bat
echo start "Frontend Server" npm run dev >> start-dev.bat
echo cd .. >> start-dev.bat
echo. >> start-dev.bat
echo echo Development servers started! >> start-dev.bat
echo echo Backend: http://localhost:5000 >> start-dev.bat
echo echo Frontend: http://localhost:5173 >> start-dev.bat
echo echo Admin: admin@soccerclub.com / admin123 >> start-dev.bat
echo echo. >> start-dev.bat
echo echo Press any key to stop servers... >> start-dev.bat
echo pause >> start-dev.bat

REM Production startup script
echo @echo off > start-prod.bat
echo echo Starting Seattle Leopards FC in production mode... >> start-prod.bat
echo. >> start-prod.bat
echo echo Installing PM2 globally... >> start-prod.bat
echo call npm install -g pm2 >> start-prod.bat
echo. >> start-prod.bat
echo echo Starting backend with PM2... >> start-prod.bat
echo cd backend >> start-prod.bat
echo call pm2 start server.js --name "soccer-club-backend" >> start-prod.bat
echo cd .. >> start-prod.bat
echo. >> start-prod.bat
echo echo Starting frontend server... >> start-prod.bat
echo cd frontend >> start-prod.bat
echo call pm2 serve dist 3000 --name "soccer-club-frontend" >> start-prod.bat
echo cd .. >> start-prod.bat
echo. >> start-prod.bat
echo echo Production servers started! >> start-prod.bat
echo echo Backend: http://localhost:5000 >> start-prod.bat
echo echo Frontend: http://localhost:3000 >> start-prod.bat
echo echo Admin: admin@soccerclub.com / admin123 >> start-prod.bat
echo echo. >> start-prod.bat
echo echo Use 'pm2 status' to check server status >> start-prod.bat
echo echo Use 'pm2 logs' to view logs >> start-prod.bat
echo echo Use 'pm2 stop all' to stop all servers >> start-prod.bat
echo pause >> start-prod.bat

echo.
echo ✅ Deployment Complete! 🎉
echo.
echo 🚀 Quick Start:
echo    Development: start-dev.bat
echo    Production:  start-prod.bat
echo.
echo 👑 Admin Credentials:
echo    Email: admin@soccerclub.com
echo    Password: admin123
echo.
echo 📱 Application URLs:
echo    Frontend: http://localhost:5173 (dev) or http://localhost:3000 (prod)
echo    Backend:  http://localhost:5000
echo.
echo Happy coding! ⚽
pause 