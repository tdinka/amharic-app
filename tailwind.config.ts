import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // "Mix 2.1" — ink outlines from Ethiopian painting, woven-basket colours.
      // The names are the app's; the comments say what each colour is now.
      colors: {
        paper: "#E9E1CE", // linen ground
        card: "#FFFDF7",
        line: "#DDD3C2", // soft fills: tracks, placeholders (borders use ink, below)
        ink: "#2A1A1D",
        muted: "#6B5A5C",
        berbere: { DEFAULT: "#A8142A", light: "#F3DDE0", dark: "#7E0F20" }, // crimson: actions only
        ochre: { DEFAULT: "#F0AE1C", light: "#FBEBC2", dark: "#B37A06" }, // gold: highlights, always with dark text
        indigo: { DEFAULT: "#5A1822", light: "#F2E4E1" }, // maroon: secondary actions and labels
        leaf: { DEFAULT: "#1E7448", light: "#DCEFE2" }, // emerald: right answers, progress
        rose: { DEFAULT: "#B4566F", light: "#F7E3E7", dark: "#7A2F44" }, // wrong answers
      },
      // Every outline is ink, even where the markup says border-line.
      borderColor: { line: "#2A1A1D" },
      borderWidth: { DEFAULT: "1.5px" },
      // Tighter corners than Tailwind's defaults, closer to a painted panel.
      borderRadius: { xl: "8px", "2xl": "10px" },
      boxShadow: {
        press: "3px 3px 0 #2A1A1D", // only on things you can press
        "press-lg": "4px 4px 0 #2A1A1D",
      },
      fontFamily: {
        // Every variable has its own backup, so one missing font can never break the
        // whole list (an empty var() makes the browser drop the rule → Times).
        sans: ["var(--font-latin, system-ui)", "var(--font-latin-fallback, sans-serif)", "var(--font-ethiopic, serif)", "system-ui", "sans-serif"],
        ethiopic: ["var(--font-ethiopic, serif)", "var(--font-latin, system-ui)", "serif"],
        display: ["var(--font-display, Georgia)", "var(--font-latin-fallback, serif)", "Georgia", "serif"],
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
