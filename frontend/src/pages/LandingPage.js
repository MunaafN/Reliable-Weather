import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Search, MapPin, Activity, History, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center py-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-4xl mx-auto px-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold mb-8">
          <Zap size={14} />
          <span>Next-Generation Weather Intelligence</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--text-main)] mb-6">
          The weather app <br className="hidden md:block"/>
          built for <span className="gradient-text">professionals.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Experience hyper-accurate forecasting, real-time radar, air quality monitoring, and historical climate data wrapped in a beautiful, dynamic interface.
        </p>
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4 mt-8"
      >
        <FeatureCard 
          icon={<Activity className="text-brand-cyan" size={24} />}
          title="Real-Time Analytics"
          desc="Up-to-the-minute weather metrics including UV index, wind patterns, and humidity levels."
        />
        <FeatureCard 
          icon={<MapPin className="text-brand-blue" size={24} />}
          title="Precision Radar"
          desc="Interactive global radar maps predicting precipitation and storm movements."
        />
        <FeatureCard 
          icon={<History className="text-brand-purple" size={24} />}
          title="Historical Data"
          desc="Access past weather conditions for any city to plan future trips and events."
        />
        <FeatureCard 
          icon={<Cloud className="text-brand-emerald" size={24} />}
          title="Air Quality Insights"
          desc="Detailed breakdown of PM2.5, PM10, and Ozone levels to protect your health."
        />
        <FeatureCard 
          icon={<Shield className="text-amber-500" size={24} />}
          title="Reliable Forecasting"
          desc="7-day advanced forecasting powered by the industry-leading WeatherAPI data."
        />
        <FeatureCard 
          icon={<Search className="text-rose-500" size={24} />}
          title="Instant Search"
          desc="Lightning-fast global city lookup with built-in location detection."
        />
      </motion.div>

      {/* Call to action */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-20 text-center"
      >
        <p className="text-[var(--text-muted)] text-sm mb-4">Start by searching for a city above, or use your current location.</p>
        <div className="w-16 h-1 bg-gradient-to-r from-brand-blue to-brand-cyan mx-auto rounded-full opacity-50"></div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="weather-card p-6 flex flex-col items-start text-left hover:-translate-y-1 transition-transform duration-300 cursor-default">
    <div className="w-12 h-12 rounded-2xl bg-[var(--element-bg)] border border-[var(--border-color)] flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">{title}</h3>
    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
