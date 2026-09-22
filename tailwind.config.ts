import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        command: {
          bg: "#070B14",
          surface: "#0D1424",
          card: "rgba(15, 23, 42, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
        },
        safety: {
          orange: "#F97316",
          red: "#EF4444",
          yellow: "#EAB308",
          emerald: "#10B981",
          cyan: "#06B6D4",
          blue: "#3B82F6",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glowOrange: "0 0 25px -5px rgba(249, 115, 22, 0.3)",
        glowRed: "0 0 25px -5px rgba(239, 68, 68, 0.4)",
        glowEmerald: "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        glowBlue: "0 0 25px -5px rgba(59, 130, 246, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radar 4s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
