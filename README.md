# 🌤️ Reliable Weather

A beautiful, feature-rich weather application built with React, Node.js, and Tailwind CSS. Get real-time weather data, forecasts, and weather-based insights for any location worldwide.

![Reliable Weather App](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🌡️ **Core Weather Features**
- **Real-time Weather Data** - Current conditions, temperature, humidity, wind, pressure
- **7-Day Forecast** - Detailed daily weather predictions with min/max temperatures
- **Hourly Timeline** - Scrollable hourly forecast for the current day
- **Location-based Weather** - Get weather for your current location or search any city
- **Units Toggle** - Switch between °C/°F and m/s/mph

### 🌅 **Astronomical Data**
- **Sunrise & Sunset Times** - Accurate astronomical data
- **Day Length Calculation** - Shows how long the day/night cycle is
- **Moon Phase Calendar** - Monthly moon phases with stargazing tips

### 🚨 **Weather Intelligence**
- **Weather Alerts** - Severe weather warnings and notifications
- **Air Quality Index** - Detailed AQI with health impact descriptions
- **Weather Comparison** - Compare weather across multiple cities
- **Auto-refresh** - Updates weather data every 15 minutes

### 🎨 **Smart UI Features**
- **Auto Theme Switching** - Automatically switches between light/dark based on time of day
- **Manual Theme Control** - User preference override for theme selection
- **Weather-based Backgrounds** - Dynamic backgrounds that change with weather conditions
- **Responsive Design** - Works perfectly on all devices

### 📱 **Additional Features**
- **Weather News** - Real-time weather-related news and updates
- **Weather Sharing** - Generate shareable weather reports and images
- **Smart Reminders** - Weather-based activity recommendations
- **Search History** - Remember your recent searches with easy access
- **Location Services** - Use GPS for accurate local weather

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- WeatherAPI.com API key (free)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your API key
echo "WEATHERAPI_KEY=your_api_key_here" > .env

# Start the server
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 🔑 API Configuration

1. Get your free API key from [WeatherAPI.com](https://www.weatherapi.com/)
2. Create a `.env` file in the backend directory
3. Add your API key: `WEATHERAPI_KEY=your_key_here`

## 🏗️ Project Structure

```
weather-app/
├── backend/                 # Node.js Express server
│   ├── routes/             # API endpoints
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main app component
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🎯 Key Components

### **WeatherCard** - Main weather display
- Current conditions with day/night detection
- Sunrise/sunset times and day length
- Air quality index with health descriptions
- Responsive design for all screen sizes

### **ForecastCard** - 7-day forecast
- Daily weather predictions
- Temperature ranges and precipitation chances
- Wind and humidity data
- Cached data indicator for performance

### **HourlyTimeline** - Hourly forecast
- Scrollable timeline for current day
- Temperature, conditions, and rain chances
- Smooth animations and transitions

### **WeatherComparison** - Multi-city comparison
- Compare weather across up to 4 cities
- Side-by-side metrics display
- Easy city management

### **MoonPhaseCalendar** - Astronomical data
- Monthly moon phase calendar
- Stargazing tips based on illumination
- Today's sun and moon times

## 🎨 UI/UX Features

- **Framer Motion** animations for smooth transitions
- **Tailwind CSS** for responsive, utility-first styling
- **Dynamic backgrounds** that change with weather
- **Auto theme switching** based on time of day
- **Mobile-first responsive design**

## 🔧 Technical Features

- **Caching system** for improved performance
- **Error handling** with user-friendly messages
- **Loading states** with smooth transitions
- **Local storage** for user preferences
- **Geolocation API** integration
- **Responsive design** for all devices

## 📱 Responsive Design

The app is fully responsive and works perfectly on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large displays

## 🚀 Performance Features

- **2-minute caching** for faster responses
- **Lazy loading** of components
- **Optimized images** and assets
- **Efficient API calls** with proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WeatherAPI.com** for providing accurate weather data
- **React** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations

## 📞 Support

If you have any questions or need help:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ using React, Node.js, and Tailwind CSS**

*Get accurate weather information anytime, anywhere with Reliable Weather!* 🌤️
