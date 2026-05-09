import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Copy, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { getWeatherIcon, formatTemperature, getTimeGreeting } from '../utils/weatherUtils';

const WeatherSharing = ({ weatherData, forecastData, onClose }) => {
  const [shareText, setShareText] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const generateShareText = useCallback(() => {
    if (!weatherData) return '';
    const greeting = getTimeGreeting(weatherData?.localTime?.time);
    const temp = formatTemperature(weatherData.temperature.current);
    return `🌤️ ${greeting}! It's ${temp} and ${weatherData.weather.description} in ${weatherData.city}, ${weatherData.country}. #Weather #${weatherData.city.replace(/\s+/g, '')}`;
  }, [weatherData]);

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { console.error('Copy failed:', e); }
  };

  const shareOnSocial = (platform) => {
    const text = shareText, url = window.location.href;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const generateCard = useCallback(() => {
    if (!canvasRef.current || !weatherData) return;
    const c = canvasRef.current, ctx = c.getContext('2d');
    c.width = 800; c.height = 400;
    const g = ctx.createLinearGradient(0, 0, 800, 400);
    g.addColorStop(0, '#0B1220'); g.addColorStop(0.5, '#1e3a5f'); g.addColorStop(1, '#2563eb');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 400);
    // overlay
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, 0, 800, 400);
    // icon
    ctx.font = '64px Arial'; ctx.textAlign = 'center';
    ctx.fillText(getWeatherIcon(weatherData.weather.main, weatherData.weather.icon), 180, 130);
    // temp
    ctx.font = '800 56px Inter, Arial'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(formatTemperature(weatherData.temperature.current), 180, 210);
    // desc
    ctx.font = '500 18px Inter, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(weatherData.weather.description, 180, 245);
    // city
    ctx.font = '400 14px Inter, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`${weatherData.city}, ${weatherData.country}`, 180, 275);
    // details
    ctx.textAlign = 'left'; ctx.font = '400 14px Inter, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    let y = 100;
    const details = [
      `Feels like ${formatTemperature(weatherData.temperature.feels_like)}`,
      `Humidity: ${weatherData.humidity}%`,
      `Wind: ${weatherData.wind.speed} ${weatherData.units==='imperial'?'mph':'m/s'}`,
      `Pressure: ${weatherData.pressure} hPa`,
      `Visibility: ${weatherData.visibility} ${weatherData.units==='imperial'?'mi':'km'}`,
    ];
    details.forEach(t => { ctx.fillText(t, 450, y); y += 32; });
    // footer
    ctx.font = '400 11px Inter, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.textAlign = 'center';
    ctx.fillText(`WeatherApp · ${new Date().toLocaleDateString()}`, 400, 380);
  }, [weatherData]);

  const downloadImage = () => {
    if (!canvasRef.current || !weatherData) return;
    const link = document.createElement('a');
    link.download = `weather-${weatherData.city}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  React.useEffect(() => {
    setShareText(generateShareText());
    if (weatherData) generateCard();
  }, [weatherData, generateShareText, generateCard]);

  if (!weatherData) {
    return (
      <div className="text-center py-16">
        <Share2 size={32} className="mx-auto mb-3 text-slate-600" />
        <p className="text-sm text-slate-400">Search for a city first to share weather</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Share2 size={18} className="text-brand-emerald" /> Share Weather</h3>
        {onClose && <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">Share Message</label>
            <textarea value={shareText} onChange={e => setShareText(e.target.value)}
              className="input-field h-28 resize-none text-xs leading-relaxed" />
          </div>
          <button onClick={copyToClipboard} className="btn-primary w-full flex items-center justify-center gap-2">
            <Copy size={14} /> {copied ? '✓ Copied!' : 'Copy Text'}
          </button>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">Share on</label>
            <div className="flex gap-2">
              {[
                { p: 'twitter', icon: Twitter, label: 'Twitter', bg: 'bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2]' },
                { p: 'facebook', icon: Facebook, label: 'Facebook', bg: 'bg-[#4267B2]/10 hover:bg-[#4267B2]/20 text-[#4267B2]' },
                { p: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', bg: 'bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]' },
              ].map(({ p, icon: I, label, bg }) => (
                <button key={p} onClick={() => shareOnSocial(p)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${bg}`}
                ><I size={14} />{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">Weather Card Preview</label>
          <div className="glass-effect p-3">
            <canvas ref={canvasRef} className="w-full h-auto rounded-xl" />
            <button onClick={downloadImage} className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-xs">
              <Download size={14} /> Download Image
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherSharing;
