import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Clock, MapPin } from 'lucide-react';

const WeatherAlerts = ({ alerts, onDismiss, showNoAlerts = false }) => {
  if (!alerts || alerts.length === 0) {
    if (showNoAlerts) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
            <div className="text-blue-500 text-4xl mb-3">✅</div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              No Current Weather Alerts
            </h3>
            <p className="text-blue-600 dark:text-blue-300">
              There are no active weather alerts for this location at the moment.
            </p>
          </div>
        </motion.div>
      );
    }
    return null;
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return 'bg-red-600 border-red-500';
      case 'severe':
        return 'bg-orange-600 border-orange-500';
      case 'moderate':
        return 'bg-yellow-600 border-yellow-500';
      case 'minor':
        return 'bg-blue-600 border-blue-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return '🚨';
      case 'severe':
        return '⚠️';
      case 'moderate':
        return '⚡';
      case 'minor':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-yellow-400" size={24} />
          Weather Alerts ({alerts.length})
        </h3>
        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <motion.div
            key={`${alert.msgtype || index}-${alert.effective_epoch || index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${getSeverityColor(alert.severity)} border rounded-xl p-4 text-white`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                <div>
                  <h4 className="font-semibold text-lg">
                    {alert.headline || 'Weather Alert'}
                  </h4>
                  {alert.areas && (
                    <p className="text-sm text-white/80 flex items-center gap-1">
                      <MapPin size={14} />
                      {alert.areas}
                    </p>
                  )}
                </div>
              </div>
              {alert.severity && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {alert.severity}
                </span>
              )}
            </div>

            {alert.desc && (
              <p className="text-white/90 mb-3 leading-relaxed">
                {alert.desc}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-white/80">
              {alert.effective && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Effective: {new Date(alert.effective).toLocaleString()}</span>
                </div>
              )}
              {alert.expires && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Expires: {new Date(alert.expires).toLocaleString()}</span>
                </div>
              )}
            </div>

            {alert.instruction && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-white/90 font-medium">Instructions:</p>
                <p className="text-sm text-white/80 mt-1">{alert.instruction}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeatherAlerts;
