@echo off
echo 🌤️ Starting Weather App Development Servers...
echo.

echo This will start both backend and frontend servers.
echo Make sure you have:
echo 1. Installed dependencies (run setup-backend.bat and setup-frontend.bat first)
echo 2. Added your OpenWeatherMap API key to backend/.env
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo 🚀 Starting backend server...
start "Weather App Backend" cmd /k "cd backend && npm run dev"

echo.
echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Starting frontend server...
start "Weather App Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo The frontend should automatically open in your browser.
echo.
pause
