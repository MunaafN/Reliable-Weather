import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw, Wifi, MapPin } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss, onRetry, type = 'error', persistent = false }) => {
  const isNetwork = message?.toLowerCase().includes('network') || message?.toLowerCase().includes('connection');
  const isNotFound = message?.toLowerCase().includes('not found') || message?.toLowerCase().includes('location');
  const Icon = isNetwork ? Wifi : isNotFound ? MapPin : AlertTriangle;
  const accent = isNetwork ? 'amber' : isNotFound ? 'blue' : 'red';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`relative flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md bg-brand-${accent}/5 border-brand-${accent}/20`}
        style={{ backgroundColor: `var(--tw-colors-brand-${accent}, rgba(255,255,255,0.03))` }}
      >
        <Icon size={16} className={`text-brand-${accent} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white mb-0.5">{isNetwork ? 'Connection Issue' : isNotFound ? 'Not Found' : 'Error'}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-brand-blue hover:underline">
              <RefreshCw size={10} /> Retry
            </button>
          )}
        </div>
        {onDismiss && !persistent && (
          <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"><X size={14} /></button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export const NetworkError = ({ onRetry, onDismiss }) => <ErrorMessage message="Unable to connect. Check your internet connection." onRetry={onRetry} onDismiss={onDismiss} />;
export const LocationError = ({ onRetry, onDismiss }) => <ErrorMessage message="Unable to access your location. Enable location services or search manually." onRetry={onRetry} onDismiss={onDismiss} />;
export const CityNotFoundError = ({ onDismiss }) => <ErrorMessage message="City not found. Check the spelling and try again." onDismiss={onDismiss} />;
export const TimeoutError = ({ onRetry, onDismiss }) => <ErrorMessage message="Request timed out. The weather service might be busy." onRetry={onRetry} onDismiss={onDismiss} />;

export default ErrorMessage;
