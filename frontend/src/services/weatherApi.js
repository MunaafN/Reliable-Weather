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
      case 404:
        throw new Error(data.message || 'City not found. Please check the spelling.');
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
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Weather service is currently unavailable');
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

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
          default:
            message = 'An unknown error occurred while getting location';
            break;
        }
        
        reject(new Error(message));
      },
      options
    );
  });
};

export default weatherApi;
