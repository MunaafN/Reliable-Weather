import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, ExternalLink } from 'lucide-react';

const WeatherRadar = ({ lat, lon, city }) => {
  const [radarType, setRadarType] = useState('rain');
  const defaultLat = lat || 28.6;
  const defaultLon = lon || 77.2;

  const types = [
    { key: 'rain', label: 'Rain', layer: 'precipitation_new' },
    { key: 'clouds', label: 'Clouds', layer: 'clouds_new' },
    { key: 'temp', label: 'Temperature', layer: 'temp_new' },
    { key: 'wind', label: 'Wind', layer: 'wind_new' },
  ];

  // Windy.com embed URL — professional radar with animation
  const windyUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&gust=false&detail=false&forecast=current&pressure=false&message=true&calendar=now&lat=${defaultLat}&lon=${defaultLon}&zoom=7&level=surface&overlay=${radarType}&menu=&wpan=&gParticles=&sParticles=`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Radio size={18} className="text-brand-cyan" /> Weather Radar
        </h3>
        {city && <span className="text-xs text-slate-500">{city}</span>}
      </div>

      {/* Layer toggles */}
      <div className="flex gap-1.5 flex-wrap">
        {types.map(t => (
          <button key={t.key} onClick={() => setRadarType(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${radarType === t.key
              ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
              : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-transparent'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Radar map */}
      <div className="weather-card overflow-hidden" style={{ height: '450px' }}>
        <iframe
          key={radarType}
          src={windyUrl}
          title="Weather Radar"
          className="w-full h-full border-0 rounded-3xl"
          loading="lazy"
          allowFullScreen
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span>Powered by Windy.com</span>
        <a href={`https://www.windy.com/${defaultLat}/${defaultLon}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-brand-blue hover:underline">
          Open full map <ExternalLink size={9} />
        </a>
      </div>
    </motion.div>
  );
};

export default WeatherRadar;
