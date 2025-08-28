@echo off
echo 🔧 Creating .env file for backend...
echo.

cd backend

echo 📋 Checking current status...
if exist .env (
    echo ⚠️  .env file already exists!
    echo.
    echo Current contents:
    echo ================================
    type .env
    echo ================================
    echo.
    echo Do you want to recreate it? (This will overwrite existing file)
    set /p confirm="Type 'yes' to continue: "
    if not "!confirm!"=="yes" (
        echo Cancelled.
        goto :end
    )
)

echo.
echo 📄 Creating .env file from template...
copy env.example .env

echo.
echo ✅ .env file created!
echo.
echo 📋 Current .env contents:
echo ================================
type .env
echo ================================
echo.

echo ⚠️  IMPORTANT: You need to edit the .env file and replace the placeholder!
echo.
echo 🔧 Steps to complete setup:
echo 1. Open: backend\.env in any text editor
echo 2. Find line: OPENWEATHER_API_KEY=your_openweathermap_api_key_here
echo 3. Replace 'your_openweathermap_api_key_here' with your actual API key
echo 4. Save the file
echo 5. Restart your backend server (Ctrl+C then npm run dev)
echo.
echo 🔑 Get your free API key at: https://openweathermap.org/api
echo.

:end
pause
