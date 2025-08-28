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
    
    const greeting = getTimeGreeting();
    const temp = formatTemperature(weatherData.temperature.current);
    const condition = weatherData.weather.description;
    const city = weatherData.city;
    const country = weatherData.country;
    
    return `🌤️ ${greeting}! It's ${temp} and ${condition} in ${city}, ${country}. Check out the full forecast! #Weather #${city.replace(/\s+/g, '')}`;
  }, [weatherData]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOnSocial = (platform) => {
    const text = shareText;
    const url = window.location.href;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const downloadImage = () => {
    if (!canvasRef.current || !weatherData) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `weather-${weatherData.city}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const generateWeatherCard = useCallback(() => {
    if (!canvasRef.current || !weatherData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Weather icon
    const icon = getWeatherIcon(weatherData.weather.main, weatherData.weather.icon);
    ctx.font = '80px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(icon, 200, 120);
    
    // Temperature
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(formatTemperature(weatherData.temperature.current), 200, 200);
    
    // Condition
    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(weatherData.weather.description, 200, 240);
    
    // City and country
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`${weatherData.city}, ${weatherData.country}`, 200, 270);
    
    // Right side details
    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    
    let y = 100;
    ctx.fillText(`Feels like: ${formatTemperature(weatherData.temperature.feels_like)}`, 450, y);
    y += 30;
    ctx.fillText(`Humidity: ${weatherData.humidity}%`, 450, y);
    y += 30;
    ctx.fillText(`Wind: ${weatherData.wind.speed} ${weatherData.units === 'imperial' ? 'mph' : 'm/s'}`, 450, y);
    y += 30;
    ctx.fillText(`Pressure: ${weatherData.pressure} hPa`, 450, y);
    y += 30;
    ctx.fillText(`Visibility: ${weatherData.visibility} ${weatherData.units === 'imperial' ? 'miles' : 'km'}`, 500, y);
    
    // Timestamp
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleString()}`, width/2, height - 20);
  }, [weatherData]);

  React.useEffect(() => {
    setShareText(generateShareText());
    if (weatherData) {
      generateWeatherCard();
    }
  }, [weatherData, generateShareText, generateWeatherCard]);

  if (!weatherData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="weather-card p-6 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Share2 className="text-green-300" size={28} />
            Share Weather Report
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition"
          >
            ✕
          </button>
        </div>
        <div className="text-center py-8 text-white/60">
          <div className="text-4xl mb-2">🌤️</div>
          <p>No weather data available</p>
          <p className="text-sm">Please search for a city first</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="weather-card p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Share2 className="text-green-300" size={28} />
          Share Weather Report
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Options */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Share Text</h4>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="w-full h-32 p-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Customize your weather share message..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Share on Social Media</h4>
            <div className="flex gap-3">
              <button
                onClick={() => shareOnSocial('twitter')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition"
              >
                <Twitter size={16} />
                Twitter
              </button>
              <button
                onClick={() => shareOnSocial('facebook')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Facebook size={16} />
                Facebook
              </button>
              <button
                onClick={() => shareOnSocial('whatsapp')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Weather Card Preview */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Weather Card Preview</h4>
          <div className="bg-white/10 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg border border-white/20"
            />
            <button
              onClick={downloadImage}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              <Download size={16} />
              Download Image
            </button>
          </div>
        </div>
      </div>

      {/* Quick Share Links */}
      <div className="mt-6 p-4 bg-white/10 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-3">Quick Share Links</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => shareOnSocial('twitter')}
            className="p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition text-center"
          >
            Share on Twitter
          </button>
          <button
            onClick={() => shareOnSocial('facebook')}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-center"
          >
            Share on Facebook
          </button>
          <button
            onClick={() => shareOnSocial('whatsapp')}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-center"
          >
            Share on WhatsApp
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherSharing;
