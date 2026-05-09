// Weather condition mappings and utilities

// Map weather conditions to background gradients
export const getWeatherBackground = (weatherMain, isDark = false) => {
  const text = weatherMain?.toLowerCase() || '';
  const has = (keyword) => text.includes(keyword);
  
  if (isDark) {
    // Substring-aware detection for WeatherAPI text like "Light rain shower"
    if (has('clear')) return 'bg-clear-night-gradient';
    if (has('cloud') || has('overcast')) return 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900';
    if (has('thunder') || has('storm')) return 'bg-gradient-to-br from-gray-900 via-slate-900 to-black';
    if (has('rain') || has('drizzle') || has('shower')) return 'bg-gradient-to-br from-gray-700 via-slate-800 to-gray-900';
    if (has('snow') || has('sleet') || has('blizzard')) return 'bg-gradient-to-br from-slate-600 via-gray-700 to-slate-800';
    if (has('mist') || has('fog') || has('haze')) return 'bg-gradient-to-br from-gray-700 via-slate-700 to-gray-800';
    return 'bg-default-dark-gradient';
  }
  
  // Light mode backgrounds
  if (has('clear') || has('sunny')) return 'bg-sunny-gradient';
  if (has('cloud') || has('overcast')) return 'bg-cloudy-gradient';
  if (has('thunder') || has('storm')) return 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900';
  if (has('rain') || has('drizzle') || has('shower')) return 'bg-rainy-gradient';
  if (has('snow') || has('sleet') || has('blizzard')) return 'bg-snowy-gradient';
  if (has('mist') || has('fog') || has('haze')) return 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500';
  return 'bg-default-gradient';
};

// Map weather conditions to icons — day/night aware
// WeatherAPI icon URLs contain '/day/' or '/night/' which we use for detection
export const getWeatherIcon = (weatherMain, weatherIcon) => {
  const text = weatherMain?.toLowerCase() || '';
  const has = (k) => text.includes(k);
  const isNight = typeof weatherIcon === 'string' && weatherIcon.includes('night');

  if (has('thunder') || has('storm'))  return '⛈️';
  if (has('blizzard'))                 return '🌨️';
  if (has('snow') || has('sleet'))     return has('heavy') ? '❄️' : '🌨️';
  if (has('rain') || has('drizzle') || has('shower')) {
    if (has('thunder'))                return '⛈️';
    return isNight ? '🌧️' : '🌦️';
  }
  if (has('mist') || has('fog') || has('haze')) return '🌁';
  if (has('overcast'))                 return '☁️';
  if (has('cloud') || has('partly'))   return isNight ? '☁️' : '⛅';
  if (has('clear') || has('sunny'))    return isNight ? '🌙' : '☀️';

  return isNight ? '🌙' : '🌤️';
};

