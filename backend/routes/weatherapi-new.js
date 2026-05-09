const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

// Cache for 2 minutes (120 seconds) for more real-time data
const cache = new NodeCache({ stdTTL: 120 });

const WEATHERAPI_BASE_URL = 'http://api.weatherapi.com/v1';

// Middleware to check API key
const checkApiKey = (req, res, next) => {
  const API_KEY = process.env.WEATHERAPI_KEY;
  
  if (!API_KEY || API_KEY === 'your_weatherapi_key_here') {
    console.error('❌ WeatherAPI.com key not configured properly');
    console.error('Get free API key at: https://www.weatherapi.com/');
    
    return res.status(500).json({
      error: 'API configuration error',
      message: 'WeatherAPI.com key not configured. Please add your API key to backend/.env file.',
      help: 'Get your free API key at https://www.weatherapi.com/'
    });
  }
  next();
};

// Helper function to make WeatherAPI calls
const fetchWeatherData = async (endpoint, params) => {
  const API_KEY = process.env.WEATHERAPI_KEY;
  
  try {
    const response = await axios.get(`${WEATHERAPI_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        key: API_KEY
      },
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Weather service error';
      
      if (status === 401 || status === 403) {
        throw new Error('API authentication failed - check your WeatherAPI.com key');
      } else if (status === 400) {
        const errorMsg = error.response.data?.error?.message || 'Invalid location';
        if (errorMsg.includes('No matching location found')) {
          throw new Error('City not found. Please check the spelling and try again. You can search for cities, airports, or coordinates.');
        } else {
          throw new Error('Invalid location. Please check the location name and try again.');
        }
      } else if (status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else {
        throw new Error(`Weather service error: ${message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else {
      throw new Error('Unable to fetch weather data. Please try again later.');
    }
  }
};

// Convert WeatherAPI response to our standard format
const formatCurrentWeather = (data, units = 'metric') => {
  const location = data.location;
  const current = data.current;
  const today = data.forecast?.forecastday?.[0];
  
  return {
    city: location.name,
    country: location.country,
    region: location.region,
    coordinates: {
      lat: location.lat,
      lon: location.lon
    },
    localTime: {
      time: location.localtime,
      timezone: location.tz_id,
      epoch: location.localtime_epoch,
      isDayTime: current.is_day === 1
    },
    weather: {
      main: current.condition.text,
      description: current.condition.text.toLowerCase(),
      icon: current.condition.icon,
      code: current.condition.code
    },
    temperature: {
      current: Math.round(units === 'imperial' ? current.temp_f : current.temp_c),
      feels_like: Math.round(units === 'imperial' ? current.feelslike_f : current.feelslike_c),
      min: today ? Math.round(units === 'imperial' ? today.day.mintemp_f : today.day.mintemp_c) : null,
      max: today ? Math.round(units === 'imperial' ? today.day.maxtemp_f : today.day.maxtemp_c) : null
    },
    humidity: current.humidity,
    pressure: current.pressure_mb,
    visibility: units === 'imperial' ? Math.round(current.vis_miles * 10) / 10 : current.vis_km,
    wind: {
      speed: units === 'imperial'
        ? Math.round(current.wind_mph * 10) / 10
        : Math.round((current.wind_kph / 3.6) * 10) / 10, // m/s
      direction: Math.round(current.wind_degree),
      gust: current.gust_kph ? (
        units === 'imperial'
          ? Math.round(current.gust_mph * 10) / 10
          : Math.round((current.gust_kph / 3.6) * 10) / 10
      ) : null
    },
    clouds: current.cloud,
    uv: current.uv,
    air_quality: current.air_quality ? {
      co: Math.round(current.air_quality.co * 10) / 10,
      no2: Math.round(current.air_quality.no2 * 10) / 10,
      o3: Math.round(current.air_quality.o3 * 10) / 10,
      pm2_5: Math.round(current.air_quality.pm2_5 * 10) / 10,
      pm10: Math.round(current.air_quality.pm10 * 10) / 10,
      epa_index: current.air_quality['us-epa-index']
    } : null,
    astro: today ? {
      sunrise: today.astro.sunrise,
      sunset: today.astro.sunset,
      moonrise: today.astro.moonrise,
      moonset: today.astro.moonset,
      moon_phase: today.astro.moon_phase
    } : null,
    units: units,
    timestamp: new Date().toISOString()
  };
};

// GET /api/weather/current?city=London
router.get('/current', checkApiKey, async (req, res) => {
  try {
    const { city, lat, lon, units = 'metric' } = req.query;
    
    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Please provide either city name or coordinates (lat, lon)'
      });
    }
    
    // Create cache key
    const cacheKey = city ? `current_${city.toLowerCase().trim()}_${units}` : `current_${lat}_${lon}_${units}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        cached: true,
        cacheTime: new Date().toISOString()
      });
    }
    
    // Prepare query parameter
    const query = city ? city.trim() : `${lat},${lon}`;
    
    // Fetch current weather with today's forecast for astro/min/max
    const weatherData = await fetchWeatherData('/forecast.json', {
      q: query,
      days: 1,
      aqi: 'yes',
      alerts: 'no'
    });
    
    // Format response
    const formattedData = formatCurrentWeather(weatherData, units);
    
    // Cache the result
    cache.set(cacheKey, formattedData);
    
    res.json(formattedData);
    
  } catch (error) {
    console.error('Current weather error:', error.message);
    res.status(400).json({
      error: 'Failed to fetch current weather',
      message: error.message
    });
  }
});

// GET /api/weather/forecast?city=London
router.get('/forecast', checkApiKey, async (req, res) => {
  try {
    const { city, lat, lon, units = 'metric' } = req.query;
    
    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Please provide either city name or coordinates (lat, lon)'
      });
    }
    
    // Create cache key
    const cacheKey = city ? `forecast_${city.toLowerCase().trim()}_${units}` : `forecast_${lat}_${lon}_${units}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        cached: true,
        cacheTime: new Date().toISOString()
      });
    }
    
    // Prepare query parameter
    const query = city ? city.trim() : `${lat},${lon}`;
    
    // Fetch 10-day forecast (WeatherAPI supports up to 10 days!)
    const forecastData = await fetchWeatherData('/forecast.json', {
      q: query,
      days: 7, // Get 7-day forecast
      aqi: 'yes', // Include air quality
      alerts: 'yes' // Include weather alerts
    });
    
    // Format forecast data
    const formattedForecast = forecastData.forecast.forecastday.map(day => ({
      date: day.date,
      dateEpoch: day.date_epoch,
      weather: {
        main: day.day.condition.text,
        description: day.day.condition.text.toLowerCase(),
        icon: day.day.condition.icon,
        code: day.day.condition.code
      },
      temperature: {
        min: Math.round(units === 'imperial' ? day.day.mintemp_f : day.day.mintemp_c),
        max: Math.round(units === 'imperial' ? day.day.maxtemp_f : day.day.maxtemp_c),
        avg: Math.round(units === 'imperial' ? day.day.avgtemp_f : day.day.avgtemp_c)
      },
      humidity: day.day.avghumidity,
      wind: {
        speed: units === 'imperial'
          ? Math.round(day.day.maxwind_mph * 10) / 10
          : Math.round((day.day.maxwind_kph / 3.6) * 10) / 10, // m/s
        direction: 0 // Not provided in daily summary
      },
      uv: day.day.uv,
      rain_chance: day.day.daily_chance_of_rain,
      snow_chance: day.day.daily_chance_of_snow,
      precipitation: {
        total_mm: Math.round(day.day.totalprecip_mm * 10) / 10,
        total_inches: Math.round(day.day.totalprecip_in * 100) / 100
      },
      astronomy: {
        sunrise: day.astro.sunrise,
        sunset: day.astro.sunset,
        moonrise: day.astro.moonrise,
        moonset: day.astro.moonset,
        moon_phase: day.astro.moon_phase,
        moon_illumination: day.astro.moon_illumination
      },
      // Include hourly data for better time accuracy
      hourlyData: day.hour ? day.hour.map(hour => ({
        time: hour.time,
        timeEpoch: hour.time_epoch,
        temp: Math.round(units === 'imperial' ? hour.temp_f : hour.temp_c),
        condition: hour.condition.text,
        icon: hour.condition.icon,
        isDay: hour.is_day === 1,
        rainChance: hour.chance_of_rain,
        windSpeed: units === 'imperial'
          ? Math.round(hour.wind_mph * 10) / 10
          : Math.round(hour.wind_kph / 3.6 * 10) / 10
      })) : null
    }));
    
    const responseData = {
      city: forecastData.location.name,
      country: forecastData.location.country,
      region: forecastData.location.region,
      coordinates: {
        lat: forecastData.location.lat,
        lon: forecastData.location.lon
      },
      localTime: {
        time: forecastData.location.localtime,
        timezone: forecastData.location.tz_id,
        epoch: forecastData.location.localtime_epoch
      },
      forecast: formattedForecast,
      alerts: forecastData.alerts?.alert || [], // Weather alerts
      units: units,
      timestamp: new Date().toISOString()
    };
    
    // Cache the result
    cache.set(cacheKey, responseData);
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Forecast error:', error.message);
    res.status(400).json({
      error: 'Failed to fetch weather forecast',
      message: error.message
    });
  }
});

