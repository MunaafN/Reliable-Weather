# 🚀 Quick Setup Guide

Follow these steps to get your Weather App running in minutes!

## 🔧 Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **OpenWeatherMap API Key** - [Get free API key](https://openweathermap.org/api)

## ⚡ One-Command Setup (Recommended)

### Option 1: Using Batch Scripts (Windows)

1. **Setup Backend**:
   ```bash
   setup-scripts/setup-backend.bat
   ```

2. **Setup Frontend**:
   ```bash
   setup-scripts/setup-frontend.bat
   ```

3. **Start Development Servers**:
   ```bash
   setup-scripts/start-dev.bat
   ```

### Option 2: Using npm (Cross-platform)

1. **Install all dependencies**:
   ```bash
   npm run setup
   ```

2. **Add your API key** to `backend/.env`:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

## 🔑 Getting Your API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" (it's free!)
3. After registration, go to your dashboard
4. Copy your API key
5. Paste it in `backend/.env` file

## 📱 Access Your App

After setup, your app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🆘 Troubleshooting

### Common Issues:

**"API key not configured"**
- Make sure you added your OpenWeatherMap API key to `backend/.env`

**"Port already in use"**
- Close other applications using ports 3000 or 5000
- Or change ports in the configuration files

**"npm command not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)

**Dependencies not installing**
- Try deleting `node_modules` folders and run setup again
- Make sure you have a stable internet connection

### Manual Setup (if scripts don't work):

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env file and add your API key
   npm run dev
   ```

2. **Frontend Setup** (in new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🎉 You're Done!

Your beautiful weather app should now be running! 

- Search for any city to see current weather
- Click "Use My Location" for local weather
- Toggle dark mode with the switch in the top-right
- Enjoy the smooth animations and beautiful UI!

Need help? Check the main README.md for detailed documentation.
