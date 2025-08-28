import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';
import { getWeatherIcon, formatTemperature, getWindDirection } from '../utils/weatherUtils';

const WeatherComparison = ({ onClose }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxCities] = useState(4);

  const addCity = async (cityName) => {
    if (cities.length >= maxCities) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [current, forecast] = await Promise.all([
        weatherApi.getCurrentWeather(cityName),
        weatherApi.getForecast(cityName)
      ]);
      
      const newCity = {
        id: Date.now(),
        name: cityName,
        current,
        forecast,
        timestamp: new Date()
      };
      
      setCities(prev => [...prev, newCity]);
    } catch (err) {
      setError(`Failed to add ${cityName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeCity = (cityId) => {
    setCities(prev => prev.filter(city => city.id !== cityId));
  };



  const refreshAll = async () => {
    if (cities.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedCities = await Promise.all(
        cities.map(async (city) => {
          const [current, forecast] = await Promise.all([
            weatherApi.getCurrentWeather(city.name),
            weatherApi.getForecast(city.name)
          ]);
          return { ...city, current, forecast, timestamp: new Date() };
        })
      );
      
      setCities(updatedCities);
    } catch (err) {
      setError('Failed to refresh some cities');
    } finally {
      setLoading(false);
    }
  };

  if (cities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="weather-card p-8 text-center"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Weather Comparison</h3>
        <p className="text-white/80 mb-6">
          Compare weather conditions between multiple cities
        </p>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter city name..."
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                addCity(e.target.value.trim());
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => onClose()}
            className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="weather-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Weather Comparison</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-lg transition"
          >
            {loading ? 'Refreshing...' : 'Refresh All'}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cities.map((city) => (
          <motion.div
            key={city.id}
            layout
            className="glass-effect rounded-xl p-4 relative"
          >
            <button
              onClick={() => removeCity(city.id)}
              className="absolute top-2 right-2 text-white/60 hover:text-white transition"
            >
              <X size={16} />
            </button>
            
            <div className="text-center mb-3">
              <h4 className="font-semibold text-white text-lg">{city.current.city}</h4>
              <p className="text-white/60 text-sm">{city.current.country}</p>
            </div>
            
            <div className="flex items-center justify-center mb-3">
              <div className="text-4xl">
                {getWeatherIcon(city.current.weather.main, city.current.weather.icon)}
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold text-white">
                  {formatTemperature(city.current.temperature.current)}
                </div>
                <div className="text-sm text-white/60">
                  Feels like {formatTemperature(city.current.temperature.feels_like)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Condition:</span>
                <span className="text-white capitalize">{city.current.weather.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Humidity:</span>
                <span className="text-white">{city.current.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Wind:</span>
                <span className="text-white">
                  {city.current.wind.speed} {city.current.units === 'imperial' ? 'mph' : 'm/s'} {getWindDirection(city.current.wind.direction)}
                </span>
              </div>
              {city.current.temperature.max != null && city.current.temperature.min != null && (
                <div className="flex justify-between">
                  <span className="text-white/60">High/Low:</span>
                  <span className="text-white">
                    {formatTemperature(city.current.temperature.max)} / {formatTemperature(city.current.temperature.min)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-white/40 text-center">
              Updated: {city.timestamp.toLocaleTimeString()}
            </div>
          </motion.div>
        ))}
      </div>

      {cities.length < maxCities && (
        <div className="text-center">
          <input
            type="text"
            placeholder="Add another city..."
            className="w-full max-w-xs px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                addCity(e.target.value.trim());
                e.target.value = '';
              }
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default WeatherComparison;
