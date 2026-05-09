/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        app: { bg: 'var(--app-bg)', },
        surface: { DEFAULT: 'var(--surface)', 50: '#172033', 100: '#1E293B', 200: '#253349', 300: '#334155' },
        brand: { blue: '#4F8CFF', cyan: '#38BDF8', purple: '#7C3AED', emerald: '#10B981', amber: '#F59E0B', red: '#EF4444' },
      },
      backgroundImage: {
        'sunny-gradient': 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #0ea5e9 100%)',
        'cloudy-gradient': 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)',
        'rainy-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #334155 100%)',
        'snowy-gradient': 'linear-gradient(135deg, #1e293b 0%, #64748b 50%, #94a3b8 100%)',
        'clear-night-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        'default-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        'default-dark-gradient': 'linear-gradient(135deg, #0B1220 0%, #111827 100%)',
      },
      borderRadius: { '2xl': '16px', '3xl': '20px', '4xl': '24px' },
      boxShadow: {
        card: '0 4px 24px -4px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px -4px rgba(0,0,0,0.5)',
        'glow-blue': '0 0 24px rgba(79,140,255,0.12)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
