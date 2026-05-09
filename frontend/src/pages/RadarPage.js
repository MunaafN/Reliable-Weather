import React from 'react';
import WeatherRadar from '../components/WeatherRadar';

function RadarPage({ weatherData }) {
  return (
    <div className="space-y-4 min-w-0">
      <WeatherRadar
        lat={weatherData?.coordinates?.lat}
        lon={weatherData?.coordinates?.lon}
        city={weatherData?.city}
      />
    </div>
  );
}

export default RadarPage;
