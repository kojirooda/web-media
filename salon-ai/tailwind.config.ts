import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1e2a3a",
        gold: "#c9a96e",
        "gold-light": "#f0e6d3",
        salonbg: "#f5f3f0",
        muted: "#8a9bb0",
        success: "#4caf8a",
        warning: "#f0a04b",
        danger: "#e57373",
        line: "#e8e4de",
      },
      fontFamily: {
        sans: ["-apple-system", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
