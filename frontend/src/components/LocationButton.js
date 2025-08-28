import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { getCurrentLocation } from '../services/weatherApi';

const LocationButton = ({ onLocationFound, loading: parentLoading }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationClick = async () => {
    if (parentLoading || isGettingLocation) return;

    setIsGettingLocation(true);
    setError(null);

    try {
      const coordinates = await getCurrentLocation();
      onLocationFound(coordinates);
    } catch (err) {
      setError(err.message);
      console.error('Location error:', err);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const isLoading = parentLoading || isGettingLocation;

  return (
    <div className="flex flex-col items-center">
      <motion.button
        onClick={handleLocationClick}
        disabled={isLoading}
        className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-medium rounded-2xl backdrop-blur-md border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        aria-label="Get weather for current location"
      >
        {isGettingLocation ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Getting Location...</span>
          </>
        ) : (
          <>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <MapPin className="w-5 h-5" />
            </motion.div>
            <span>Use My Location</span>
          </>
        )}
      </motion.button>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-2 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-100 text-xs rounded-lg backdrop-blur-md"
        >
          {error}
        </motion.div>
      )}

      {/* Help Text */}
      {!error && !isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-xs text-white/60 text-center max-w-xs"
        >
          Get weather for your current location
        </motion.p>
      )}
    </div>
  );
};

export default LocationButton;
