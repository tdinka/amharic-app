import { Fraunces, Noto_Sans, Noto_Sans_Ethiopic } from "next/font/google";

export const ethiopicFont = Noto_Sans_Ethiopic({
  subsets: ["ethiopic", "latin", "latin-ext"],
  variable: "--font-ethiopic",
  display: "swap",
});

/** Latin text, including romanization letters like ē and ə. */
export const latinFont = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-latin",
  display: "swap",
});

export const displayFont = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

/** The real CSS font-family string, for drawing characters onto a <canvas>. */
export const ETHIOPIC_FONT_FAMILY = ethiopicFont.style.fontFamily;
