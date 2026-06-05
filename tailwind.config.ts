import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tiki: {
          // Rouges (logo)
          red: "#C62828",
          "red-dark": "#8B0000",
          "red-light": "#EF5350",
          // Or (logo)
          gold: "#D4A017",
          "gold-light": "#F5D060",
          "gold-dark": "#A07810",
          // Bleu nuit mer (navbar, footer, hero)
          ocean: "#0A1E2E",
          "ocean-mid": "#0F2A3D",
          "ocean-light": "#163347",
          // Sections claires
          dark: "#ffffff",
          "dark-2": "#f0f9ff",
          // Lagon turquoise
          lagon: "#0077b6",
          "lagon-light": "#0096c7",
          "lagon-pale": "#caf0f8",
          // Textes
          cream: "#E8F4F8",
          "cream-dark": "#A8C8D8",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        display: ["Bebas Neue", "Poppins", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "tiki-gradient": "linear-gradient(135deg, #8B0000 0%, #C62828 50%, #D4A017 100%)",
        "ocean-gradient": "linear-gradient(180deg, #0A1E2E 0%, #0F2A3D 100%)",
        "lagon-gradient": "linear-gradient(135deg, #0A1E2E 0%, #0891B2 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
