@echo off
echo Fixing .env file...

cd backend

echo # OpenWeatherMap API Configuration > .env
echo OPENWEATHER_API_KEY=3732f42fe835184928252208 >> .env
echo. >> .env
echo # Server Configuration >> .env
echo PORT=5000 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # CORS Configuration (frontend URL) >> .env
echo FRONTEND_URL=http://localhost:3000 >> .env

echo.
echo ✅ .env file has been fixed!
echo.
echo Contents:
type .env
echo.
echo Now restart your backend server: npm run dev
pause
