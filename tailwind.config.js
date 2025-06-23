// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        parchment: "#fdf6e3",
        ink: "#2c2c2c",
        amber: {
          DEFAULT: "#b85c38",
          dark: "#7c2d12",
        },
        clay: "#7C5E4B",
        mahogany: "#4B2E2E",
        olive: "#5B7553",
        rustic: "#4B7FA5",
        gold: "#BBA14F",
      },
    },
  },
  plugins: [],
};
