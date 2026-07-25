import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lemon: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15', // Core Lemon Yellow
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
          glow: '#FFE853',
        },
        lime: {
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16', // Fresh Lime Green
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          700: '#15803D',
          800: '#166534', // Deep Forest Green
          900: '#14532D',
          950: '#052E16',
        },
        cream: {
          50: '#FFFFF7',
          100: '#FEFCE8', // Warm Cream
          200: '#FEF7C0',
          300: '#FDF090',
        },
        glass: {
          card: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(255, 255, 255, 0.45)',
          dark: 'rgba(20, 83, 45, 0.85)',
          input: 'rgba(255, 255, 255, 0.9)',
        }
      },
      fontFamily: {
        heading: ['var(--font-fredoka)', 'Fredoka', 'sans-serif'],
        body: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'bubble-rise': 'bubble 10s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'lemon-spin': 'lemonSpin 20s linear infinite',
        'wiggle': 'wiggle 0.6s ease-in-out infinite',
        'pop-in': 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(8deg)' },
        },
        bubble: {
          '0%': { transform: 'translateY(100vh) scale(0.6)', opacity: '0.2' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-10vh) scale(1.1)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(250, 204, 21, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 35px rgba(132, 204, 22, 0.8))' },
        },
        lemonSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'glass-md': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.18)',
        'lemon-glow': '0 0 25px rgba(250, 204, 21, 0.6), 0 0 50px rgba(250, 204, 21, 0.3)',
        'lime-glow': '0 0 25px rgba(132, 204, 22, 0.6), 0 0 50px rgba(132, 204, 22, 0.3)',
      }
    },
  },
  plugins: [],
};

export default config;
