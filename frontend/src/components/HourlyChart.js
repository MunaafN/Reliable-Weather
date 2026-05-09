import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const HourlyChart = ({ hours, units = 'metric' }) => {
  const chartData = useMemo(() => {
    if (!hours || hours.length === 0) return null;
    const temps = hours.map(h => h.temp);
    const rain = hours.map(h => h.rainChance || 0);
    const minT = Math.min(...temps) - 2;
    const maxT = Math.max(...temps) + 2;
    const range = maxT - minT || 1;

    const W = 720, H = 140, PAD_X = 30, PAD_Y = 20;
    const plotW = W - PAD_X * 2, plotH = H - PAD_Y * 2;

    const points = temps.map((t, i) => ({
      x: PAD_X + (i / (temps.length - 1)) * plotW,
      y: PAD_Y + (1 - (t - minT) / range) * plotH,
      temp: t,
      time: new Date(hours[i].time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      rain: rain[i],
      condition: hours[i].condition,
    }));

    // Smooth curve using cardinal spline
    const pathD = points.length > 1
      ? 'M ' + points.map((p, i) => {
          if (i === 0) return `${p.x},${p.y}`;
          const prev = points[i - 1];
          const cpx = (prev.x + p.x) / 2;
          return `C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
        }).join(' ')
      : '';

    // Area fill path
    const areaD = pathD + ` L ${points[points.length - 1].x},${H - PAD_Y + 5} L ${points[0].x},${H - PAD_Y + 5} Z`;

    return { points, pathD, areaD, minT, maxT, W, H, PAD_X, PAD_Y };
  }, [hours]);

  if (!chartData) return null;

  const { points, pathD, areaD, W, H } = chartData;

  return (
    <div className="w-full overflow-x-auto -mx-1 px-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px]" style={{ maxHeight: '160px' }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(79,140,255,0.3)" />
            <stop offset="100%" stopColor="rgba(79,140,255,0)" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F8CFF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path d={areaD} fill="url(#tempGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />

        {/* Temperature line */}
        <motion.path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeOut' }} />

        {/* Data points + labels */}
        {points.map((p, i) => (
          <g key={i}>
            {/* Show every 3rd time label to avoid clutter */}
            {i % 3 === 0 && (
              <text x={p.x} y={H - 3} textAnchor="middle" className="text-[8px]" fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                {p.time}
              </text>
            )}
            {/* Temp label */}
            {i % 2 === 0 && (
              <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[9px]" fill="var(--text-main)" fontFamily="Inter, sans-serif" fontWeight="600">
                {p.temp}°
              </text>
            )}
            {/* Rain indicator */}
            {p.rain > 30 && i % 2 === 0 && (
              <text x={p.x} y={p.y + 14} textAnchor="middle" className="text-[7px]" fill="rgba(56,189,248,0.6)" fontFamily="Inter, sans-serif">
                {p.rain}%
              </text>
            )}
            {/* Dot */}
            <motion.circle cx={p.x} cy={p.y} r="2.5" fill="#4F8CFF" stroke="var(--app-bg)" strokeWidth="1.5"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.03 }} />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default HourlyChart;
