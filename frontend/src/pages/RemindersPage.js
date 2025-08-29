import React from 'react';
import WeatherReminders from '../components/WeatherReminders';

function RemindersPage({ weatherData, forecastData }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Weather Reminders</h2>
      <div className="backdrop-blur bg-white/10 rounded-xl p-4 border border-white/10">
        <WeatherReminders onClose={() => {}} weatherData={weatherData} forecastData={forecastData} />
      </div>
    </div>
  );
}

export default RemindersPage;


