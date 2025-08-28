@echo off
echo 🌤️ Setting up Weather App Backend...
echo.

cd backend

echo 📦 Installing backend dependencies...
call npm install

echo.
echo 📄 Setting up environment file...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from template
    echo.
    echo ⚠️  IMPORTANT: Please edit backend/.env and add your OpenWeatherMap API key!
    echo    Get your free API key at: https://openweathermap.org/api
    echo.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🚀 Backend setup complete!
echo.
echo Next steps:
echo 1. Edit backend/.env file and add your OPENWEATHER_API_KEY
echo 2. Run: npm run dev (in the backend folder)
echo.
pause
