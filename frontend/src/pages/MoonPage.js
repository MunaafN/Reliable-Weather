import React from 'react';
import MoonPhaseCalendar from '../components/MoonPhaseCalendar';

function MoonPage({ forecastData }) {
  return (
    <div className="space-y-4 min-w-0">
      <h2 className="text-xl font-semibold text-white">Moon Phases</h2>
      <div className="backdrop-blur bg-white/10 rounded-xl p-4 border border-white/10 overflow-hidden">
        <MoonPhaseCalendar onClose={() => {}} forecastData={forecastData} isPage={true} />
      </div>
    </div>
  );
}

export default MoonPage;


