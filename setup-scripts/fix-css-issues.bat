@echo off
echo 🎨 Fixing CSS and Tailwind issues...
echo.

cd frontend

echo 📦 Reinstalling Tailwind CSS and PostCSS...
call npm uninstall tailwindcss autoprefixer postcss
call npm install tailwindcss@^3.3.6 autoprefixer@^10.4.16 postcss@^8.4.32 --save-dev

echo.
echo 🔧 Regenerating Tailwind configuration...
call npx tailwindcss init -p

echo.
echo 📝 CSS file has been simplified to avoid compatibility issues
echo.

echo 🚀 Rebuilding CSS...
call npm run build

echo.
echo ✅ CSS issues fixed!
echo.
echo If you still see CSS errors:
echo 1. Delete node_modules folder
echo 2. Run: npm install
echo 3. Run: npm start
echo.
pause
