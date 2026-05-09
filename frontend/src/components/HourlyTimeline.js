import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, List } from 'lucide-react';
import { getWeatherIcon, formatDate } from '../utils/weatherUtils';
import HourlyChart from './HourlyChart';

const HourlyTimeline = ({ data, units = 'metric' }) => {
  const [view, setView] = useState('chart'); // 'chart' | 'cards'
  
  if (!data?.forecast?.length) return null;
  const hours = data.forecast[0]?.hourlyData || [];
  if (!hours.length) return null;
  const tempUnit = units === 'imperial' ? 'F' : 'C';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="weather-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-main)]">Hourly Forecast</h3>
          <p className="text-xs text-[var(--text-muted)]">{formatDate(data.forecast[0].date)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setView('chart')} className={`p-1.5 rounded-lg transition-colors ${view === 'chart' ? 'bg-[var(--element-bg)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
            <BarChart3 size={14} />
          </button>
          <button onClick={() => setView('cards')} className={`p-1.5 rounded-lg transition-colors ${view === 'cards' ? 'bg-[var(--element-bg)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
            <List size={14} />
          </button>
        </div>
      </div>

      {view === 'chart' ? (
        <HourlyChart hours={hours} units={units} />
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex gap-2 min-w-max pb-1">
            {hours.map((h) => {
              const t = new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              return (
                <motion.div key={h.timeEpoch} whileHover={{ scale: 1.04 }} className="glass-effect p-3 w-[72px] text-center shrink-0 cursor-default">
                  <p className="text-[10px] text-[var(--text-muted)] mb-1">{t}</p>
                  <p className="text-lg mb-0.5">{getWeatherIcon(h.condition, null)}</p>
                  <p className="text-xs font-semibold text-[var(--text-main)]">{Math.round(h.temp)}°{tempUnit}</p>
                  <p className="text-[10px] text-brand-blue mt-1 opacity-80">🌧 {h.rainChance || 0}%</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HourlyTimeline;
