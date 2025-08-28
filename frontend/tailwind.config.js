/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'weather-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'weather-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      backgroundImage: {
        'sunny-gradient': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        'cloudy-gradient': 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)',
        'rainy-gradient': 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
        'snowy-gradient': 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
        'clear-night-gradient': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'default-gradient': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'default-dark-gradient': 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
