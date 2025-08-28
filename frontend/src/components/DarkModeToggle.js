import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = ({ darkMode, onToggle, autoTheme }) => {
  const toggleVariants = {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  };

  const iconVariants = {
    hidden: { 
      opacity: 0, 
      rotate: -90,
      scale: 0.5
    },
    visible: { 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    }
  };

  const switchVariants = {
    light: { x: 0 },
    dark: { x: 20 }
  };

  return (
    <motion.button
      onClick={onToggle}
      className="relative flex items-center justify-between w-14 h-7 lg:w-16 lg:h-8 rounded-full backdrop-blur-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
      variants={toggleVariants}
      animate={darkMode ? 'dark' : 'light'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      title={`${autoTheme ? 'Auto theme' : 'Manual theme'}: ${darkMode ? 'Dark' : 'Light'} mode`}
    >
      {/* Background Track */}
      <div className="relative w-full h-full rounded-full overflow-hidden">
        {/* Switch Circle */}
                 <motion.div
           className="absolute top-0.5 left-0.5 lg:top-1 lg:left-1 w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
           variants={switchVariants}
           animate={darkMode ? 'dark' : 'light'}
           transition={{
             type: 'spring',
             stiffness: 300,
             damping: 30
           }}
         >
          {/* Icon inside the switch */}
          <motion.div
            key={darkMode ? 'moon' : 'sun'}
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
                         {darkMode ? (
               <Moon size={12} className="text-slate-700" />
             ) : (
               <Sun size={12} className="text-yellow-500" />
             )}
          </motion.div>
        </motion.div>

        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
                     <motion.div
             animate={{
               opacity: darkMode ? 0.3 : 0.7,
               scale: darkMode ? 0.8 : 1
             }}
             transition={{ duration: 0.3 }}
           >
             <Sun size={10} className="text-yellow-300" />
           </motion.div>
           
           <motion.div
             animate={{
               opacity: darkMode ? 0.7 : 0.3,
               scale: darkMode ? 1 : 0.8
             }}
             transition={{ duration: 0.3 }}
           >
             <Moon size={10} className="text-blue-200" />
           </motion.div>
        </div>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        whileHover={{
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Auto Theme Indicator */}
      {autoTheme && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
      )}
    </motion.button>
  );
};

export default DarkModeToggle;
