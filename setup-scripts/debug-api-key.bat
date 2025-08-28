@echo off
echo 🔍 Debugging API Key Configuration...
echo.

cd backend

echo 📄 Current .env file contents:
echo ================================
if exist .env (
    type .env
) else (
    echo ❌ .env file not found!
    goto :end
)
echo ================================
echo.

echo 🔍 Checking for common issues:
echo.

echo 1. Checking if API key is empty or placeholder...
findstr /C:"OPENWEATHER_API_KEY=" .env > temp_key.txt
set /p keyline=<temp_key.txt
del temp_key.txt

echo Found: %keyline%
echo.

echo 2. Checking for placeholder values...
findstr /C:"your_openweathermap_api_key_here" .env > nul
if %errorlevel% equ 0 (
    echo ❌ ISSUE FOUND: Still using placeholder value
    echo.
    echo Fix: Replace 'your_openweathermap_api_key_here' with your actual API key
    goto :end
)

findstr /C:"OPENWEATHER_API_KEY=$" .env > nul
if %errorlevel% equ 0 (
    echo ❌ ISSUE FOUND: API key is empty
    echo.
    echo Fix: Add your API key after the equals sign
    goto :end
)

echo 3. Checking API key format...
for /f "tokens=2 delims==" %%a in ('findstr "OPENWEATHER_API_KEY" .env') do set apikey=%%a

if "%apikey%"=="" (
    echo ❌ ISSUE FOUND: API key appears to be empty
    goto :end
)

echo API key value: %apikey%
echo Length: 
echo %apikey% | find /v /c "" > temp_len.txt
set /p keylen=<temp_len.txt
del temp_len.txt

if %keylen% LSS 30 (
    echo ❌ ISSUE FOUND: API key seems too short (expected ~32 characters)
    echo Your key length: %keylen%
    echo.
    echo This might not be a valid OpenWeatherMap API key
    goto :end
)

echo ✅ API key format looks correct
echo.

echo 4. Testing environment loading...
echo.
echo Starting Node.js to test environment variables...
node -e "require('dotenv').config(); console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? 'Found (' + process.env.OPENWEATHER_API_KEY.length + ' chars)' : 'NOT FOUND');"

echo.
echo 5. Common fixes:
echo.
echo ❯ Restart the backend server completely (Ctrl+C then npm run dev)
echo ❯ Make sure there are no spaces around the = sign
echo ❯ Make sure the .env file is in the backend folder (not root)
echo ❯ Check that your API key is active on OpenWeatherMap dashboard
echo.

:end
pause
