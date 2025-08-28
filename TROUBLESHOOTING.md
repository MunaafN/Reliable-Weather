# 🛠️ Troubleshooting Guide

Common issues and their solutions when setting up the Weather App.

## 🔴 Node.js Version Warnings

### Problem:
```
npm WARN EBADENGINE Unsupported engine
required: { node: '^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0' }
current: { node: 'v21.1.0', npm: '10.2.0' }
```

### Solution:
✅ **These warnings are SAFE to ignore!**

Your Node.js v21.1.0 is **fully compatible** and the app will work perfectly. The warnings occur because:
- Some Jest testing packages have strict version requirements
- Node.js v21 is between the "officially supported" versions but works fine
- The app functionality is not affected

**Options:**
1. **Ignore the warnings** (recommended) - app works fine
2. **Use --legacy-peer-deps flag**: `npm install --legacy-peer-deps`
3. **Update to Node.js v22** if you want to eliminate warnings

## 🔒 Security Vulnerabilities

### Problem:
```
9 vulnerabilities (3 moderate, 6 high)
```

### Solution:
```bash
# Run the fix script
setup-scripts/fix-dependencies.bat

# Or manually:
cd frontend
npm audit fix
cd ../backend
npm audit fix
```

**Safe fixes only** - we don't use `--force` to avoid breaking changes.

## 🌐 API Configuration Issues

### Problem: "API key not configured"

### Solution:
1. Get free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Copy `backend/env.example` to `backend/.env`
3. Add your API key:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

### Problem: "City not found"

### Solution:
- Check spelling of city name
- Try searching with country: "London, UK"
- Use the autocomplete suggestions
- Try coordinates instead of city name

## 🔌 Port Issues

### Problem: "Port 3000/5000 already in use"

### Solution:
```bash
# Kill processes on ports (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change ports in:
# backend/.env: PORT=5001
# frontend/.env: PORT=3001
```

## 🌍 CORS Errors

### Problem: "Access-Control-Allow-Origin" errors

### Solution:
1. Make sure backend is running on port 5000
2. Check `backend/.env` has correct frontend URL:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```
3. Restart both servers

## 📱 Location Access Issues

### Problem: "Location access denied"

### Solution:
1. **Browser Settings**: Enable location access for localhost
2. **HTTPS Required**: Some browsers require HTTPS for geolocation
3. **Manual Search**: Use city search instead of location button
4. **Browser Console**: Check for detailed error messages

## 🎨 UI/Styling Issues

### Problem: Tailwind CSS build errors (border-border class not found)

### Solution:
```bash
# Quick fix - run the CSS fix script
setup-scripts/fix-css-issues.bat

# Or manual fix:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Problem: Styles not loading properly

### Solution:
```bash
cd frontend
npm install
# Clear cache
npm start -- --reset-cache
```

### Problem: Dark mode not working

### Solution:
- Check browser localStorage: `localStorage.getItem('darkMode')`
- Clear browser data for localhost
- Hard refresh: Ctrl+F5

### Problem: PostCSS or Tailwind errors

### Solution:
1. **Delete CSS cache**: Remove `node_modules/.cache`
2. **Reinstall Tailwind**: `npm uninstall tailwindcss && npm install tailwindcss`
3. **Reset config**: `npx tailwindcss init -p --force`

## 🔄 Rate Limiting Issues

### Problem: "Too many requests" error

### Solution:
1. **Wait 15 minutes** - rate limit resets automatically
2. **Use different network** - rate limits are per IP
3. **Check API key quota** on OpenWeatherMap dashboard

## 📦 Installation Issues

### Problem: npm install fails

### Solution:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use legacy peer deps
npm install --legacy-peer-deps

# Update npm
npm install -g npm@latest
```

### Problem: Git not found

### Solution:
- Install Git from [git-scm.com](https://git-scm.com/)
- Or download project as ZIP instead of cloning

## 🚀 Deployment Issues

### Problem: Build fails

### Solution:
```bash
cd frontend
npm run build

# If fails, check for:
# - Unused imports (remove them)
# - TypeScript errors (fix or add // @ts-ignore)
# - Environment variables in production
```

### Problem: Backend not working in production

### Solution:
1. Set environment variables in hosting service:
   ```env
   NODE_ENV=production
   OPENWEATHER_API_KEY=your_key
   FRONTEND_URL=https://your-frontend-domain.com
   ```
2. Enable trust proxy for production
3. Check hosting service logs

## 🔍 Debugging Tips

### Enable Debug Logging:
```bash
# Backend debug
cd backend
DEBUG=* npm run dev

# Frontend with source maps
cd frontend
GENERATE_SOURCEMAP=true npm start
```

### Browser Developer Tools:
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor API requests
3. **Application Tab**: Check localStorage and service workers

### API Testing:
```bash
# Test backend directly
curl http://localhost:5000/health
curl "http://localhost:5000/api/weather/current?city=London"
```

## 📞 Still Need Help?

1. **Check the main README.md** for setup instructions
2. **Look at code comments** for implementation details
3. **Create an issue** with:
   - Your operating system
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Full error message
   - Steps to reproduce

## 🔧 Quick Fix Commands

```bash
# Complete reset and reinstall
cd weather-app
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install-all

# Fix permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Update all dependencies
cd frontend && npm update
cd ../backend && npm update
```

---

Remember: Most warnings are harmless and the app will work perfectly despite them! 🌤️
