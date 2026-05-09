import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Droplets } from 'lucide-react';
import { getWeatherIcon, formatTemperature, formatDate } from '../utils/weatherUtils';

const ForecastCard = ({ data }) => {
  if (!data?.forecast) return null;
  const tempUnit = data?.units === 'imperial' ? 'F' : 'C';
  const windUnit = data?.units === 'imperial' ? 'mph' : 'm/s';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="weather-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays size={16} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-white">7-Day Forecast</h3>
        <span className="text-xs text-slate-500 ml-auto">{data.city}</span>
      </div>

      <div className="space-y-1">
        {data.forecast.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
          >
            {/* Date */}
            <span className="text-xs font-medium text-slate-300 w-16 shrink-0">{formatDate(day.date)}</span>

            {/* Icon */}
            <span className="text-xl w-8 text-center">{getWeatherIcon(day.weather.main, day.weather.icon)}</span>

            {/* Condition */}
            <span className="text-xs text-slate-400 capitalize hidden md:block w-28 truncate">{day.weather.description}</span>

            {/* Rain chance */}
            <div className="flex items-center gap-1 text-xs text-blue-400/70 w-12 hidden sm:flex">
              <Droplets size={10} />
              <span>{day.rain_chance || 0}%</span>
            </div>

            {/* Temp bar */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-xs text-slate-500 w-8 text-right">{formatTemperature(day.temperature.min, tempUnit)}</span>
              <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                  style={{ width: `${Math.min(100, Math.max(20, ((day.temperature.max - day.temperature.min) / 40) * 100))}%` }}
                />
              </div>
              <span className="text-xs font-medium text-white w-8">{formatTemperature(day.temperature.max, tempUnit)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
        {[
          { label: 'Avg High', value: formatTemperature(Math.round(data.forecast.reduce((s,d) => s+d.temperature.max,0)/data.forecast.length), tempUnit) },
          { label: 'Avg Low', value: formatTemperature(Math.round(data.forecast.reduce((s,d) => s+d.temperature.min,0)/data.forecast.length), tempUnit) },
          { label: 'Avg Humidity', value: `${Math.round(data.forecast.reduce((s,d) => s+d.humidity,0)/data.forecast.length)}%` },
          { label: 'Avg Wind', value: `${Math.round(data.forecast.reduce((s,d) => s+d.wind.speed,0)/data.forecast.length*10)/10} ${windUnit}` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ForecastCard;
