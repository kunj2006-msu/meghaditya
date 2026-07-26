/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'kenburns': 'kenburns 20s ease-in-out infinite alternate',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.06) translate(-1%, -1%)' },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#0284c7',
          sky: '#38bdf8',
          amber: '#f59e0b',
          orange: '#ea580c',
          emerald: '#10b981',
          teal: '#0d9488',
        }
      }
    },
  },
  plugins: [],
};
