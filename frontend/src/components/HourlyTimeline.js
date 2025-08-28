import React from 'react';
import { motion } from 'framer-motion';
import { getWeatherIcon, formatDate } from '../utils/weatherUtils';

const HourlyTimeline = ({ data, units = 'metric' }) => {
  if (!data || !data.forecast || data.forecast.length === 0) return null;

  // Use first day if current day present
  const today = data.forecast[0];
  const hours = today.hourlyData || [];

  if (!hours || hours.length === 0) return null;

  const tempUnit = units === 'imperial' ? 'F' : 'C';
  const windUnit = units === 'imperial' ? 'mph' : 'm/s';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="weather-card p-4 md:p-6 text-white overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-white/80">Hourly</div>
          <div className="text-lg font-semibold">{formatDate(today.date)}</div>
        </div>
        <div className="text-sm text-white/60">{data.city}, {data.country}</div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {hours.map((h) => {
            const timeLabel = new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={h.timeEpoch} className="glass-effect rounded-2xl p-3 w-28 text-center shrink-0">
                <div className="text-xs text-white/60 mb-1">{timeLabel}</div>
                <div className="text-2xl mb-1">{getWeatherIcon(h.condition, null)}</div>
                <div className="font-semibold">{Math.round(h.temp)}°{tempUnit}</div>
                <div className="text-xs text-white/70 mt-1">💨 {h.windSpeed} {windUnit}</div>
                <div className="text-xs text-white/50">🌧️ {h.rainChance || 0}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default HourlyTimeline;


