import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MapPin, RefreshCw, Plus } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';
import { getWeatherIcon, formatTemperature } from '../utils/weatherUtils';

const MAX_CITIES = 6;
const STORAGE_KEY = 'weatherSavedCities';

export const getSavedCities = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
export const saveCity = (city) => {
  const saved = getSavedCities();
  if (saved.find(c => c.toLowerCase() === city.toLowerCase())) return saved;
  const updated = [city, ...saved].slice(0, MAX_CITIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
export const removeCity = (city) => {
  const updated = getSavedCities().filter(c => c.toLowerCase() !== city.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
export const isCitySaved = (city) => getSavedCities().some(c => c.toLowerCase() === city.toLowerCase());

// Pin/Unpin button for navbar/WeatherCard
export const PinCityButton = ({ city, onChange }) => {
  const [pinned, setPinned] = useState(false);
  useEffect(() => { setPinned(isCitySaved(city)); }, [city]);
  const toggle = () => {
    if (pinned) { removeCity(city); setPinned(false); }
    else { saveCity(city); setPinned(true); }
    onChange?.();
  };
  if (!city) return null;
  return (
    <button onClick={toggle} title={pinned ? 'Unpin city' : 'Pin city'}
      className={`btn-ghost text-xs flex items-center gap-1 ${pinned ? 'text-brand-amber' : ''}`}>
      <Star size={13} fill={pinned ? 'currentColor' : 'none'} />
    </button>
  );
};

// Full saved cities page
const SavedCities = ({ onSelectCity, units = 'metric' }) => {
  const [cities, setCities] = useState(getSavedCities());
  const [weatherMap, setWeatherMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const fetchAll = async () => {
    if (cities.length === 0) return;
    setLoading(true);
    const results = {};
    await Promise.allSettled(cities.map(async city => {
      try {
        results[city] = await weatherApi.getCurrentWeather(city, units);
      } catch {}
    }));
    setWeatherMap(results);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [cities.length, units]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = (name) => {
    if (!name.trim()) return;
    const updated = saveCity(name.trim());
    setCities(updated);
    setInput('');
  };
  const handleRemove = (city) => {
    const updated = removeCity(city);
    setCities(updated);
    const copy = { ...weatherMap }; delete copy[city]; setWeatherMap(copy);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Star size={18} className="text-brand-amber" /> Saved Cities
        </h3>
        <button onClick={fetchAll} disabled={loading} className="btn-ghost text-xs flex items-center gap-1">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Add city */}
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(input); }}
          placeholder="Pin a city..." className="input-field flex-1" disabled={cities.length >= MAX_CITIES}
        />
        <button onClick={() => handleAdd(input)} disabled={!input.trim() || cities.length >= MAX_CITIES}
          className="btn-primary flex items-center gap-1 disabled:opacity-40"><Plus size={14} />Pin</button>
      </div>

      {cities.length === 0 ? (
        <div className="text-center py-16">
          <Star size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400">No saved cities yet</p>
          <p className="text-xs text-slate-600 mt-1">Pin up to {MAX_CITIES} cities for quick access</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {cities.map((city, i) => {
              const w = weatherMap[city];
              return (
                <motion.div key={city} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  className="weather-card p-4 cursor-pointer group hover:border-white/[0.12] transition-all"
                  onClick={() => onSelectCity?.(city)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-slate-500" />
                      <span className="text-sm font-medium text-white">{city}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleRemove(city); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-brand-red transition-all"><X size={13} /></button>
                  </div>
                  {w ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getWeatherIcon(w.weather.main, w.weather.icon)}</span>
                        <div>
                          <p className="text-xl font-bold text-white">{formatTemperature(w.temperature.current, units === 'imperial' ? 'F' : 'C')}</p>
                          <p className="text-[10px] text-slate-500 capitalize">{w.weather.description}</p>
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-500">
                        <p>H: {formatTemperature(w.temperature.max, units === 'imperial' ? 'F' : 'C')}</p>
                        <p>L: {formatTemperature(w.temperature.min, units === 'imperial' ? 'F' : 'C')}</p>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="skeleton h-10 rounded-lg" />
                  ) : (
                    <p className="text-xs text-slate-600">Tap to load</p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default SavedCities;
