@echo off
echo 🌤️ Setting up Weather App Frontend...
echo.

cd frontend

echo 📦 Installing frontend dependencies...
call npm install

echo.
echo 📄 Setting up environment file (optional)...
if not exist .env (
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo ✅ Created .env file with default API URL
) else (
    echo ✅ .env file already exists
)

echo.
echo 🚀 Frontend setup complete!
echo.
echo Next steps:
echo 1. Make sure backend is running on port 5000
echo 2. Run: npm start (in the frontend folder)
echo 3. Open http://localhost:3000 in your browser
echo.
pause
