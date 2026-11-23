/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        flicker: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1) translateY(0)' },
          '25%': { transform: 'scaleY(1.1) scaleX(0.95) translateY(-5px)' },
          '50%': { transform: 'scaleY(0.95) scaleX(1.05) translateY(2px)' },
          '75%': { transform: 'scaleY(1.05) scaleX(0.9) translateY(-3px)' },
        },
      },
      animation: {
        flicker1: 'flicker 2.2s ease-in-out infinite',
        flicker2: 'flicker 1.8s ease-in-out infinite 0.3s',
        flicker3: 'flicker 2.6s ease-in-out infinite 0.6s',
      },
    },
  },
};