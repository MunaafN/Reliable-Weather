import React from 'react';
import WeatherNews from '../components/WeatherNews';

function NewsPage({ cityName, countryName }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Weather News</h2>
      <div className="backdrop-blur bg-white/10 rounded-xl p-0 border border-white/10 overflow-hidden">
        <WeatherNews onClose={() => {}} cityName={cityName} countryName={countryName} isPage={true} />
      </div>
    </div>
  );
}

export default NewsPage;


