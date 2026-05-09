import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Clock, Sun, Shield } from 'lucide-react';
import { getWeatherIcon, getWindDirection, formatTemperature, getTimeGreeting, getAQIColor, getAQIDescription, getPM25Level, getUVDescription } from '../utils/weatherUtils';

const WeatherCard = ({ data, heroGradient }) => {
  if (!data) return null;
  const isDay = data?.localTime?.isDayTime !== undefined ? data.localTime.isDayTime : true;
  const greeting = getTimeGreeting(data?.localTime?.time);
  const weatherIcon = getWeatherIcon(data.weather.main, data.weather.icon);
  const tempUnit = data?.units === 'imperial' ? 'F' : 'C';
  const windUnit = data?.units === 'imperial' ? 'mph' : 'm/s';
  const visUnit = data?.units === 'imperial' ? 'mi' : 'km';

  const formatCityDate = () => {
    const lt = data?.localTime?.time;
    if (!lt) return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const d = new Date(lt.replace(' ', 'T'));
    return isNaN(d) ? lt : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };
  const formatCityTime = () => {
    const lt = data?.localTime?.time;
    if (!lt) return '';
    const m = lt.match(/(\d{1,2}:\d{2})\s*$/);
    return m ? m[1] : '';
  };
  const formatTime = (t) => {
    if (!t) return 'N/A';
    if (/[AP]M/i.test(t)) return t;
    return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const computeDayLength = (sr, ss) => {
    if (!sr || !ss) return null;
    const toMin = (t) => { const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim()); if (!m) return null; let h = parseInt(m[1],10)%12; if (m[3].toUpperCase()==='PM') h+=12; return h*60+parseInt(m[2],10); };
    const a = toMin(sr), b = toMin(ss);
    if (a==null||b==null||b-a<=0) return null;
    return `${Math.floor((b-a)/60)}h ${(b-a)%60}m`;
  };

  const uvInfo = getUVDescription(data.uv || 0);
  const stats = [
    { icon: Wind, label: 'Wind', value: `${data.wind.speed} ${windUnit}`, sub: getWindDirection(data.wind.direction) },
    { icon: Droplets, label: 'Humidity', value: `${data.humidity}%` },
    { icon: Gauge, label: 'Pressure', value: `${data.pressure}`, sub: 'hPa' },
    { icon: Eye, label: 'Visibility', value: `${data.visibility || '–'} ${visUnit}` },
    { icon: Sun, label: 'UV Index', value: data.uv, sub: uvInfo.level },
    { icon: Shield, label: 'Clouds', value: `${data.clouds}%` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Hero */}
      <div className={`relative overflow-hidden rounded-3xl ${heroGradient || 'bg-default-gradient'} p-6 md:p-8`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          {/* Top row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/60 text-xs font-medium mb-1">{greeting}</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <MapPin size={16} className="text-white/70" />
                {data.city}, {data.country}
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">{formatCityDate()}</p>
              <p className="text-white/40 text-xs">{formatCityTime()}</p>
            </div>
          </div>

          {/* Main temp */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.span animate={{ y: [0,-4,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="text-5xl md:text-7xl">
                {weatherIcon}
              </motion.span>
              <div>
                <div className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none">
                  {formatTemperature(data.temperature.current, tempUnit)}
                </div>
                <p className="text-white/80 text-sm capitalize mt-1">{data.weather.description}</p>
                <p className="text-white/50 text-xs mt-0.5">Feels like {formatTemperature(data.temperature.feels_like, tempUnit)}</p>
              </div>
            </div>
            {data.temperature.max != null && data.temperature.min != null && (
              <div className="text-right hidden sm:block">
                <p className="text-white/50 text-xs mb-1">Today</p>
                <p className="text-white font-semibold">{formatTemperature(data.temperature.max, tempUnit)}</p>
                <p className="text-white/60 text-sm">{formatTemperature(data.temperature.min, tempUnit)}</p>
              </div>
            )}
          </div>

          {/* Sun times */}
          <div className="flex items-center justify-between text-sm border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <Sunrise size={14} className="text-amber-300" />
              <div><p className="text-white/50 text-[10px]">Sunrise</p><p className="text-white text-xs font-medium">{formatTime(data.astro?.sunrise)}</p></div>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Clock size={12} />
              <span>{isDay ? 'Day' : 'Night'}</span>
              {data.astro?.sunrise && data.astro?.sunset && <span className="text-white/30">· {computeDayLength(data.astro.sunrise, data.astro.sunset)}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Sunset size={14} className="text-orange-300" />
              <div><p className="text-white/50 text-[10px]">Sunset</p><p className="text-white text-xs font-medium">{formatTime(data.astro?.sunset)}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {stats.map(({ icon: Icon, label, value, sub }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }} className="stat-card text-center">
            <Icon size={14} className="mx-auto mb-1.5 text-[var(--text-muted)]" strokeWidth={1.5} />
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-[var(--text-main)]">{value}</p>
            {sub && <p className="text-[10px] text-[var(--text-muted)]">{sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* AQI */}
      {data.air_quality && (
        <div className="weather-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-[var(--text-main)]">Air Quality</h4>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: getAQIColor(data.air_quality.epa_index) + '20', color: getAQIColor(data.air_quality.epa_index) }}>
              {getAQIDescription(data.air_quality.epa_index)}
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { l: 'PM2.5', v: data.air_quality.pm2_5, fn: getPM25Level },
              { l: 'PM10', v: data.air_quality.pm10 },
              { l: 'O₃', v: data.air_quality.o3 },
              { l: 'NO₂', v: data.air_quality.no2 },
              { l: 'CO', v: data.air_quality.co },
              { l: 'EPA', v: data.air_quality.epa_index },
            ].map(item => (
              <div key={item.l} className="stat-card text-center py-3">
                <p className="text-[10px] text-[var(--text-muted)] mb-1 font-medium">{item.l}</p>
                <p className="text-sm font-semibold text-[var(--text-main)]">{item.v ? Math.round(item.v * 10)/10 : 'N/A'}</p>
                {item.fn && <p className="text-[10px] mt-1 text-[var(--text-muted)]">{item.fn(item.v)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WeatherCard;
