import { Libre_Franklin, Noto_Sans, Noto_Serif_Ethiopic, Young_Serif } from "next/font/google";

/** The fidel. A serif Ethiopic, to sit with the painted-manuscript feel. */
export const ethiopicFont = Noto_Serif_Ethiopic({
  subsets: ["ethiopic", "latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-ethiopic",
  display: "swap",
});

/** Latin body text. */
export const latinFont = Libre_Franklin({
  subsets: ["latin", "latin-ext"],
  variable: "--font-latin",
  display: "swap",
});

/** Backup for romanization letters the body font may not have (e.g. ə). */
export const latinFallbackFont = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-latin-fallback",
  display: "swap",
});

/** Headings. Young Serif has a single (400) weight, so it's never synthesised bold. */
export const displayFont = Young_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// Import this file only from app/layout.tsx (server side). Browser-side code that
// needs a font name reads the CSS variable instead (see components/TraceCanvas.tsx).
