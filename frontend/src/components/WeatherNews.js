import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Globe, TrendingUp, RefreshCw } from 'lucide-react';

const WeatherNews = ({ onClose, cityName, countryName, isPage = false }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('weather');

  const fetchWeatherNews = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const mockNews = generateWeatherNews(cityName, countryName, selectedCategory);
      await new Promise(r => setTimeout(r, 600));
      setNews(mockNews);
    } catch { setError('Failed to fetch weather news.'); }
    finally { setLoading(false); }
  }, [cityName, countryName, selectedCategory]);

  const generateWeatherNews = (city, country, category) => {
    const base = [
      { id: 1, title: `Latest Weather Updates for ${city}, ${country}`, description: `Stay informed about current weather conditions, forecasts, and alerts in ${city}. Meteorologists are closely monitoring weather patterns.`, source: 'Local Weather Service', publishedAt: new Date(Date.now()-2*3600000).toISOString(), url: 'https://www.weather.gov/', category: 'weather' },
      { id: 2, title: `Seasonal Weather Patterns in ${city}`, description: `Understanding typical weather patterns for ${city} during this time of year helps residents prepare for seasonal changes.`, source: 'Climate Research Institute', publishedAt: new Date(Date.now()-4*3600000).toISOString(), url: 'https://www.climate.gov/', category: 'seasonal' },
      { id: 3, title: `Climate Change Impact on ${city} Weather`, description: `Recent studies show how climate change affects weather patterns in ${city} and surrounding regions.`, source: 'Environmental Research', publishedAt: new Date(Date.now()-6*3600000).toISOString(), url: 'https://www.epa.gov/climate-change', category: 'climate' },
      { id: 4, title: `Extreme Weather Preparedness in ${city}`, description: `Local authorities implementing new measures to prepare for extreme weather events.`, source: 'Emergency Management', publishedAt: new Date(Date.now()-8*3600000).toISOString(), url: 'https://www.ready.gov/', category: 'natural' },
      { id: 5, title: `Weather Technology Advances in ${city}`, description: `New monitoring technology being deployed for more accurate forecasts and early warning systems.`, source: 'Met Tech Institute', publishedAt: new Date(Date.now()-12*3600000).toISOString(), url: 'https://www.noaa.gov/', category: 'weather' },
    ];
    return category !== 'all' ? base.filter(i => i.category === category) : base;
  };

  useEffect(() => { fetchWeatherNews(); }, [fetchWeatherNews]);

  const timeAgo = (d) => {
    const h = Math.floor((Date.now() - new Date(d)) / 3600000);
    if (h < 1) return 'Just now';
    if (h === 1) return '1h ago';
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return days === 1 ? '1d ago' : `${days}d ago`;
  };

  const categories = [
    { key: 'all', label: 'All', icon: '📰' },
    { key: 'weather', label: 'Weather', icon: '🌤️' },
    { key: 'climate', label: 'Climate', icon: '🌍' },
    { key: 'natural', label: 'Disasters', icon: '⚠️' },
    { key: 'seasonal', label: 'Seasonal', icon: '🍂' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header + disclaimer */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Globe size={18} className="text-brand-blue" /> Weather News</h3>
          <p className="text-xs text-slate-500 mt-0.5">{cityName || 'Global'} · <span className="text-slate-600">Demo content</span></p>
        </div>
        {!isPage && onClose && <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={16} /></button>}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => (
          <button key={c.key} onClick={() => setSelectedCategory(c.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === c.key ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-transparent'}`}
          >
            <span className="mr-1">{c.icon}</span>{c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center py-12">
          <div className="skeleton w-8 h-8 rounded-full mb-3" />
          <p className="text-xs text-slate-500">Fetching news...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-xs text-brand-red mb-3">{error}</p>
          <button onClick={fetchWeatherNews} className="btn-primary text-xs">Retry</button>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-xs">No articles in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {news.map(a => (
            <motion.article key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="glass-effect p-4 hover:bg-white/[0.05] transition-colors group cursor-pointer"
              onClick={() => window.open(a.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-medium text-white leading-snug">{a.title}</h4>
                <span className="text-[10px] text-slate-500 shrink-0">{timeAgo(a.publishedAt)}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">{a.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 flex items-center gap-1"><TrendingUp size={9} />{a.source}</span>
                <ExternalLink size={12} className="text-slate-600 group-hover:text-brand-blue transition-colors" />
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <p className="text-[10px] text-slate-600">Updated {new Date().toLocaleTimeString()}</p>
        <button onClick={fetchWeatherNews} disabled={loading} className="btn-ghost text-[10px] flex items-center gap-1">
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
    </motion.div>
  );
};

export default WeatherNews;
