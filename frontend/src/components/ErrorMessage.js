import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw, Wifi, MapPin } from 'lucide-react';

const ErrorMessage = ({ 
  message, 
  onDismiss, 
  onRetry, 
  type = 'error',
  persistent = false 
}) => {
  const getErrorIcon = () => {
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
      return <Wifi className="w-5 h-5" />;
    }
    if (message.toLowerCase().includes('location')) {
      return <MapPin className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getErrorType = () => {
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
      return 'network';
    }
    if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('location')) {
      return 'notFound';
    }
    if (message.toLowerCase().includes('timeout')) {
      return 'timeout';
    }
    return 'general';
  };

  const errorConfig = {
    network: {
      color: 'bg-orange-500/20 border-orange-500/30 text-orange-100',
      iconColor: 'text-orange-300',
      title: 'Connection Issue'
    },
    notFound: {
      color: 'bg-blue-500/20 border-blue-500/30 text-blue-100',
      iconColor: 'text-blue-300',
      title: 'Not Found'
    },
    timeout: {
      color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-100',
      iconColor: 'text-yellow-300',
      title: 'Request Timeout'
    },
    general: {
      color: 'bg-red-500/20 border-red-500/30 text-red-100',
      iconColor: 'text-red-300',
      title: 'Error'
    }
  };

  const currentConfig = errorConfig[getErrorType()];

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const iconVariants = {
    hidden: { rotate: -10 },
    visible: { 
      rotate: 0,
      transition: { delay: 0.1 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    tap: { scale: 0.95 }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`
          relative max-w-md mx-auto backdrop-blur-md border rounded-2xl p-4 shadow-xl
          ${currentConfig.color}
        `}
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="relative flex items-start space-x-3">
          {/* Error Icon */}
          <motion.div
            variants={iconVariants}
            className={`flex-shrink-0 ${currentConfig.iconColor}`}
          >
            {getErrorIcon()}
          </motion.div>

          {/* Error Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">
              {currentConfig.title}
            </h4>
            <p className="text-sm opacity-90 leading-relaxed">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mt-3">
              {onRetry && (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={onRetry}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm border border-white/20"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Dismiss Button */}
          {onDismiss && !persistent && (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onDismiss}
              className={`flex-shrink-0 p-1 rounded-lg transition-colors ${currentConfig.iconColor} hover:bg-white/10`}
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Auto-dismiss timer indicator */}
        {!persistent && !onDismiss && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
            onAnimationComplete={() => onDismiss?.()}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Predefined error components for common scenarios
export const NetworkError = ({ onRetry, onDismiss }) => (
  <ErrorMessage
    message="Unable to connect to weather service. Please check your internet connection."
    onRetry={onRetry}
    onDismiss={onDismiss}
    type="network"
  />
);

export const LocationError = ({ onRetry, onDismiss }) => (
  <ErrorMessage
    message="Unable to access your location. Please enable location services or search manually."
    onRetry={onRetry}
    onDismiss={onDismiss}
    type="location"
  />
);

export const CityNotFoundError = ({ onDismiss }) => (
  <ErrorMessage
    message="City not found. Please check the spelling and try again."
    onDismiss={onDismiss}
    type="notFound"
  />
);

export const TimeoutError = ({ onRetry, onDismiss }) => (
  <ErrorMessage
    message="Request timed out. The weather service might be busy."
    onRetry={onRetry}
    onDismiss={onDismiss}
    type="timeout"
  />
);

export default ErrorMessage;