// Get wind direction from degrees
export const getWindDirection = (degrees) => {
  if (degrees === null || degrees === undefined) return 'N/A';
  
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Convert wind speed to descriptive text
export const getWindDescription = (speed) => {
  if (speed <= 1) return 'Calm';
  if (speed <= 5) return 'Light breeze';
  if (speed <= 11) return 'Gentle breeze';
  if (speed <= 19) return 'Moderate breeze';
  if (speed <= 28) return 'Fresh breeze';
  if (speed <= 38) return 'Strong breeze';
  if (speed <= 49) return 'Near gale';
  if (speed <= 61) return 'Gale';
  if (speed <= 74) return 'Strong gale';
  if (speed <= 88) return 'Storm';
  return 'Hurricane';
};

// Format temperature with appropriate unit
export const formatTemperature = (temp, unit = 'C') => {
  if (temp === null || temp === undefined) return 'N/A';
  return `${Math.round(temp)}°${unit}`;
};

// Get appropriate text color for weather conditions
export const getWeatherTextColor = (weatherMain, isDark = false) => {
  if (isDark) {
    return 'text-white';
  }
  
  const condition = weatherMain?.toLowerCase();
  
  switch (condition) {
    case 'clear':
      return 'text-white';
    case 'clouds':
      return 'text-white';
    case 'rain':
    case 'drizzle':
    case 'thunderstorm':
      return 'text-white';
    case 'snow':
      return 'text-gray-800';
    default:
      return 'text-white';
  }
};

// Get time-based greeting
// Accepts an optional localTimeString like "2026-05-10 14:30" from WeatherAPI
export const getTimeGreeting = (localTimeString = null) => {
  let hour;
  if (localTimeString) {
    const match = localTimeString.match(/(\d{1,2}):\d{2}\s*$/);
    if (match) {
      hour = parseInt(match[1], 10);
    } else {
      hour = new Date().getHours();
    }
  } else {
    hour = new Date().getHours();
  }

  if (hour >= 5 && hour < 12)  return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night'; // 9 PM – 5 AM
};

// Format date for display
export const formatDate = (dateString) => {
  // Append T00:00:00 for date-only strings to avoid UTC midnight parsing issues
  const date = (dateString && !dateString.includes('T') && !dateString.includes(' '))
    ? new Date(dateString + 'T00:00:00')
    : new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get UV index description
export const getUVDescription = (uvIndex) => {
  if (uvIndex <= 2) return { level: 'Low', color: 'text-green-500' };
  if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
  if (uvIndex <= 7) return { level: 'High', color: 'text-orange-500' };
  if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-500' };
  return { level: 'Extreme', color: 'text-purple-500' };
};

// Get air quality description (if available)
export const getAirQualityDescription = (aqi) => {
  switch (aqi) {
    case 1: return { level: 'Good', color: 'text-green-500' };
    case 2: return { level: 'Fair', color: 'text-yellow-500' };
    case 3: return { level: 'Moderate', color: 'text-orange-500' };
    case 4: return { level: 'Poor', color: 'text-red-500' };
    case 5: return { level: 'Very Poor', color: 'text-purple-500' };
    default: return { level: 'Unknown', color: 'text-gray-500' };
  }
};

// Enhanced AQI functions
export const getAQIColor = (epaIndex) => {
  switch (epaIndex) {
    case 1: return '#00E400'; // Good - Green
    case 2: return '#FFFF00'; // Fair - Yellow
    case 3: return '#FF7E00'; // Moderate - Orange
    case 4: return '#FF0000'; // Poor - Red
    case 5: return '#8F3F97'; // Very Poor - Purple
    default: return '#666666'; // Unknown - Gray
  }
};

export const getAQIDescription = (epaIndex) => {
  switch (epaIndex) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'Unknown';
  }
};

export const getPM25Level = (value) => {
  if (value <= 12) return 'Good';
  if (value <= 35.4) return 'Moderate';
  if (value <= 55.4) return 'Unhealthy for Sensitive Groups';
  if (value <= 150.4) return 'Unhealthy';
  if (value <= 250.4) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getPM10Level = (value) => {
  if (value <= 54) return 'Good';
  if (value <= 154) return 'Moderate';
  if (value <= 254) return 'Unhealthy for Sensitive Groups';
  if (value <= 354) return 'Unhealthy';
  if (value <= 424) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getO3Level = (value) => {
  if (value <= 54) return 'Good';
  if (value <= 70) return 'Moderate';
  if (value <= 85) return 'Unhealthy for Sensitive Groups';
  if (value <= 105) return 'Unhealthy';
  if (value <= 200) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getNO2Level = (value) => {
  if (value <= 53) return 'Good';
  if (value <= 100) return 'Moderate';
  if (value <= 360) return 'Unhealthy for Sensitive Groups';
  if (value <= 649) return 'Unhealthy';
  if (value <= 1249) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getCOLevel = (value) => {
  if (value <= 4.4) return 'Good';
  if (value <= 9.4) return 'Moderate';
  if (value <= 12.4) return 'Unhealthy for Sensitive Groups';
  if (value <= 15.4) return 'Unhealthy';
  if (value <= 30.4) return 'Very Unhealthy';
  return 'Hazardous';
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Check if it's daytime based on sunrise/sunset
// Handles WeatherAPI "hh:mm AM/PM" format and optional localTimeString "YYYY-MM-DD HH:MM"
export const isDaytime = (sunrise, sunset, localTimeString = null) => {
  const toMinutes = (t) => {
    if (!t) return null;
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
    if (!match) return null;
    let hours = parseInt(match[1], 10) % 12;
    const minutes = parseInt(match[2], 10);
    if (match[3].toUpperCase() === 'PM') hours += 12;
    return hours * 60 + minutes;
  };
  
  const sr = toMinutes(sunrise);
  const ss = toMinutes(sunset);
  if (sr == null || ss == null) return true; // default to daytime if can't parse
  
  let nowMinutes;
  if (localTimeString) {
    const match = localTimeString.match(/(\d{1,2}):(\d{2})\s*$/);
    nowMinutes = match ? parseInt(match[1], 10) * 60 + parseInt(match[2], 10) : null;
  }
  if (nowMinutes == null) {
    const now = new Date();
    nowMinutes = now.getHours() * 60 + now.getMinutes();
  }
  
  return nowMinutes >= sr && nowMinutes <= ss;
};

const weatherUtils = {
  getWeatherBackground,
  getWeatherIcon,
  getWindDirection,
  getWindDescription,
  formatTemperature,
  getWeatherTextColor,
  getTimeGreeting,
  formatDate,
  getUVDescription,
  getAirQualityDescription,
  getAQIColor,
  getAQIDescription,
  getPM25Level,
  getPM10Level,
  getO3Level,
  getNO2Level,
  getCOLevel,
  debounce,
  isDaytime
};

export default weatherUtils;
