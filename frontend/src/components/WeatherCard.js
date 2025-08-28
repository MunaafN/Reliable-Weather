import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sunrise, 
  Sunset,
  Clock
} from 'lucide-react';
import { 
  getWeatherIcon, 
  getWindDirection, 
  formatTemperature,
  getTimeGreeting,
  getAQIColor,
  getAQIDescription,
  getPM25Level,
  getPM10Level,
  getO3Level,
  getNO2Level,
  getCOLevel
} from '../utils/weatherUtils';

const WeatherCard = ({ data }) => {
  if (!data) return null;

  const isDay = data?.localTime?.isDayTime !== undefined ? data.localTime.isDayTime : true;
  const greeting = getTimeGreeting();
  const weatherIcon = getWeatherIcon(data.weather.main, data.weather.icon);
  const displayIcon = !isDay ? (() => {
    const condition = (data.weather.main || '').toLowerCase();
    switch (condition) {
      case 'clear':
        return '🌙';
      case 'clouds':
      case 'mist':
      case 'fog':
      case 'haze':
        return '☁️';
      case 'rain':
      case 'drizzle':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      default:
        return '🌙';
    }
  })() : weatherIcon;
  const tempUnit = data?.units === 'imperial' ? 'F' : 'C';
  const windUnit = data?.units === 'imperial' ? 'mph' : 'm/s';
  const visibilityUnit = data?.units === 'imperial' ? 'miles' : 'km';

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // WeatherAPI astro times already formatted like "06:12 AM"; if ISO, format
    if (/[AP]M/i.test(timeString)) return timeString;
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const computeDayLength = (sunrise, sunset) => {
    if (!sunrise || !sunset) return null;
    // Parse "hh:mm AM/PM" safely without relying on local timezone
    const toMinutes = (t) => {
      const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
      if (!match) return null;
      let hours = parseInt(match[1], 10) % 12; // 12 -> 0
      const minutes = parseInt(match[2], 10);
      const isPm = match[3].toUpperCase() === 'PM';
      if (isPm) hours += 12;
      return hours * 60 + minutes;
    };
    const sr = toMinutes(sunrise);
    const ss = toMinutes(sunset);
    if (sr == null || ss == null) return null;
    const diff = ss - sr;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="weather-card p-6 md:p-8 text-white"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm text-white/80 mb-1">{greeting}</h2>
          <div className="flex items-center text-xl md:text-2xl font-semibold">
            <MapPin size={20} className="mr-2 text-white/80" />
            {data.city}, {data.country}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/80">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="text-sm text-white/60">
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Weather Display */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <motion.div
            className="text-6xl md:text-7xl mr-4"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            {displayIcon}
          </motion.div>
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2">
              {formatTemperature(data.temperature.current, tempUnit)}
            </div>
            <div className="text-lg text-white/80 capitalize">
              {data.weather.description}
            </div>
            <div className="text-sm text-white/60">
              Feels like {formatTemperature(data.temperature.feels_like, tempUnit)}
            </div>
          </div>
        </div>

        {/* High/Low Temperatures */}
        <div className="text-right">
          <div className="text-sm text-white/80 mb-1">Today</div>
          {data.temperature.max != null && data.temperature.min != null ? (
            <div className="text-lg">
              <span className="font-semibold">
                {formatTemperature(data.temperature.max, tempUnit)}
              </span>
              <span className="text-white/60 mx-2">/</span>
              <span className="text-white/80">
                {formatTemperature(data.temperature.min, tempUnit)}
              </span>
            </div>
          ) : (
            <div className="text-sm text-white/60">High/Low unavailable</div>
          )}
        </div>
      </motion.div>

      {/* Weather Details Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {/* Wind */}
        <motion.div 
          className="glass-effect rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Wind className="w-5 h-5 mx-auto mb-2 text-white/80" />
          <div className="text-xs text-white/60 mb-1">Wind</div>
          <div className="font-semibold">{data.wind.speed} {windUnit}</div>
          <div className="text-xs text-white/60">
            {getWindDirection(data.wind.direction)}
          </div>
        </motion.div>

        {/* Humidity */}
        <motion.div 
          className="glass-effect rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Droplets className="w-5 h-5 mx-auto mb-2 text-white/80" />
          <div className="text-xs text-white/60 mb-1">Humidity</div>
          <div className="font-semibold">{data.humidity}%</div>
        </motion.div>

        {/* Pressure */}
        <motion.div 
          className="glass-effect rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Gauge className="w-5 h-5 mx-auto mb-2 text-white/80" />
          <div className="text-xs text-white/60 mb-1">Pressure</div>
          <div className="font-semibold">{data.pressure}</div>
          <div className="text-xs text-white/60">hPa</div>
        </motion.div>

        {/* Visibility */}
        <motion.div 
          className="glass-effect rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Eye className="w-5 h-5 mx-auto mb-2 text-white/80" />
          <div className="text-xs text-white/60 mb-1">Visibility</div>
          <div className="font-semibold">
            {data.visibility ? `${data.visibility} ${visibilityUnit}` : 'N/A'}
          </div>
        </motion.div>
      </motion.div>

      {/* Sun Times */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center pt-4 border-t border-white/20"
      >
        <div className="flex items-center">
          <Sunrise className="w-5 h-5 mr-2 text-yellow-300" />
          <div>
            <div className="text-xs text-white/60">Sunrise</div>
            <div className="font-medium">{formatTime(data.astro?.sunrise)}</div>
          </div>
        </div>

        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-white/60" />
          <div className="text-sm text-white/80">
            {isDay ? 'Daytime' : 'Nighttime'}
          </div>
        </div>

        <div className="flex items-center">
          <Sunset className="w-5 h-5 mr-2 text-orange-300" />
          <div>
            <div className="text-xs text-white/60">Sunset</div>
            <div className="font-medium">{formatTime(data.astro?.sunset)}</div>
          </div>
        </div>
      </motion.div>

      {/* Day Length */}
      {data.astro?.sunrise && data.astro?.sunset && (
        <motion.div 
          variants={itemVariants}
          className="mt-3 text-center text-white/80"
        >
          Day length: {computeDayLength(data.astro.sunrise, data.astro.sunset)}
        </motion.div>
      )}

      {/* Air Quality */}
      {data.air_quality && (
        <motion.div 
          variants={itemVariants}
          className="mt-6"
        >
          <div className="mb-4 text-center">
            <h4 className="text-lg font-semibold text-white mb-2">Air Quality Index</h4>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-white font-medium"
                 style={{
                   backgroundColor: getAQIColor(data.air_quality.epa_index),
                   color: data.air_quality.epa_index >= 4 ? 'white' : 'black'
                 }}>
              {getAQIDescription(data.air_quality.epa_index)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'PM2.5', value: data.air_quality.pm2_5 },
            { label: 'PM10', value: data.air_quality.pm10 },
            { label: 'O₃', value: data.air_quality.o3 },
            { label: 'NO₂', value: data.air_quality.no2 },
            { label: 'CO', value: data.air_quality.co },
            { label: 'US EPA', value: data.air_quality.epa_index }
          ].map((item) => (
            <div key={item.label} className="glass-effect rounded-xl p-3 text-center">
              <div className="text-xs text-white/60">{item.label}</div>
              <div className="font-semibold">{item.value ?? '—'}</div>
              <div className="text-xs text-white/50 mt-1">
                {item.label === 'PM2.5' && item.value ? `${getPM25Level(item.value)}` : ''}
                {item.label === 'PM10' && item.value ? `${getPM10Level(item.value)}` : ''}
                {item.label === 'O₃' && item.value ? `${getO3Level(item.value)}` : ''}
                {item.label === 'NO₂' && item.value ? `${getNO2Level(item.value)}` : ''}
                {item.label === 'CO' && item.value ? `${getCOLevel(item.value)}` : ''}
              </div>
            </div>
          ))}
          </div>
        </motion.div>
      )}

      {/* Additional Info */}
      {data.cached && (
        <motion.div 
          variants={itemVariants}
          className="mt-4 text-center"
        >
          <div className="text-xs text-white/50 bg-white/10 rounded-full px-3 py-1 inline-block">
            ⚡ Cached data for faster loading
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WeatherCard;
