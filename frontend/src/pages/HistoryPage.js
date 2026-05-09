import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle } from 'lucide-react';
import { weatherApi } from '../services/weatherApi';
import { getWeatherIcon, formatTemperature } from '../utils/weatherUtils';
import HourlyChart from '../components/HourlyChart';

const HistoryPage = ({ weatherData, units }) => {
  // Default to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!weatherData?.city) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await weatherApi.getHistory(weatherData.city, date, units);
        setHistoryData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch historical data');
        setHistoryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [weatherData?.city, date, units]);

  if (!weatherData?.city) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Calendar size={48} className="text-slate-600 mb-4" />
        <p className="text-slate-400">Search for a city first to view its historical data.</p>
      </div>
    );
  }

  // Calculate limits (can only look back ~1-12 months depending on API tier, we'll allow 1 year)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - 1); // Can't select today for history
  const maxDateStr = maxDate.toISOString().split('T')[0];
  
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={24} className="text-brand-purple" /> 
            Historical Weather
          </h2>
          <p className="text-sm text-slate-400">See past weather conditions for {weatherData.city}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={date}
            min={minDateStr}
            max={maxDateStr}
            onChange={(e) => setDate(e.target.value)}
            className="input-field bg-white/[0.04] border-white/10"
          />
        </div>
      </div>

      {loading ? (
        <div className="weather-card p-8 flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-purple"></div>
        </div>
      ) : error ? (
        <div className="weather-card p-6 flex flex-col items-center justify-center min-h-[200px] text-center border-brand-red/20">
          <AlertCircle size={32} className="text-brand-red mb-3" />
          <p className="text-brand-red font-medium">{error}</p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">Note: Free WeatherAPI tiers are often limited to 7 days of history.</p>
        </div>
      ) : historyData ? (
        <div className="space-y-4">
          <div className="weather-card p-6">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getWeatherIcon(historyData.summary.condition)}</span>
                <div>
                  <h3 className="text-3xl font-bold text-white">{formatTemperature(historyData.summary.avgTemp, units === 'imperial' ? 'F' : 'C')}</h3>
                  <p className="text-sm text-slate-400">{historyData.summary.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <div className="flex gap-3 text-xs text-slate-400 mt-1 justify-end">
                  <span>H: {formatTemperature(historyData.summary.maxTemp, units === 'imperial' ? 'F' : 'C')}</span>
                  <span>L: {formatTemperature(historyData.summary.minTemp, units === 'imperial' ? 'F' : 'C')}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Max Wind</p>
                <p className="text-sm font-semibold text-white">{historyData.summary.maxWind} {units === 'imperial' ? 'mph' : 'kph'}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Total Precip</p>
                <p className="text-sm font-semibold text-white">{historyData.summary.totalPrecip} mm</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Avg Visibility</p>
                <p className="text-sm font-semibold text-white">{historyData.summary.avgVis} {units === 'imperial' ? 'mi' : 'km'}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Avg Humidity</p>
                <p className="text-sm font-semibold text-white">{historyData.summary.humidity}%</p>
              </div>
            </div>
          </div>

          <div className="weather-card p-6">
            <h3 className="text-sm font-semibold text-white mb-6">Hourly Trend on this Day</h3>
            {/* Reusing HourlyChart */}
            <HourlyChart 
              hours={historyData.hourly.map(h => ({
                temp: h.temp,
                time: h.time,
                rainChance: h.precip > 0 ? 100 : 0, // Mock rain chance since history only has absolute precip
                condition: h.condition
              }))} 
              units={units} 
            />
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default HistoryPage;
