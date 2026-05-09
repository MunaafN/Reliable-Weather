import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Clock, MapPin } from 'lucide-react';

const WeatherAlerts = ({ alerts, onDismiss, showNoAlerts = false }) => {
  if (!alerts || alerts.length === 0) {
    if (showNoAlerts) {
      return (
        <div className="glass-effect p-4 text-center">
          <p className="text-xs text-slate-500">✅ No active weather alerts</p>
        </div>
      );
    }
    return null;
  }

  const severityConfig = {
    extreme: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '🚨' },
    severe: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '⚠️' },
    moderate: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '⚡' },
    minor: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'ℹ️' },
    default: { bg: 'bg-white/[0.03]', border: 'border-white/[0.08]', icon: '📢' },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <AlertTriangle size={14} className="text-amber-400" />
          Alerts ({alerts.length})
        </h3>
        <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={14} /></button>
      </div>

      {alerts.map((alert, i) => {
        const cfg = severityConfig[alert.severity?.toLowerCase()] || severityConfig.default;
        return (
          <motion.div
            key={`${alert.msgtype||i}-${alert.effective_epoch||i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-lg shrink-0">{cfg.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white leading-snug">{alert.headline || 'Weather Alert'}</h4>
                  {alert.severity && <span className="text-[10px] px-2 py-0.5 bg-white/[0.06] rounded-full text-slate-400 shrink-0">{alert.severity}</span>}
                </div>
                {alert.areas && <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={9} />{alert.areas}</p>}
                {alert.desc && <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{alert.desc}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                  {alert.effective && <span className="flex items-center gap-1"><Clock size={9} />{new Date(alert.effective).toLocaleString()}</span>}
                  {alert.expires && <span>Expires: {new Date(alert.expires).toLocaleString()}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WeatherAlerts;
