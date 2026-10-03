import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF5EC",
        card: "#FFFDF8",
        line: "#E8DCCB",
        ink: "#2E2119",
        muted: "#7A6656",
        berbere: { DEFAULT: "#B0472C", light: "#F5E1D8", dark: "#8A3520" },
        ochre: { DEFAULT: "#C8962B", light: "#F6EBCF" },
        indigo: { DEFAULT: "#2F4B7C", light: "#E1E7F2" },
        leaf: { DEFAULT: "#3C7A52", light: "#E0EFE4" },
      },
      fontFamily: {
        sans: ["var(--font-latin)", "var(--font-ethiopic)", "system-ui", "sans-serif"],
        ethiopic: ["var(--font-ethiopic)", "serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
        },
      },
      animation: {
        pop: "pop 180ms ease-out",
        glow: "glow 500ms ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
