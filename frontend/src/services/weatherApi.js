import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    if (!error.response) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        throw new Error(data.message || 'Invalid request. Please check your input.');
      case 404: {
        // Surface "did you mean" suggestions from backend
        const err404 = new Error(data.message || 'City not found. Please check the spelling.');
        err404.suggestions = data.suggestions || [];
        throw err404;
      }
      case 429:
        throw new Error('Too many requests. Please try again later.');
      case 500:
        // Check if it's an API configuration error
        if (data.message?.includes('API key not configured')) {
          throw new Error('⚠️ Backend configuration error: WeatherAPI.com key is missing. Please check the setup instructions.');
        }
        throw new Error(data.message || 'Server error. Please try again later.');
      default:
        throw new Error(data.message || `Request failed with status ${status}`);
    }
  }
);

export const weatherApi = {
  // Get current weather by city name
  getCurrentWeather: async (city, units = 'metric') => {
    try {
      const response = await apiClient.get('/weather/current', {
        params: { city: city.trim(), units }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },

  // Get current weather by coordinates
  getCurrentWeatherByCoords: async (lat, lon, units = 'metric') => {
    try {
      const response = await apiClient.get('/weather/current', {
        params: { lat, lon, units }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather by coords:', error);
      throw error;
    }
  },

  // Get 5-day forecast by city name
  getForecast: async (city, units = 'metric') => {
    try {
      const response = await apiClient.get('/weather/forecast', {
        params: { city: city.trim(), units }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },

  // Get 5-day forecast by coordinates
  getForecastByCoords: async (lat, lon, units = 'metric') => {
    try {
      const response = await apiClient.get('/weather/forecast', {
        params: { lat, lon, units }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast by coords:', error);
      throw error;
    }
  },

  // Search for cities (autocomplete)
  searchCities: async (query) => {
    try {
      if (!query || query.trim().length < 2) {
        return { suggestions: [] };
      }
      
      const response = await apiClient.get('/weather/search', {
        params: { q: query.trim() }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching cities:', error);
      // Don't throw for search errors, just return empty results
      return { suggestions: [] };
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      // Health endpoint is at server root, not under /api
      const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
      const response = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Weather service is currently unavailable');
    }
  },

  // Batch weather for multiple cities (#15)
  batchWeather: async (cities, units = 'metric') => {
    try {
      const response = await apiClient.get('/weather/batch', {
        params: { cities: cities.join(','), units }
      });
      return response.data;
    } catch (error) {
      console.error('Batch weather error:', error);
      throw error;
    }
  },

  // Cache stats
  getStats: async () => {
    try {
      const response = await apiClient.get('/weather/stats');
      return response.data;
    } catch (error) {
      console.error('Stats error:', error);
      throw error;
    }
  },

  // Historical Weather
  getHistory: async (city, date, units = 'metric') => {
    try {
      const response = await apiClient.get('/weather/history', {
        params: { city, date, units }
      });
      return response.data;
    } catch (error) {
      console.error('Historical weather error:', error);
      throw error;
    }
  }
};

// Utility function to get user's geolocation
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Try high-accuracy first (uses GPS on mobile), fall back to any accuracy
    const tryGetPosition = (highAccuracy) => {
      return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(
          (position) => res(position),
          (error) => rej(error),
          {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 8000 : 15000,
            maximumAge: 0, // always get fresh position
          }
        );
      });
    };

    // Attempt 1: high accuracy (GPS). Attempt 2: any accuracy (IP/wifi)
    tryGetPosition(true)
      .catch(() => tryGetPosition(false))
      .then((position) => {
        const result = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy, // meters
        };

        // Warn if accuracy is very poor (> 5km means IP-based location)
        if (position.coords.accuracy > 5000) {
          console.warn(`⚠️ GPS accuracy is low: ${Math.round(position.coords.accuracy)}m — location may be approximate`);
        }

        resolve(result);
      })
      .catch((error) => {
        let message = 'Failed to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Try again or search manually.';
            break;
          default:
            message = 'An unknown error occurred while getting location';
            break;
        }
        reject(new Error(message));
      });
  });
};

export default weatherApi;
