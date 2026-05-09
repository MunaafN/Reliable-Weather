import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = ({ darkMode, onToggle, autoTheme }) => (
  <button
    onClick={onToggle}
    className="relative w-10 h-5 rounded-full bg-white/[0.06] border border-white/[0.08] transition-colors hover:bg-white/[0.1] focus:outline-none"
    aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    title={`${autoTheme ? 'Auto' : 'Manual'}: ${darkMode ? 'Dark' : 'Light'}`}
  >
    <motion.div
      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
      animate={{ left: darkMode ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {darkMode ? <Moon size={8} className="text-slate-700" /> : <Sun size={8} className="text-amber-500" />}
    </motion.div>
    {autoTheme && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-emerald rounded-full border border-surface" />}
  </button>
);

export default DarkModeToggle;
