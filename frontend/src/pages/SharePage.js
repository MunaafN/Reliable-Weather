import React from 'react';
import WeatherSharing from '../components/WeatherSharing';

function SharePage({ weatherData, forecastData }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Share Weather</h2>
      <div className="backdrop-blur bg-white/10 rounded-xl p-4 border border-white/10">
        <WeatherSharing onClose={() => {}} weatherData={weatherData} forecastData={forecastData} />
      </div>
    </div>
  );
}

export default SharePage;


