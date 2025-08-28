@echo off
echo 🔍 Verifying Weather App Setup...
echo.

echo 📁 Checking project structure...
if exist "backend" (
    echo ✅ Backend folder exists
) else (
    echo ❌ Backend folder missing
)

if exist "frontend" (
    echo ✅ Frontend folder exists
) else (
    echo ❌ Frontend folder missing
)

echo.
echo 📦 Checking backend setup...
cd backend

if exist "package.json" (
    echo ✅ Backend package.json exists
) else (
    echo ❌ Backend package.json missing
)

if exist "node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Backend dependencies not installed
    echo    Run: npm install
)

if exist ".env" (
    echo ✅ Backend .env file exists
    echo.
    echo 🔑 Checking API key configuration...
    findstr "OPENWEATHER_API_KEY" .env > nul
    if %errorlevel% equ 0 (
        findstr "your_openweathermap_api_key_here" .env > nul
        if %errorlevel% equ 0 (
            echo ❌ API key still has placeholder value
            echo    Please edit backend/.env and add your actual API key
        ) else (
            echo ✅ API key appears to be configured
        )
    ) else (
        echo ❌ API key not found in .env file
    )
) else (
    echo ❌ Backend .env file missing
    echo    Copy env.example to .env and add your API key
)

cd ../frontend

echo.
echo 📦 Checking frontend setup...
if exist "package.json" (
    echo ✅ Frontend package.json exists
) else (
    echo ❌ Frontend package.json missing
)

if exist "node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies not installed
    echo    Run: npm install
)

cd ..

echo.
echo 🚀 Setup Summary:
echo.
echo To complete setup:
echo 1. Get free API key from https://openweathermap.org/api
echo 2. Edit backend/.env and add your API key
echo 3. Start backend: cd backend && npm run dev
echo 4. Start frontend: cd frontend && npm start
echo.
echo 🔧 If you see 500 errors, run: setup-scripts/diagnose-backend.bat
echo.
pause
