import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Star, Sun } from 'lucide-react';

const MoonPhaseCalendar = ({ onClose, forecastData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moonPhases, setMoonPhases] = useState([]);

  useEffect(() => {
    if (forecastData?.forecast) {
      const phases = forecastData.forecast
        .filter(day => day.astronomy?.moon_phase)
        .map(day => ({
          date: new Date(day.date),
          phase: day.astronomy.moon_phase,
          illumination: typeof day.astronomy.moon_illumination === 'number' 
            ? day.astronomy.moon_illumination 
            : 0,
          sunrise: day.astronomy.sunrise,
          sunset: day.astronomy.sunset,
          moonrise: day.astronomy.moonrise,
          moonset: day.astronomy.moonset
        }));
      setMoonPhases(phases);
    }
  }, [forecastData]);

  const getMoonPhaseIcon = (phase) => {
    const phaseLower = phase?.toLowerCase();
    if (phaseLower?.includes('new')) return '🌑';
    if (phaseLower?.includes('waxing crescent')) return '🌒';
    if (phaseLower?.includes('first quarter')) return '🌓';
    if (phaseLower?.includes('waxing gibbous')) return '🌔';
    if (phaseLower?.includes('full')) return '🌕';
    if (phaseLower?.includes('waning gibbous')) return '🌖';
    if (phaseLower?.includes('last quarter')) return '🌗';
    if (phaseLower?.includes('waning crescent')) return '🌘';
    return '🌙';
  };

  const getStargazingTip = (phase, illumination) => {
    const phaseLower = phase?.toLowerCase() || '';
    
    // Phase-specific tips
    if (phaseLower.includes('new')) {
      return "Perfect for stargazing! New moon means dark skies.";
    } else if (phaseLower.includes('crescent')) {
      return "Good for stargazing. Crescent moon provides minimal light pollution.";
    } else if (phaseLower.includes('quarter')) {
      return "Moderate stargazing conditions. Quarter moon adds some light.";
    } else if (phaseLower.includes('gibbous')) {
      return "Limited stargazing. Gibbous moon brightens the sky significantly.";
    } else if (phaseLower.includes('full')) {
      return "Difficult stargazing. Full moon illuminates the entire sky.";
    }
    
    // Fallback based on illumination
    if (illumination < 0.1) return "Perfect for stargazing! New moon means dark skies.";
    if (illumination < 0.25) return "Good for stargazing. Crescent moon provides minimal light pollution.";
    if (illumination < 0.5) return "Moderate stargazing conditions. Quarter moon adds some light.";
    if (illumination < 0.75) return "Limited stargazing. Gibbous moon brightens the sky significantly.";
    if (illumination < 0.9) return "Challenging stargazing. Nearly full moon creates bright conditions.";
    return "Difficult stargazing. Full moon illuminates the entire sky.";
  };

  const getVisibilityRating = (illumination) => {
    if (illumination < 0.1) return { rating: 'Excellent', color: 'text-green-400' };
    if (illumination < 0.25) return { rating: 'Good', color: 'text-blue-400' };
    if (illumination < 0.5) return { rating: 'Fair', color: 'text-yellow-400' };
    if (illumination < 0.75) return { rating: 'Poor', color: 'text-orange-400' };
    return { rating: 'Very Poor', color: 'text-red-400' };
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth;
    });
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="weather-card p-6 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Moon className="text-blue-300" size={28} />
          Moon Phase Calendar
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
        >
          ← Previous
        </button>
        <h4 className="text-xl font-semibold text-white">
          {formatMonth(currentMonth)}
        </h4>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
        >
          Next →
        </button>
      </div>

      {/* Current Month Moon Phases */}
      {moonPhases.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <div className="text-4xl mb-2">🌙</div>
          <p>No moon phase data available</p>
          <p className="text-sm">Please search for a city first to get moon phase information</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 max-h-96 overflow-y-auto">
          {moonPhases.map((phase, index) => (
          <motion.div
            key={phase.date.toISOString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-4 min-h-[200px] flex flex-col"
          >
            <div className="text-center mb-3">
              <div className="text-4xl mb-2">
                {getMoonPhaseIcon(phase.phase)}
              </div>
              <div className="text-lg font-semibold text-white">
                {phase.date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-white/80 capitalize">
                {phase.phase}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Illumination:</span>
                <span className="text-white font-medium">
                  {typeof phase.illumination === 'number' ? Math.round(phase.illumination * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Stargazing:</span>
                <span className={`font-medium ${getVisibilityRating(phase.illumination || 0).color}`}>
                  {getVisibilityRating(phase.illumination || 0).rating}
                </span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-white/10 rounded-lg flex-1">
              <p className="text-xs text-white/70 leading-relaxed">
                {getStargazingTip(phase.phase, phase.illumination)}
              </p>
            </div>
          </motion.div>
        ))}
        </div>
      )}

      {/* Stargazing Tips */}
      <div className="glass-effect rounded-xl p-4">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Star className="text-yellow-300" size={20} />
          Stargazing Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
          <div>
            <h5 className="font-medium text-white mb-2">Best Times:</h5>
            <ul className="space-y-1">
              <li>• New moon phases (0-10% illumination)</li>
              <li>• After midnight when city lights dim</li>
              <li>• Clear, cloudless nights</li>
              <li>• Away from urban light pollution</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">Equipment:</h5>
            <ul className="space-y-1">
              <li>• Binoculars for basic viewing</li>
              <li>• Telescope for detailed observation</li>
              <li>• Star charts or mobile apps</li>
              <li>• Red flashlight to preserve night vision</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sun & Moon Times */}
      {moonPhases.length > 0 && (
        <div className="mt-6 glass-effect rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sun className="text-yellow-300" size={20} />
            Today's Sun & Moon Times
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-white/60">Sunrise</div>
              <div className="text-white font-medium">{moonPhases[0]?.sunrise || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Sunset</div>
              <div className="text-white font-medium">{moonPhases[0]?.sunset || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Moonrise</div>
              <div className="text-white font-medium">{moonPhases[0]?.moonrise || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-white/60">Moonset</div>
              <div className="text-white font-medium">{moonPhases[0]?.moonset || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MoonPhaseCalendar;
