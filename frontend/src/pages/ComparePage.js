import React from 'react';
import WeatherComparison from '../components/WeatherComparison';

function ComparePage() {
  return (
    <div className="space-y-4 min-w-0">
      <h2 className="text-xl font-semibold text-white">Compare Locations</h2>
      <div className="backdrop-blur bg-white/10 rounded-xl p-4 border border-white/10">
        <WeatherComparison onClose={() => {}} />
      </div>
    </div>
  );
}

export default ComparePage;


