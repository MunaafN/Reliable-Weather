import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ForecastCard from './components/ForecastCard';
import DarkModeToggle from './components/DarkModeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import LocationButton from './components/LocationButton';
import { getWeatherBackground } from './utils/weatherUtils';
import { weatherApi } from './services/weatherApi';
import HourlyTimeline from './components/HourlyTimeline';
import WeatherComparison from './components/WeatherComparison';
import WeatherAlerts from './components/WeatherAlerts';
import MoonPhaseCalendar from './components/MoonPhaseCalendar';
import WeatherSharing from './components/WeatherSharing';
import WeatherReminders from './components/WeatherReminders';
import WeatherNews from './components/WeatherNews';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [autoTheme, setAutoTheme] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [units, setUnits] = useState(localStorage.getItem('weatherUnits') || 'metric');
  const [lastQuery, setLastQuery] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showMoonPhase, setShowMoonPhase] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showNews, setShowNews] = useState(false);

  // Initialize dark mode and auto theme from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedAutoTheme = localStorage.getItem('autoTheme') !== 'false'; // Default to true
    setDarkMode(savedDarkMode);
    setAutoTheme(savedAutoTheme);
    
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    let effectiveDark;
    
    if (autoTheme) {
      // Automatic mode: Use day/night detection + system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isNight = weatherData?.localTime?.isDayTime === false;
      effectiveDark = isNight || prefersDark;
      console.log('🔄 Auto Theme:', { isNight, prefersDark, effectiveDark });
    } else {
      // Manual mode: Use user's explicit choice
      effectiveDark = darkMode;
      console.log('🎨 Manual Theme:', { darkMode, effectiveDark });
    }
    
    if (effectiveDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('autoTheme', autoTheme.toString());
  }, [darkMode, weatherData, autoTheme]);

  // Persist units
  useEffect(() => {
    localStorage.setItem('weatherUnits', units);
  }, [units]);

  // Refetch data when units change based on last query
  useEffect(() => {
    const refetchForUnits = async () => {
      if (!lastQuery) return;
      setLoading(true);
      setError(null);
      try {
        let currentData, forecast;
        if (typeof lastQuery === 'object' && lastQuery.lat && lastQuery.lon) {
          [currentData, forecast] = await Promise.all([
            weatherApi.getCurrentWeatherByCoords(lastQuery.lat, lastQuery.lon, units),
            weatherApi.getForecastByCoords(lastQuery.lat, lastQuery.lon, units)
          ]);
        } else if (typeof lastQuery === 'string') {
          [currentData, forecast] = await Promise.all([
            weatherApi.getCurrentWeather(lastQuery, units),
            weatherApi.getForecast(lastQuery, units)
          ]);
        }
        if (currentData && forecast) {
          setWeatherData(currentData);
          setForecastData(forecast);
        }
      } catch (err) {
        setError(err.message || 'Failed to update units');
      } finally {
        setLoading(false);
      }
    };
    refetchForUnits();
  }, [units, lastQuery]);

  // Auto-refresh weather data every 15 minutes
  useEffect(() => {
    if (!lastQuery) return;
    
    const interval = setInterval(async () => {
      if (document.hidden) return; // Don't refresh when tab is hidden
      
      try {
        let currentData, forecast;
        if (typeof lastQuery === 'object' && lastQuery.lat && lastQuery.lon) {
          [currentData, forecast] = await Promise.all([
            weatherApi.getCurrentWeatherByCoords(lastQuery.lat, lastQuery.lon, units),
            weatherApi.getForecastByCoords(lastQuery.lat, lastQuery.lon, units)
          ]);
        } else if (typeof lastQuery === 'string') {
          [currentData, forecast] = await Promise.all([
            weatherApi.getCurrentWeather(lastQuery, units),
            weatherApi.getForecast(lastQuery, units)
          ]);
        }
        if (currentData && forecast) {
          setWeatherData(currentData);
          setForecastData(forecast);
        }
      } catch (err) {
        console.log('Auto-refresh failed:', err.message);
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [lastQuery, units]);

  const handleSearch = async (searchInput) => {
    // Handle both city names and coordinate objects
    const isCoordinates = typeof searchInput === 'object' && searchInput.lat && searchInput.lon;
    const isCityName = typeof searchInput === 'string' && searchInput.trim();
    
    if (!isCoordinates && !isCityName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let currentData, forecast;
      
      if (isCoordinates) {
        // Use coordinates for more accurate results
        [currentData, forecast] = await Promise.all([
          weatherApi.getCurrentWeatherByCoords(searchInput.lat, searchInput.lon, units),
          weatherApi.getForecastByCoords(searchInput.lat, searchInput.lon, units)
        ]);
        setLastQuery({ lat: searchInput.lat, lon: searchInput.lon });
      } else {
        // Use city name
        [currentData, forecast] = await Promise.all([
          weatherApi.getCurrentWeather(searchInput, units),
          weatherApi.getForecast(searchInput, units)
        ]);
        setLastQuery(searchInput);
      }
      
      setWeatherData(currentData);
      setForecastData(forecast);
      
      // Update search history
      const newHistory = [
        { city: currentData.city, country: currentData.country, timestamp: new Date() },
        ...searchHistory.filter(item => 
          item.city.toLowerCase() !== currentData.city.toLowerCase()
        ).slice(0, 4)
      ];
      setSearchHistory(newHistory);
      localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
      
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (coordinates) => {
    setLoading(true);
    setError(null);
    
    try {
      const [currentData, forecast] = await Promise.all([
        weatherApi.getCurrentWeatherByCoords(coordinates.lat, coordinates.lon, units),
        weatherApi.getForecastByCoords(coordinates.lat, coordinates.lon, units)
      ]);
      
      setWeatherData(currentData);
      setForecastData(forecast);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data for your location');
    } finally {
      setLoading(false);
    }
  };

  // Determine effective dark mode based on theme setting
  const isNightFromData = weatherData?.localTime?.isDayTime === false;
  const isDarkEffective = autoTheme ? isNightFromData : darkMode;
  const backgroundClass = weatherData ? 
    getWeatherBackground(weatherData.weather.main, isDarkEffective) : 
    (isDarkEffective ? 'bg-default-dark-gradient' : 'bg-default-gradient');

  return (
    <div className={`min-h-screen transition-all duration-700 ${backgroundClass}`}>
      {/* Background patterns for weather effects */}
      {weatherData?.weather.main === 'Rain' && (
        <div className="fixed inset-0 rain-pattern pointer-events-none" />
      )}
      {weatherData?.weather.main === 'Snow' && (
        <div className="fixed inset-0 snow-pattern pointer-events-none" />
      )}
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
                 <motion.header 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 mb-8"
         >
           <motion.h1 
             className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg"
             whileHover={{ scale: 1.05 }}
           >
             🌤️ Reliable Weather.com
           </motion.h1>
           
           {/* Header Controls - Responsive Grid */}
           <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto">
             {/* Units Section */}
             <div className="flex items-center gap-2">
               <div className="text-white/80 text-xs lg:text-sm">Units:</div>
               <button
                 onClick={() => setUnits(prev => prev === 'metric' ? 'imperial' : 'metric')}
                 className="px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl bg-white/20 text-white text-xs lg:text-sm hover:bg-white/30 transition"
               >
                 {units === 'metric' ? '°C, m/s' : '°F, mph'}
               </button>
             </div>
             
             {/* Feature Buttons */}
             <button
               onClick={() => setShowComparison(true)}
               className="px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl bg-blue-500/80 text-white text-xs lg:text-sm hover:bg-blue-500 transition"
             >
               Compare
             </button>
             <button
               onClick={() => setShowMoonPhase(true)}
               className="px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl bg-purple-500/80 text-white text-xs lg:text-sm hover:bg-purple-500 transition"
             >
               🌙 Moon
             </button>
             <button
               onClick={() => {
                 if (!weatherData) {
                   alert('Please search for a city first to get weather news');
                   return;
                 }
                 setShowNews(true);
               }}
               disabled={!weatherData}
               className={`px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-white text-xs lg:text-sm transition ${
                 weatherData 
                   ? 'bg-indigo-500/80 hover:bg-indigo-500' 
                   : 'bg-gray-500/50 cursor-not-allowed'
               }`}
             >
               📰 News
             </button>
             <button
               onClick={() => {
                 if (!weatherData) {
                   alert('Please search for a city first to share weather data');
                   return;
                 }
                 setShowSharing(true);
               }}
               disabled={!weatherData}
               className={`px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-white text-xs lg:text-sm transition ${
                 weatherData 
                   ? 'bg-green-500/80 hover:bg-green-500' 
                   : 'bg-gray-500/50 cursor-not-allowed'
               }`}
             >
               📤 Share
             </button>
             <button
               onClick={() => {
                 if (!weatherData) {
                   alert('Please search for a city first to get weather reminders');
                   return;
                 }
                 setShowReminders(true);
               }}
               disabled={!weatherData}
               className={`px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-white text-xs lg:text-sm transition ${
                 weatherData 
                   ? 'bg-orange-500/80 hover:bg-orange-500' 
                   : 'bg-gray-500/50 cursor-not-allowed'
               }`}
             >
               🔔 Remind
             </button>
             <button
               onClick={() => setShowAlerts(prev => !prev)}
               disabled={!weatherData}
               className={`px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-white text-xs lg:text-sm transition ${
                 weatherData 
                   ? (showAlerts ? 'bg-red-500/80 hover:bg-red-500' : 'bg-gray-500/80 hover:bg-gray-500')
                   : 'bg-gray-500/50 cursor-not-allowed'
               }`}
             >
               {showAlerts ? '🚫 Hide' : '⚠️ Show'}
             </button>
             <button
               onClick={() => setAutoTheme(prev => !prev)}
               className={`px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl text-white text-xs lg:text-sm transition ${
                 autoTheme 
                   ? 'bg-green-500/80 hover:bg-green-500' 
                   : 'bg-blue-500/80 hover:bg-blue-500'
               }`}
               title={autoTheme ? 'Auto theme enabled (follows day/night)' : 'Manual theme enabled (user control)'}
             >
               {autoTheme ? '🔄 Auto' : '🎨 Manual'}
             </button>
             
             {/* Dark Mode Toggle */}
             <div className="ml-2">
               <DarkModeToggle 
                 darkMode={darkMode} 
                 onToggle={() => setDarkMode(prev => !prev)}
                 autoTheme={autoTheme}
               />
             </div>
           </div>
         </motion.header>

        {/* Theme Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 text-white/70 text-sm"
        >
          {autoTheme ? (
            <span className="flex items-center justify-center gap-2">
              🔄 Auto Theme: {weatherData?.localTime?.isDayTime ? '☀️ Day Mode' : '🌙 Night Mode'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🎨 Manual Theme: {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </span>
          )}
        </motion.div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <SearchBar 
              onSearch={handleSearch} 
              loading={loading}
              searchHistory={searchHistory}
              onClearHistory={() => { setSearchHistory([]); localStorage.setItem('weatherSearchHistory', JSON.stringify([])); }}
              onDeleteHistoryItem={(item) => {
                const updated = searchHistory.filter(h => h.city !== item.city || h.country !== item.country);
                setSearchHistory(updated);
                localStorage.setItem('weatherSearchHistory', JSON.stringify(updated));
              }}
              historyCap={5}
            />
            <LocationButton 
              onLocationFound={handleLocationSearch}
              loading={loading}
            />
          </div>
        </motion.div>

        {/* Weather Alerts */}
        {showAlerts && weatherData && (
          <WeatherAlerts 
            alerts={forecastData?.alerts} 
            onDismiss={() => setShowAlerts(false)} 
            showNoAlerts={true}
          />
        )}

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center mb-8"
            >
              <LoadingSpinner />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weather Data */}
        <AnimatePresence mode="wait">
          {weatherData && !loading && (
            <motion.div
              key="weather-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Current Weather */}
              <motion.div 
                className="mb-8"
                layout
              >
                <WeatherCard data={weatherData} />
              </motion.div>

              {/* 5-Day Forecast */}
              {forecastData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ForecastCard data={forecastData} />
                </motion.div>
              )}

              {/* Hourly Timeline */}
              {forecastData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-6"
                >
                  <HourlyTimeline data={forecastData} units={units} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome Message */}
        {!weatherData && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="weather-card max-w-md mx-auto p-8">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="text-6xl mb-4"
              >
                🌈
              </motion.div>
                             <h2 className="text-2xl font-bold text-white mb-4">
                 Welcome to Reliable Weather.com
               </h2>
               <p className="text-white/80 mb-6">
                 Search for any city to get real-time weather information and 7-day forecasts.
               </p>
              <div className="space-y-2 text-sm text-white/70">
                <p>✨ Real-time weather data</p>
                <p>📅 7-day forecast</p>
                <p>📍 Location-based weather</p>
                <p>🌙 Dark mode support</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 text-white/60 text-sm"
        >
          <p>Weather data provided by WeatherAPI.com</p>
                     <p className="mt-2">Reliable Weather - Built with React, Tailwind CSS, and Framer Motion</p>
        </motion.footer>
      </div>

      {/* Weather Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowComparison(false);
            }}
          >
            <WeatherComparison onClose={() => setShowComparison(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moon Phase Calendar Modal */}
      <AnimatePresence>
        {showMoonPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowMoonPhase(false);
            }}
          >
            <MoonPhaseCalendar 
              onClose={() => setShowMoonPhase(false)} 
              forecastData={forecastData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather Sharing Modal */}
      <AnimatePresence>
        {showSharing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSharing(false);
            }}
          >
            <WeatherSharing 
              onClose={() => setShowSharing(false)} 
              weatherData={weatherData}
              forecastData={forecastData}
            />
          </motion.div>
        )}
      </AnimatePresence>

             {/* Weather Reminders Modal */}
       <AnimatePresence>
         {showReminders && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={(e) => {
               if (e.target === e.currentTarget) setShowReminders(false);
             }}
           >
             <WeatherReminders 
               onClose={() => setShowReminders(false)} 
               weatherData={weatherData}
               forecastData={forecastData}
             />
           </motion.div>
         )}
       </AnimatePresence>

       {/* Weather News Modal */}
       <AnimatePresence>
         {showNews && (
           <WeatherNews 
             onClose={() => setShowNews(false)} 
             cityName={weatherData?.city}
             countryName={weatherData?.country}
           />
         )}
       </AnimatePresence>
     </div>
   );
 }

export default App;
