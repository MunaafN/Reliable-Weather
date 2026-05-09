import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { getCurrentLocation } from '../services/weatherApi';

const LocationButton = ({ onLocationFound, loading: parentLoading }) => {
  const [getting, setGetting] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (parentLoading || getting) return;
    setGetting(true); setError(null);
    try {
      const coords = await getCurrentLocation();
      onLocationFound(coords);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally { setGetting(false); }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={parentLoading || getting}
        className="btn-ghost flex items-center gap-1.5 disabled:opacity-40"
        aria-label="Get weather for current location"
        title="Use my location"
      >
        {getting ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
        <span className="hidden sm:inline text-xs">GPS</span>
      </button>
      {error && (
        <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[10px] rounded-lg whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default LocationButton;
