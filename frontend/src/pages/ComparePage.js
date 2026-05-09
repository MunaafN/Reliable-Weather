import React from 'react';
import WeatherComparison from '../components/WeatherComparison';

function ComparePage({ units }) {
  return (
    <div className="space-y-4 min-w-0">
      <WeatherComparison onClose={() => {}} units={units} />
    </div>
  );
}

export default ComparePage;
