/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fdfbf7',
        pencil: '#2d2d2d',
        muted: '#e5e0d8',
        accent: '#ff4d4d',
        ink: '#2d5da1',
        postit: '#fff9c4',
      },
      fontFamily: {
        heading: ['Kalam', 'cursive'],
        body: ['Patrick Hand', 'cursive'],
      },
      boxShadow: {
        hard: '4px 4px 0px 0px #2d2d2d',
        'hard-sm': '3px 3px 0px 0px rgba(45,45,45,0.1)',
        'hard-lg': '8px 8px 0px 0px #2d2d2d',
        'hard-hover': '2px 2px 0px 0px #2d2d2d',
        'hard-accent': '4px 4px 0px 0px #ff4d4d',
        none: 'none',
      },
      borderRadius: {
        wobbly: '255px 15px 225px 15px / 15px 225px 15px 255px',
        'wobbly-md': '15px 225px 15px 255px / 255px 15px 225px 15px',
        'wobbly-sm': '185px 10px 195px 10px / 10px 195px 10px 185px',
        blob: '60% 40% 50% 50% / 40% 60% 50% 50%',
      },

      animation: {
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        wiggle: 'wiggle 0.3s ease-in-out',
        float: 'float 6s ease-in-out infinite',
        'fade-sketch': 'fadeSketch 0.8s ease-out forwards',
        'float-soft': 'floatSoft 5s ease-in-out infinite',
        'breath': 'breath 3s ease-in-out infinite',
      },

      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },

        // NEW
        fadeSketch: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px) scale(0.98) rotate(-1deg)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1) rotate(0deg)',
          },
        },
        floatSoft: {
          '0%, 100%': {
            transform: 'translateY(0) rotate(-1deg)',
          },
          '50%': {
            transform: 'translateY(-6px) rotate(1deg)',
          },
        },
        breath: {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};