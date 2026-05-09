import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Plus, Trash2, Droplets, Wind, Thermometer, Cloud, Eye, Sun } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';
import { getWeatherIcon, formatTemperature } from '../utils/weatherUtils';

const WeatherComparison = ({ onClose, units = 'metric' }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const maxCities = 4;

  const addCity = async (name) => {
    if (!name.trim() || cities.length >= maxCities) return;
    if (cities.find(c => c.name.toLowerCase() === name.toLowerCase())) { setError('City already added'); setTimeout(() => setError(null), 2000); return; }
    setLoading(true); setError(null);
    try {
      const [current, forecast] = await Promise.all([weatherApi.getCurrentWeather(name, units), weatherApi.getForecast(name, units)]);
      setCities(p => [...p, { id: Date.now(), name: current.city, current, forecast, timestamp: new Date() }]);
    } catch { setError(`Could not find "${name}"`); setTimeout(() => setError(null), 3000); }
    finally { setLoading(false); }
  };

  const removeCity = (id) => setCities(p => p.filter(c => c.id !== id));

  useEffect(() => {
    if (cities.length === 0) return;
    // Refresh cities when units change
    const refreshAll = async () => {
      try {
        const updated = await Promise.all(cities.map(async c => {
          const [current, forecast] = await Promise.all([weatherApi.getCurrentWeather(c.name, units), weatherApi.getForecast(c.name, units)]);
          return { ...c, current, forecast, timestamp: new Date() };
        }));
        setCities(updated);
      } catch {}
    };
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  const tempUnit = units === 'imperial' ? 'F' : 'C';
  const windUnit = units === 'imperial' ? 'mph' : 'm/s';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Add city */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { addCity(input.trim()); setInput(''); } }}
          placeholder="Add city to compare..."
          className="input-field flex-1"
          disabled={loading || cities.length >= maxCities}
        />
        <button
          onClick={() => { if (input.trim()) { addCity(input.trim()); setInput(''); } }}
          disabled={loading || !input.trim() || cities.length >= maxCities}
          className="btn-primary flex items-center gap-1.5 disabled:opacity-40"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {error && <p className="text-xs text-brand-red">{error}</p>}

      {/* City cards */}
      {cities.length === 0 ? (
        <div className="text-center py-16">
          <GitCompare size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400">Add cities to compare weather</p>
          <p className="text-xs text-slate-600 mt-1">Up to {maxCities} cities side by side</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cities.map((city, i) => (
            <motion.div key={city.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="weather-card p-5 relative group"
            >
              <button onClick={() => removeCity(city.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-brand-red transition-all">
                <Trash2 size={13} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{getWeatherIcon(city.current.weather.main, city.current.weather.icon)}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{city.current.city}</h4>
                  <p className="text-[10px] text-slate-500">{city.current.country}</p>
                </div>
              </div>

              <div className="text-3xl font-bold text-white mb-1">{formatTemperature(city.current.temperature.current, tempUnit)}</div>
              <p className="text-xs text-slate-400 capitalize mb-4">{city.current.weather.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { icon: Thermometer, l: 'Feels', v: formatTemperature(city.current.temperature.feels_like, tempUnit) },
                  { icon: Droplets, l: 'Humidity', v: `${city.current.humidity}%` },
                  { icon: Wind, l: 'Wind', v: `${city.current.wind.speed} ${windUnit}` },
                  { icon: Eye, l: 'Visibility', v: `${city.current.visibility} ${units==='imperial'?'mi':'km'}` },
                  { icon: Sun, l: 'UV', v: city.current.uv },
                  { icon: Cloud, l: 'Clouds', v: `${city.current.clouds}%` },
                ].map(({ icon: I, l, v }) => (
                  <div key={l} className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/[0.03]">
                    <I size={11} className="text-slate-500" />
                    <span className="text-slate-500">{l}</span>
                    <span className="text-white font-medium ml-auto">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom input */}
      {cities.length > 0 && cities.length < maxCities && (
        <input
          type="text"
          placeholder="Add another city..."
          onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { addCity(e.target.value.trim()); e.target.value = ''; } }}
          className="input-field text-center text-xs"
        />
      )}
    </motion.div>
  );
};

export default WeatherComparison;
