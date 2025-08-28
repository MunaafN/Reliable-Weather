import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Globe, TrendingUp } from 'lucide-react';

const WeatherNews = ({ onClose, cityName, countryName }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('weather');

  // Weather-related search terms for better news relevance
  // Note: In production, these would be used with NewsAPI
  // const searchTerms = {
  //   weather: `${cityName} weather climate`,
  //   climate: `${cityName} climate change global warming`,
  //   natural: `${cityName} natural disasters extreme weather`,
  //   seasonal: `${cityName} seasonal weather patterns`
  // };

  const fetchWeatherNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using NewsAPI.org for real-time weather news
      // Note: In production, you'd need to sign up for an API key
      // const searchQuery = searchTerms[selectedCategory];
      
      // For demo purposes, I'll create realistic weather news based on the city
      // In production, replace this with actual API call to NewsAPI or similar
      const mockNews = generateWeatherNews(cityName, countryName, selectedCategory);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNews(mockNews);
    } catch (err) {
      setError('Failed to fetch weather news. Please try again later.');
      console.error('Weather news fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [cityName, countryName, selectedCategory]);

  // Generate realistic weather news based on city and category
  const generateWeatherNews = (city, country, category) => {
    const baseNews = [
      {
        id: 1,
        title: `Latest Weather Updates for ${city}, ${country}`,
        description: `Stay informed about current weather conditions, forecasts, and any weather-related alerts in ${city}. Local meteorologists are closely monitoring weather patterns.`,
        source: 'Local Weather Service',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        url: `https://www.weather.gov/`,
        category: 'weather'
      },
      {
        id: 2,
        title: `Seasonal Weather Patterns in ${city}`,
        description: `Understanding the typical weather patterns for ${city} during this time of year helps residents prepare for seasonal changes and extreme weather events.`,
        source: 'Climate Research Institute',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        url: `https://www.climate.gov/`,
        category: 'seasonal'
      },
      {
        id: 3,
        title: `Climate Change Impact on ${city} Weather`,
        description: `Recent studies show how climate change is affecting weather patterns in ${city} and surrounding regions, with implications for local agriculture and infrastructure.`,
        source: 'Environmental Research Center',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        url: `https://www.epa.gov/climate-change`,
        category: 'climate'
      },
      {
        id: 4,
        title: `Extreme Weather Preparedness in ${city}`,
        description: `Local authorities in ${city} are implementing new measures to prepare for extreme weather events, including improved emergency response systems.`,
        source: 'City Emergency Management',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        url: `https://www.ready.gov/`,
        category: 'natural'
      },
      {
        id: 5,
        title: `Weather Technology Advances in ${city}`,
        description: `New weather monitoring technology is being deployed in ${city} to provide more accurate forecasts and early warning systems for severe weather.`,
        source: 'Meteorological Technology Institute',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        url: `https://www.noaa.gov/`,
        category: 'weather'
      }
    ];

    // Filter by category if not 'all'
    if (category !== 'all') {
      return baseNews.filter(item => item.category === category);
    }
    
    return baseNews;
  };

  useEffect(() => {
    fetchWeatherNews();
  }, [fetchWeatherNews]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const handleRefresh = () => {
    fetchWeatherNews();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Globe size={28} />
                Weather News
              </h2>
              <p className="text-blue-100 mt-1">
                Latest weather updates for {cityName}, {countryName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All News', icon: '📰' },
              { key: 'weather', label: 'Weather Updates', icon: '🌤️' },
              { key: 'climate', label: 'Climate News', icon: '🌍' },
              { key: 'natural', label: 'Natural Disasters', icon: '⚠️' },
              { key: 'seasonal', label: 'Seasonal Patterns', icon: '🍂' }
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Fetching latest weather news...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No weather news available for this category at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((article) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                      {article.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <TrendingUp size={16} />
                      <span>{article.source}</span>
                    </div>
                    
                                         <button
                       onClick={() => {
                         if (article.url && article.url !== '#') {
                           window.open(article.url, '_blank', 'noopener,noreferrer');
                         } else {
                           alert('Article link not available');
                         }
                       }}
                       className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                       title="Open article in new tab"
                     >
                       <ExternalLink size={16} />
                       Read More
                     </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh News'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WeatherNews;
