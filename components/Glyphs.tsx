"use client";

import { useId } from "react";

/**
 * A big character that "draws itself": the outline is traced, then filled.
 * A prototype stand-in until real stroke-order data exists.
 */
export function DrawnGlyph({ char, size = 160 }: { char: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label={char} role="img">
      <text
        key={char /* restart the animation for each new character */}
        x="50"
        y="54"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="78"
        className="draw-glyph fill-ink stroke-berbere font-ethiopic"
        style={{ strokeWidth: 1.2, ["--dash" as string]: 700 }}
      >
        {char}
      </text>
    </svg>
  );
}

/**
 * A fidel form with its vowel mark in a second colour. Done by drawing the form
 * in ochre, then drawing it again in ink but masked to the shape of the family's
 * 1st-order (base) character — so whatever is *added* to the base shows ochre.
 */
export function VowelMarkGlyph({
  char,
  base,
  size = 64,
  active = false,
}: {
  char: string;
  base: string;
  size?: number;
  active?: boolean;
}) {
  const maskId = `vm${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const isBase = char === base;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={char}
      className={active ? "animate-glow" : ""}
    >
      <defs>
        <mask id={maskId}>
          <text
            x="50"
            y="54"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="78"
            className="font-ethiopic"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
          >
            {base}
          </text>
        </mask>
      </defs>
      <text
        x="50"
        y="54"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="78"
        className="font-ethiopic"
        fill={isBase ? "#2E2119" : "#C8962B"}
      >
        {char}
      </text>
      {!isBase && (
        <text
          x="50"
          y="54"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="78"
          className="font-ethiopic"
          fill="#2E2119"
          mask={`url(#${maskId})`}
        >
          {char}
        </text>
      )}
    </svg>
  );
}
