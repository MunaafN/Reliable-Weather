@echo off
echo 🔍 Diagnosing Backend Issues...
echo.

cd backend

echo 📋 Checking environment configuration...
if exist .env (
    echo ✅ .env file exists
    echo.
    echo 📄 Contents of .env file:
    type .env
    echo.
) else (
    echo ❌ .env file is missing!
    echo.
    echo 🔧 Creating .env file from template...
    copy env.example .env
    echo.
    echo ⚠️  IMPORTANT: You need to add your OpenWeatherMap API key!
    echo    Edit backend/.env and replace 'your_openweathermap_api_key_here' with your actual API key
    echo.
    echo 🔑 Get your free API key at: https://openweathermap.org/api
    echo.
)

echo.
echo 🌐 Testing backend health endpoint...
echo Making request to http://localhost:5000/health
curl -s http://localhost:5000/health 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ Backend server is not running or not accessible
    echo.
    echo 🚀 To start the backend server:
    echo    1. cd backend
    echo    2. npm run dev
    echo.
) else (
    echo.
    echo ✅ Backend server is responding
)

echo.
echo 🔍 Common Issues and Solutions:
echo.
echo 1. ❌ API Key Missing:
echo    - Edit backend/.env
echo    - Add: OPENWEATHER_API_KEY=your_actual_key_here
echo.
echo 2. ❌ Backend Not Running:
echo    - Open new terminal
echo    - cd backend
echo    - npm run dev
echo.
echo 3. ❌ Port 5000 in Use:
echo    - Change PORT=5001 in backend/.env
echo    - Update frontend API URL accordingly
echo.
echo 4. ❌ Dependencies Missing:
echo    - cd backend
echo    - npm install
echo.

pause
