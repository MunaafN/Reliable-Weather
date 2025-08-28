@echo off
echo 🔍 Checking .env File Configuration...
echo.

cd backend

echo 📄 Checking if .env file exists...
if exist .env (
    echo ✅ .env file found
    echo.
) else (
    echo ❌ .env file NOT found!
    echo.
    echo 🔧 Creating .env file from template...
    if exist env.example (
        copy env.example .env
        echo ✅ Created .env file
        echo ⚠️  Now edit .env and add your API key!
    ) else (
        echo ❌ env.example template not found
    )
    echo.
    goto :end
)

echo 📋 Current .env file contents:
echo ================================
type .env
echo ================================
echo.

echo 🔍 Analyzing API key configuration...
echo.

findstr /C:"OPENWEATHER_API_KEY" .env > nul
if %errorlevel% neq 0 (
    echo ❌ OPENWEATHER_API_KEY line not found in .env file
    echo 💡 Add this line: OPENWEATHER_API_KEY=your_actual_api_key
    goto :end
)

findstr /C:"OPENWEATHER_API_KEY=" .env | findstr /C:"your_openweathermap_api_key_here" > nul
if %errorlevel% equ 0 (
    echo ❌ API key still has PLACEHOLDER value
    echo 💡 Replace 'your_openweathermap_api_key_here' with your actual API key
    goto :end
)

findstr /C:"OPENWEATHER_API_KEY=$" .env > nul
if %errorlevel% equ 0 (
    echo ❌ API key is EMPTY
    echo 💡 Add your API key after the = sign
    goto :end
)

findstr /C:"OPENWEATHER_API_KEY= " .env > nul
if %errorlevel% equ 0 (
    echo ❌ API key line has SPACES after =
    echo 💡 Remove spaces: OPENWEATHER_API_KEY=your_key (no spaces)
    goto :end
)

echo ✅ API key line looks correctly formatted
echo.

for /f "tokens=2 delims==" %%a in ('findstr "OPENWEATHER_API_KEY" .env') do (
    set "apikey=%%a"
    set "apikey=!apikey: =!"
)

setlocal enabledelayedexpansion
if "!apikey!" == "" (
    echo ❌ API key appears to be empty
) else (
    echo ✅ API key found: !apikey:~0,8!...!apikey:~-4!
    echo    Length: 
    echo !apikey!| find /v /c ""
)

echo.
echo 📋 Next Steps:
echo 1. If you see any ❌ above, fix those issues
echo 2. Make sure to RESTART your backend server after changes
echo 3. Get your API key from: https://openweathermap.org/api
echo.

:end
pause
