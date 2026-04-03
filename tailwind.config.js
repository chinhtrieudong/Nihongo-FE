/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        // Theme-based colors using CSS variables
        bg: "var(--bg)",
        card: "var(--card)",
        border: "var(--border)",

        text: {
          main: "var(--text-main)",
          sub: "var(--text-sub)",
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },

        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",

        secondary: "var(--secondary)",
        "secondary-hover": "var(--secondary-hover)",

        // Semantic colors
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",

        // Surface colors
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },

        // Border variants
        "border-light": "var(--border-light)",
        "border-default": "var(--border-default)",
        "border-dark": "var(--border-dark)",

        // Interactive states
        "hover-bg": "var(--hover-bg)",
        "active-bg": "var(--active-bg)",
        "focus-ring": "var(--focus-ring)",

        // Legacy color mappings for backward compatibility
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          925: "var(--secondary-925)",
          950: "var(--secondary-950)",
        },
        sakura: {
          50: "#fef7f0",
          100: "#ffc0cb", // Light pink for sakura
          200: "#fad4bd",
          300: "#f6b896",
          400: "#f1996d",
          500: "#ed7e4a",
          600: "#d46635",
          700: "#b8542a",
          800: "#954424",
          900: "#773920",
        },
      },
      fontFamily: {
        sans: ["var(--app-font-family)", "system-ui", "sans-serif"],
        japanese: ["var(--kanji-font-family)", "system-ui", "sans-serif"],
        osaka: ["var(--kanji-font-family)", "system-ui", "sans-serif"],
        kosugi: ["var(--kanji-font-family)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 1s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
