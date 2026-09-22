/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#05040d',
          900: '#0a0818',
          800: '#120f26',
          700: '#1c1836',
          600: '#2a234f',
          500: '#3d3272',
        },
        moonlight: {
          400: '#b9a9ff',
          300: '#d3c7ff',
        },
        accent: {
          yes: '#4ade80',
          no: '#f87171',
          gold: '#f5cf6f',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(185, 169, 255, 0.45)',
      },
      backgroundImage: {
        'moon-gradient': 'radial-gradient(circle at 30% 20%, rgba(185,169,255,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(245,207,111,0.12), transparent 45%)',
      }
    },
  },
  plugins: [],
}
