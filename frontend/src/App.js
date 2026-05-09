import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Cloud, Thermometer } from 'lucide-react';
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
import WeatherAlerts from './components/WeatherAlerts';
import Sidebar from './components/Sidebar';
import { PinCityButton } from './components/SavedCities';
import WeatherEffects from './components/WeatherEffects';
import ComparePage from './pages/ComparePage';
import SavedCitiesPage from './pages/SavedCitiesPage';
import RadarPage from './pages/RadarPage';
import HistoryPage from './pages/HistoryPage';
import LandingPage from './pages/LandingPage';

function App() {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [autoTheme, setAutoTheme] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [units, setUnits] = useState(localStorage.getItem('weatherUnits') || 'metric');
  const [lastQuery, setLastQuery] = useState(null);
  const [showAlerts, setShowAlerts] = useState(true);

  // Initialize dark mode and auto theme from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedAutoTheme = localStorage.getItem('autoTheme') !== 'false';
    setDarkMode(savedDarkMode);
    setAutoTheme(savedAutoTheme);
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));

    // Offline mode: load last viewed data
    try {
      const cachedWeather = localStorage.getItem('lastWeatherData');
      const cachedForecast = localStorage.getItem('lastForecastData');
      const cachedQuery = localStorage.getItem('lastQuery');
      if (cachedWeather && cachedForecast && cachedQuery) {
        setWeatherData(JSON.parse(cachedWeather));
        setForecastData(JSON.parse(cachedForecast));
        setLastQuery(JSON.parse(cachedQuery));
      }
    } catch (e) { console.warn('Failed to load offline data', e); }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    let effectiveDark;
    if (autoTheme) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isNight = weatherData?.localTime?.isDayTime === false;
      effectiveDark = isNight || prefersDark;
    } else {
      effectiveDark = darkMode;
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

  // Refetch data when units change
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

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!lastQuery) return;
    let lastSignature = '';
    const getSignature = (current, forecast) => {
      if (!current || !forecast) return '';
      const cur = [current.temperature?.current, current.weather?.code, current.wind?.speed, current.humidity].join('-');
      const f0 = forecast.forecast?.[0];
      const fSig = f0 ? [f0.temperature?.min, f0.temperature?.max, f0.rain_chance].join('-') : '';
      return `${cur}|${fSig}`;
    };
    const interval = setInterval(async () => {
      if (document.hidden || !navigator.onLine) return;
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
        const sig = getSignature(currentData, forecast);
        if (sig && sig !== lastSignature) {
          lastSignature = sig;
          setWeatherData(currentData);
          setForecastData(forecast);
        }
      } catch (err) {
        console.log('Auto-refresh failed:', err.message);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lastQuery, units]);

  // SSE alerts
  useEffect(() => {
    if (!lastQuery) return;
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const params = new URLSearchParams();
    if (typeof lastQuery === 'object') {
      params.set('lat', lastQuery.lat);
      params.set('lon', lastQuery.lon);
    } else {
      params.set('city', lastQuery);
    }
    const es = new EventSource(`${API_BASE}/weather/alerts/stream?${params.toString()}`);
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === 'alerts' && Array.isArray(data.alerts)) {
          setForecastData(prev => ({ ...(prev || {}), alerts: data.alerts }));
          if (Notification.permission === 'granted' && data.alerts.length > 0) {
            const top = data.alerts[0];
            new Notification(`Weather Alert: ${top.event}`, { body: top.headline || top.desc || 'Severe weather alert', tag: 'weather-alert' });
          }
        }
      } catch {}
    };
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, [lastQuery]);

  const handleSearch = async (searchInput) => {
    const isCoordinates = typeof searchInput === 'object' && searchInput.lat && searchInput.lon;
    const isCityName = typeof searchInput === 'string' && searchInput.trim();
    if (!isCoordinates && !isCityName) return;
    setLoading(true);
    setError(null);
    try {
      let currentData, forecast;
      if (isCoordinates) {
        [currentData, forecast] = await Promise.all([
          weatherApi.getCurrentWeatherByCoords(searchInput.lat, searchInput.lon, units),
          weatherApi.getForecastByCoords(searchInput.lat, searchInput.lon, units)
        ]);
        setLastQuery({ lat: searchInput.lat, lon: searchInput.lon });
      } else {
        [currentData, forecast] = await Promise.all([
          weatherApi.getCurrentWeather(searchInput, units),
          weatherApi.getForecast(searchInput, units)
        ]);
        setLastQuery(searchInput);
      }
      setWeatherData(currentData);
      setForecastData(forecast);
      
      // Save for offline mode
      localStorage.setItem('lastWeatherData', JSON.stringify(currentData));
      localStorage.setItem('lastForecastData', JSON.stringify(forecast));
      localStorage.setItem('lastQuery', JSON.stringify(isCoordinates ? { lat: searchInput.lat, lon: searchInput.lon } : searchInput));

      const newHistory = [
        { city: currentData.city, country: currentData.country, timestamp: new Date() },
        ...searchHistory.filter(item => item.city.toLowerCase() !== currentData.city.toLowerCase()).slice(0, 4)
      ];
      setSearchHistory(newHistory);
      localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
      navigate('/dashboard');
    } catch (err) {
      if (!navigator.onLine) {
        setError('You appear to be offline. Please check your connection.');
      } else {
        setError(err.message || 'Failed to fetch weather data');
      }
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
      setLastQuery({ lat: coordinates.lat, lon: coordinates.lon });
      const newHistory = [
        { city: currentData.city, country: currentData.country, timestamp: new Date() },
        ...searchHistory.filter(item => item.city.toLowerCase() !== currentData.city.toLowerCase()).slice(0, 4)
      ];
      setSearchHistory(newHistory);
      localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
      navigate('/dashboard');
      
      // Save for offline mode
      localStorage.setItem('lastWeatherData', JSON.stringify(currentData));
      localStorage.setItem('lastForecastData', JSON.stringify(forecast));
      localStorage.setItem('lastQuery', JSON.stringify({ lat: coordinates.lat, lon: coordinates.lon }));
    } catch (err) {
      if (!navigator.onLine) {
        setError('You appear to be offline. Showing previously cached data if available.');
      } else {
        setError(err.message || 'Failed to fetch weather data for your location');
      }
    } finally {
      setLoading(false);
    }
  };

  const isNightFromData = weatherData?.localTime?.isDayTime === false;
  const isDarkEffective = autoTheme ? isNightFromData : darkMode;
  const heroGradient = weatherData
    ? getWeatherBackground(weatherData.weather.main, isDarkEffective)
    : '';

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300">
      {/* Dynamic Canvas Background Effects */}
      <WeatherEffects condition={weatherData?.weather?.main} isDark={isDarkEffective} />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-app-bg/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6 gap-4">
          {/* Logo */}
          <div 
            onClick={() => {
              setWeatherData(null);
              setForecastData(null);
              setError('');
              navigate('/');
            }}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
              <Cloud size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="hidden sm:block text-base font-semibold tracking-tight text-[var(--text-main)]">WeatherApp</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg">
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
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <LocationButton onLocationFound={handleLocationSearch} loading={loading} />

            <button
              onClick={() => setUnits(prev => prev === 'metric' ? 'imperial' : 'metric')}
              className="btn-ghost flex items-center gap-1.5"
            >
              <Thermometer size={14} />
              <span className="hidden sm:inline text-xs">{units === 'metric' ? '°C' : '°F'}</span>
            </button>

            <button
              onClick={() => setAutoTheme(prev => !prev)}
              className={`btn-ghost text-xs ${autoTheme ? 'text-brand-emerald' : ''}`}
              title={autoTheme ? 'Auto theme (follows day/night)' : 'Manual theme'}
            >
              {autoTheme ? '🔄' : '🎨'}
            </button>

            <DarkModeToggle
              darkMode={darkMode}
              onToggle={() => setDarkMode(prev => !prev)}
              autoTheme={autoTheme}
            />

            {weatherData && (
              <button
                onClick={() => setShowAlerts(prev => !prev)}
                className={`btn-ghost text-xs ${showAlerts ? 'text-brand-amber' : ''}`}
                title={showAlerts ? 'Hide alerts' : 'Show alerts'}
              >
                {showAlerts ? '🔔' : '🔕'}
              </button>
            )}
            {weatherData && (
              <PinCityButton city={weatherData.city} />
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex relative z-10">
        <Sidebar />

        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-6">

            {/* Alerts */}
            {showAlerts && weatherData && (
              <WeatherAlerts
                alerts={forecastData?.alerts}
                onDismiss={() => setShowAlerts(false)}
                showNoAlerts={false}
              />
            )}

            {/* Loading */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingSpinner />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && !loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <ErrorMessage message={error} onDismiss={() => setError(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={
                <>
                  <AnimatePresence mode="wait">
                    {weatherData && !loading && (
                      <motion.div
                        key="weather"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        <WeatherCard data={weatherData} heroGradient={heroGradient} />

                        {forecastData && (
                          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <HourlyTimeline data={forecastData} units={units} />
                          </motion.div>
                        )}

                        {forecastData && (
                          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <ForecastCard data={forecastData} />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!weatherData && !loading && !error && (
                    <div className="flex items-center justify-center min-h-[60vh] text-[var(--text-muted)] text-sm">
                      Please search for a city above to view the dashboard.
                    </div>
                  )}
                </>
              } />
              <Route path="/compare" element={<ComparePage units={units} />} />
              <Route path="/saved" element={
                <SavedCitiesPage units={units} onSelectCity={(city) => { handleSearch(city); navigate('/'); }} />
              } />
              <Route path="/radar" element={<RadarPage weatherData={weatherData} />} />
              <Route path="/history" element={<HistoryPage weatherData={weatherData} units={units} />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="hidden lg:block text-center py-6 text-xs text-slate-600 border-t border-white/[0.04]">
        <p>Weather data by WeatherAPI.com · Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;
