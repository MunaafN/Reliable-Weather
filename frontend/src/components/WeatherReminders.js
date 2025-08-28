import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const WeatherReminders = ({ weatherData, forecastData, onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const generateReminders = useCallback(() => {
    const newReminders = [];
    const current = weatherData;

    // Temperature-based reminders
    if (current.temperature.current < 10) {
      newReminders.push({
        id: 'cold',
        type: 'warning',
        icon: '🧥',
        title: 'Bundle Up!',
        message: `It's ${current.temperature.current}°${current.units === 'imperial' ? 'F' : 'C'} - wear warm clothing.`,
        priority: 'high'
      });
    } else if (current.temperature.current > 30) {
      newReminders.push({
        id: 'hot',
        type: 'warning',
        icon: '☀️',
        title: 'Stay Cool!',
        message: `It's ${current.temperature.current}°${current.units === 'imperial' ? 'F' : 'C'} - stay hydrated and avoid prolonged sun exposure.`,
        priority: 'high'
      });
    }

    // Weather condition reminders
    if (current.weather.main.toLowerCase().includes('rain')) {
      newReminders.push({
        id: 'rain',
        type: 'reminder',
        icon: '☔',
        title: 'Bring an Umbrella',
        message: 'Rain is expected - don\'t forget your umbrella or raincoat.',
        priority: 'medium'
      });
    }

    if (current.weather.main.toLowerCase().includes('snow')) {
      newReminders.push({
        id: 'snow',
        type: 'reminder',
        icon: '❄️',
        title: 'Winter Weather',
        message: 'Snow is expected - wear appropriate footwear and warm clothing.',
        priority: 'medium'
      });
    }

    if (current.weather.main.toLowerCase().includes('storm')) {
      newReminders.push({
        id: 'storm',
        type: 'warning',
        icon: '⛈️',
        title: 'Storm Warning',
        message: 'Thunderstorms expected - stay indoors and avoid open areas.',
        priority: 'high'
      });
    }

    // Wind-based reminders
    if (current.wind.speed > 20) {
      newReminders.push({
        id: 'windy',
        type: 'reminder',
        icon: '💨',
        title: 'Windy Conditions',
        message: `Strong winds of ${current.wind.speed} ${current.units === 'imperial' ? 'mph' : 'm/s'} - secure loose objects.`,
        priority: 'medium'
      });
    }

    // UV and sun protection
    if (current.uv > 7) {
      newReminders.push({
        id: 'uv',
        type: 'warning',
        icon: '🕶️',
        title: 'High UV Index',
        message: `UV index is ${current.uv} - wear sunscreen, hat, and sunglasses.`,
        priority: 'medium'
      });
    }

    // Air quality reminders
    if (current.air_quality?.epa_index >= 4) {
      newReminders.push({
        id: 'air-quality',
        type: 'warning',
        icon: '😷',
        title: 'Poor Air Quality',
        message: 'Air quality is poor - limit outdoor activities, especially for sensitive groups.',
        priority: 'high'
      });
    }

    // Visibility reminders
    if (current.visibility < 5) {
      newReminders.push({
        id: 'visibility',
        type: 'warning',
        icon: '🌫️',
        title: 'Low Visibility',
        message: `Visibility is ${current.visibility} ${current.units === 'imperial' ? 'miles' : 'km'} - drive carefully.`,
        priority: 'medium'
      });
    }

    // Activity recommendations
    const isGoodWeather = current.weather.main.toLowerCase().includes('clear') && 
                         current.temperature.current > 15 && 
                         current.temperature.current < 25 &&
                         current.wind.speed < 15;

    if (isGoodWeather) {
      newReminders.push({
        id: 'outdoor-activity',
        type: 'recommendation',
        icon: '🌳',
        title: 'Great Day for Outdoors!',
        message: 'Perfect weather for outdoor activities like walking, cycling, or picnics.',
        priority: 'low'
      });
    }

    setReminders(newReminders);
  }, [weatherData]);

  useEffect(() => {
    if (weatherData) {
      generateReminders();
    }
  }, [weatherData, generateReminders]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🔵';
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setShowNotifications(true);
        localStorage.setItem('weatherNotifications', 'true');
      }
    }
  };

  const sendNotification = (reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        tag: reminder.id
      });
    }
  };

  useEffect(() => {
    const notificationsEnabled = localStorage.getItem('weatherNotifications') === 'true';
    setShowNotifications(notificationsEnabled);
  }, []);

  if (!weatherData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="weather-card p-6 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="text-yellow-300" size={28} />
            Weather Reminders & Tips
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition"
          >
            ✕
          </button>
        </div>
        <div className="text-center py-8 text-white/60">
          <div className="text-4xl mb-2">🔔</div>
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
          <Bell className="text-yellow-300" size={28} />
          Weather Reminders & Tips
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Notification Settings */}
      <div className="mb-6 p-4 bg-white/10 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Browser Notifications</h4>
            <p className="text-white/80 text-sm">
              Get notified about important weather changes and reminders
            </p>
          </div>
          {!showNotifications ? (
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              Enable Notifications
            </button>
          ) : (
            <div className="text-green-400 text-sm">✓ Notifications Enabled</div>
          )}
        </div>
      </div>

      {/* Current Weather Summary */}
      <div className="mb-6 p-4 bg-white/10 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-3">Current Conditions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🌤️</div>
            <div className="text-sm text-white/60">Condition</div>
            <div className="text-white font-medium capitalize">{weatherData.weather.description}</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🌡️</div>
            <div className="text-sm text-white/60">Temperature</div>
            <div className="text-white font-medium">{weatherData.temperature.current}°{weatherData.units === 'imperial' ? 'F' : 'C'}</div>
          </div>
          <div>
            <div className="text-2xl mb-1">💨</div>
            <div className="text-sm text-white/60">Wind</div>
            <div className="text-white font-medium">{weatherData.wind.speed} {weatherData.units === 'imperial' ? 'mph' : 'm/s'}</div>
          </div>
          <div>
            <div className="text-2xl mb-1">💧</div>
            <div className="text-sm text-white/60">Humidity</div>
            <div className="text-white font-medium">{weatherData.humidity}%</div>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Smart Reminders</h4>
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <div className="text-4xl mb-2">😊</div>
            <p>No specific reminders needed for current conditions!</p>
            <p className="text-sm">Enjoy your day!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border ${getPriorityColor(reminder.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{reminder.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-white">{reminder.title}</h5>
                      <span className="text-sm">{getPriorityIcon(reminder.priority)}</span>
                    </div>
                    <p className="text-white/90 text-sm">{reminder.message}</p>
                  </div>
                  {showNotifications && (
                    <button
                      onClick={() => sendNotification(reminder)}
                      className="p-2 text-white/60 hover:text-white transition"
                      title="Send notification"
                    >
                      <Bell size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* General Tips */}
      <div className="mt-6 p-4 bg-white/10 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-3">General Weather Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
          <div>
            <h5 className="font-medium text-white mb-2">Dressing Tips:</h5>
            <ul className="space-y-1">
              <li>• Layer clothing for variable temperatures</li>
              <li>• Choose breathable fabrics in warm weather</li>
              <li>• Wear waterproof gear in rain/snow</li>
              <li>• Protect extremities in cold weather</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">Safety Tips:</h5>
            <ul className="space-y-1">
              <li>• Check weather before outdoor activities</li>
              <li>• Have emergency supplies ready</li>
              <li>• Stay informed about severe weather</li>
              <li>• Plan alternative indoor activities</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherReminders;