// GET /api/weather/search?q=Lond
router.get('/search', checkApiKey, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid search query',
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    // Check cache
    const cacheKey = `search_${q.toLowerCase().trim()}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // WeatherAPI.com has a dedicated search endpoint
    const searchResults = await fetchWeatherData('/search.json', {
      q: q.trim()
    });
    
    const suggestions = searchResults.map(location => ({
      name: location.name,
      country: location.country,
      region: location.region,
      coordinates: {
        lat: location.lat,
        lon: location.lon
      },
      displayName: location.region ? 
        `${location.name}, ${location.region}, ${location.country}` : 
        `${location.name}, ${location.country}`
    }));
    
    const responseData = {
      query: q.trim(),
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    };
    
    // Cache for 2 minutes
    cache.set(cacheKey, responseData, 120);
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(400).json({
      error: 'Failed to search cities',
      message: 'Unable to search for cities. Please try again later.'
    });
  }
});

module.exports = router;
 
// Server-Sent Events for real-time weather alerts
router.get('/alerts/stream', checkApiKey, async (req, res) => {
  try {
    const { city, lat, lon, units = 'metric' } = req.query;
    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Please provide either city or coordinates (lat, lon)'
      });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const query = city ? city.trim() : `${lat},${lon}`;

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Initial event to confirm connection
    sendEvent({ type: 'connected', timestamp: new Date().toISOString() });

    let lastAlertSignature = '';

    const poll = async () => {
      try {
        const data = await fetchWeatherData('/forecast.json', {
          q: query,
          days: 1,
          aqi: 'no',
          alerts: 'yes'
        });
        const alerts = data.alerts?.alert || [];
        // Create a simple signature to avoid re-sending identical payloads
        const signature = alerts.map(a => `${a.event}-${a.effective}-${a.expires}`).join('|');
        if (signature !== lastAlertSignature) {
          lastAlertSignature = signature;
          sendEvent({ type: 'alerts', alerts, location: data.location?.name, timestamp: new Date().toISOString() });
        }
      } catch (err) {
        sendEvent({ type: 'error', message: err.message || 'Polling error' });
      }
    };

    // Poll every 60 seconds (WeatherAPI rate limits apply)
    const intervalId = setInterval(poll, 60 * 1000);
    // Do first poll immediately
    poll();

    // Keep-alive heartbeat every 25 seconds
    const heartbeatId = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 25 * 1000);

    req.on('close', () => {
      clearInterval(intervalId);
      clearInterval(heartbeatId);
      res.end();
    });
  } catch (e) {
    console.error('SSE setup error:', e);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to establish alerts stream' });
  }
});

// ─── #8: Historical Weather Endpoint ─────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const { city, lat, lon, date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
    if (!city && (!lat || !lon)) return res.status(400).json({ error: 'Provide city or lat+lon' });

    let finalQuery;
    let cacheKeyStr;
    
    if (lat && lon) {
      const valid = validateCoordinates(lat, lon);
      if (!valid) return res.status(400).json({ error: 'Invalid coordinates' });
      finalQuery = `${valid.lat},${valid.lon}`;
      cacheKeyStr = `hist_${finalQuery}_${date}`;
    } else {
      const aliases = Object.keys(CITY_ALIASES).map(k => k.toLowerCase());
      const queryLower = city.toLowerCase();
      finalQuery = aliases.includes(queryLower) ? CITY_ALIASES[queryLower] : city;
      cacheKeyStr = `hist_${finalQuery.toLowerCase().replace(/\s+/g, '')}_${date}`;
    }

    const cachedData = cache.get(cacheKeyStr);
    if (cachedData) return res.json(cachedData);

    const data = await fetchWeatherData('/history.json', { q: finalQuery, dt: date });
    
    if (!data.forecast || !data.forecast.forecastday || data.forecast.forecastday.length === 0) {
       return res.status(404).json({ error: 'Historical data not available' });
    }

    const historyDay = data.forecast.forecastday[0];
    const responseData = {
      city: data.location.name,
      country: data.location.country,
      date: historyDay.date,
      summary: {
        maxTemp: historyDay.day.maxtemp_c,
        minTemp: historyDay.day.mintemp_c,
        avgTemp: historyDay.day.avgtemp_c,
        maxWind: historyDay.day.maxwind_kph,
        totalPrecip: historyDay.day.totalprecip_mm,
        avgVis: historyDay.day.avgvis_km,
        humidity: historyDay.day.avghumidity,
        condition: historyDay.day.condition.text,
        icon: historyDay.day.condition.icon,
      },
      hourly: historyDay.hour.map(h => ({
        time: h.time,
        temp: h.temp_c,
        condition: h.condition.text,
        icon: h.condition.icon,
        wind: h.wind_kph,
        precip: h.precip_mm
      }))
    };

    cache.set(cacheKeyStr, responseData, 86400 * 7); // 7 days cache
    res.json(responseData);
  } catch (error) {
    if (error.message.includes('City not found')) res.status(404).json({ error: error.message });
    else res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

module.exports = router;