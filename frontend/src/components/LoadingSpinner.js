import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Fetching weather data' }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative w-12 h-12 mb-4">
      <motion.div
        className="absolute inset-0 border-2 border-white/[0.08] border-t-brand-blue rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-lg">🌤️</div>
    </div>
    <p className="text-sm text-slate-400">{message}</p>
    <div className="flex gap-1 mt-2">
      {[0,1,2].map(i => (
        <motion.div key={i} className="w-1.5 h-1.5 bg-slate-600 rounded-full"
          animate={{ opacity: [0.3,1,0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i*0.2 }}
        />
      ))}
    </div>
  </div>
);

export const CompactLoader = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <motion.div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
    <span className="text-xs loading-dots">Loading</span>
  </div>
);

export const WeatherLoadingStates = {
  searching: () => <LoadingSpinner message="Searching for location" />,
  fetching: () => <LoadingSpinner message="Fetching weather data" />,
  location: () => <LoadingSpinner message="Getting your location" />,
  updating: () => <LoadingSpinner message="Updating forecast" />,
};

export default LoadingSpinner;
