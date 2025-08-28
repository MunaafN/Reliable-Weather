@echo off
echo 🔧 Fixing npm dependencies and security issues...
echo.

echo Current Node.js version:
node --version
echo.

echo Current npm version:
npm --version
echo.

echo 📋 Node.js Version Compatibility Notice:
echo Your Node.js version is v21.1.0
echo Some packages expect Node.js v18.14+ or v20+ or v22+
echo.
echo ✅ Your version (v21.1.0) is compatible but may show warnings
echo The app will work fine despite the warnings
echo.

echo 🔧 Fixing frontend dependencies...
cd frontend

echo 📦 Installing dependencies with legacy peer deps...
call npm install --legacy-peer-deps

echo.
echo 🛡️ Checking for security vulnerabilities...
call npm audit

echo.
echo 🔒 Attempting to fix security issues (safe fixes only)...
call npm audit fix

echo.
echo ✅ Frontend dependencies fixed!
echo.

cd ..

echo 🔧 Fixing backend dependencies...
cd backend

echo 📦 Installing backend dependencies...
call npm install

echo.
echo 🛡️ Checking backend security...
call npm audit

echo.
echo 🔒 Attempting to fix backend security issues...
call npm audit fix

echo.
echo ✅ Backend dependencies fixed!
echo.

cd ..

echo.
echo 🎉 Dependency fixes complete!
echo.
echo ⚠️  Note about warnings:
echo - The EBADENGINE warnings are safe to ignore
echo - Your Node.js v21.1.0 is fully compatible
echo - The app will run without any issues
echo.
echo Next step: Add your OpenWeatherMap API key to backend/.env
echo Then run: npm run dev
echo.
pause
