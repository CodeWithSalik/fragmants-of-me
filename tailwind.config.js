// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- MAPPING OLD TOKENS TO NEW SYSTEM ---
        // Your old "parchment" now uses the new "Physics" variable
        parchment: "var(--c-paper-bg)", 
        ink: "var(--c-ink-primary)",
        "ink-meta": "var(--c-ink-secondary)",
        
        // New utility for cards
        surface: "var(--c-paper-surface)",
        
        // Preserving your specific Brand Palette
        accent: "#E6B15C", 
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
      borderRadius: {
        md: "var(--radius-sm)",
        lg: "var(--radius-md)",
        xl: "var(--radius-lg)",
      },
      boxShadow: {
        // The Glass Shadow
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        // The Paper Shadow (Depth + Glaze)
        'paper': 'var(--shadow-md), var(--shadow-inset)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
    },
  },
  plugins: [],
};