import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  getWeatherIcon, 
  formatTemperature, 
  formatDate,
  getWindDirection 
} from '../utils/weatherUtils';

const ForecastCard = ({ data }) => {
  if (!data || !data.forecast) return null;

  const tempUnit = data?.units === 'imperial' ? 'F' : 'C';

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
      <motion.div variants={itemVariants} className="flex items-center mb-6">
        <Calendar className="w-6 h-6 mr-3 text-white/80" />
        <div>
          <h3 className="text-xl md:text-2xl font-bold">7-Day Forecast</h3>
          <p className="text-white/80">
            {data.city}, {data.country}
          </p>
        </div>
      </motion.div>

      {/* Forecast Items */}
      <div className="space-y-4">
        {data.forecast.map((day, index) => (
          <motion.div
            key={day.date}
            variants={itemVariants}
            className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
            whileHover={{ 
              scale: 1.02,
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              {/* Date and Weather Icon */}
              <div className="flex items-center space-x-4">
                <div className="text-sm md:text-base font-medium w-20 md:w-24">
                  {formatDate(day.date)}
                </div>
                
                <motion.div 
                  className="text-2xl md:text-3xl"
                  animate={{ 
                    rotate: [0, 5, -5, 0] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: index * 0.5 + 3
                  }}
                >
                  {getWeatherIcon(day.weather.main, day.weather.icon)}
                </motion.div>
                
                <div className="hidden md:block">
                  <div className="text-sm text-white/80 capitalize">
                    {day.weather.description}
                  </div>
                </div>
              </div>

              {/* Temperature Range */}
              <div className="flex items-center space-x-6">
                {/* Mobile: Simplified View */}
                <div className="md:hidden">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatTemperature(day.temperature.max, tempUnit)}
                    </div>
                    <div className="text-white/60 text-sm">
                      {formatTemperature(day.temperature.min, tempUnit)}
                    </div>
                  </div>
                </div>

                {/* Desktop: Detailed View */}
                <div className="hidden md:flex items-center space-x-4">
                  {/* Temperature Trend */}
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-red-300" />
                    <span className="font-bold text-lg">
                      {formatTemperature(day.temperature.max, tempUnit)}
                    </span>
                  </div>
                  
                  <div className="text-white/40">/</div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-blue-300" />
                    <span className="text-white/80">
                      {formatTemperature(day.temperature.min, tempUnit)}
                    </span>
                  </div>

                  {/* Additional Details */}
                  <div className="text-right text-sm text-white/60 min-w-0">
                    <div>💧 {day.humidity}%</div>
                    <div>💨 {day.wind.speed} m/s {getWindDirection(day.wind.direction)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: Additional Details (Collapsible) */}
            <div className="md:hidden mt-3 pt-3 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4 text-xs text-white/70">
                <div>
                  <span className="text-white/80 capitalize">{day.weather.description}</span>
                </div>
                <div className="text-right">
                  💧 {day.humidity}% • 💨 {day.wind.speed} m/s
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Statistics */}
      <motion.div 
        variants={itemVariants}
        className="mt-6 pt-6 border-t border-white/20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-white/60 mb-1">Avg High</div>
            <div className="font-semibold">
              {formatTemperature(
                Math.round(
                  data.forecast.reduce((sum, day) => sum + day.temperature.max, 0) / 
                  data.forecast.length
                )
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-white/60 mb-1">Avg Low</div>
            <div className="font-semibold">
              {formatTemperature(
                Math.round(
                  data.forecast.reduce((sum, day) => sum + day.temperature.min, 0) / 
                  data.forecast.length
                )
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-white/60 mb-1">Avg Humidity</div>
            <div className="font-semibold">
              {Math.round(
                data.forecast.reduce((sum, day) => sum + day.humidity, 0) / 
                data.forecast.length
              )}%
            </div>
          </div>
          
          <div>
            <div className="text-xs text-white/60 mb-1">Avg Wind</div>
            <div className="font-semibold">
              {Math.round(
                (data.forecast.reduce((sum, day) => sum + day.wind.speed, 0) / 
                data.forecast.length) * 10
              ) / 10} m/s
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cached Data Indicator */}
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

export default ForecastCard;
