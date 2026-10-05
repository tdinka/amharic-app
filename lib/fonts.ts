import localFont from "next/font/local";
import { Libre_Franklin, Noto_Sans, Young_Serif } from "next/font/google";

/**
 * The fidel: Noto Serif Ethiopic (Ethiopic-script glyphs, weights 400–700), stored in
 * app/fonts/ under the SIL Open Font License (licence text beside it). It's stored
 * rather than downloaded at build time because Railway's builds got differing Google
 * responses for this font, so the page and stylesheet named it differently and it
 * never applied on the live site. Latin letters fall through to Libre Franklin.
 */
export const ethiopicFont = localFont({
  src: "../app/fonts/NotoSerifEthiopic-Ethiopic.woff2",
  weight: "400 700",
  variable: "--font-ethiopic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
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
