import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', message = 'Loading weather data' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const dotSizes = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center p-8"
    >
      {/* Main Spinner Container */}
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className={`${sizeClasses[size]} border-4 border-white/20 border-t-white rounded-full`}
        />
        
        {/* Inner Pulse */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className={`absolute inset-2 bg-white/20 rounded-full`}
        />

        {/* Center Weather Icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <span className={`${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
            🌤️
          </span>
        </motion.div>
      </div>

      {/* Loading Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-center"
        >
          <p className="text-white/90 font-medium">
            {message}
          </p>
          
          {/* Animated Dots */}
          <motion.div className="flex justify-center mt-2 space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                variants={dotVariants}
                animate="animate"
                transition={{ delay: index * 0.2 }}
                className={`${dotSizes[size]} bg-white/60 rounded-full`}
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Subtle Background Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
        }}
      />
    </motion.div>
  );
};

// Alternative compact loading component for inline use
export const CompactLoader = ({ className = '' }) => {
  return (
    <motion.div
      className={`inline-flex items-center space-x-2 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      <span className="loading-dots">Loading</span>
    </motion.div>
  );
};

// Weather-specific loading states
export const WeatherLoadingStates = {
  searching: () => <LoadingSpinner message="Searching for location" />,
  fetching: () => <LoadingSpinner message="Fetching weather data" />,
  location: () => <LoadingSpinner message="Getting your location" />,
  updating: () => <LoadingSpinner size="small" message="Updating forecast" />
};

export default LoadingSpinner;
