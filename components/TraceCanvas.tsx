"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ETHIOPIC_FONT_FAMILY } from "@/lib/fonts";

type Point = { x: number; y: number }; // 0..1 across the canvas
type Stroke = Point[];

const GLYPH_SCALE = 0.78; // character size as a share of the canvas, matching the guide
const INK_WIDTH = 0.06; // pen width as a share of the canvas

function glyphFont(px: number) {
  return `${Math.round(px * GLYPH_SCALE)}px ${ETHIOPIC_FONT_FAMILY}`;
}

function drawGlyph(ctx: CanvasRenderingContext2D, char: string, px: number) {
  ctx.font = glyphFont(px);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, px / 2, px * 0.54);
}

function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], px: number) {
  ctx.lineWidth = px * INK_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    if (s.length === 0) continue;
    ctx.beginPath();
    ctx.moveTo(s[0].x * px, s[0].y * px);
    if (s.length === 1) ctx.lineTo(s[0].x * px + 0.01, s[0].y * px);
    for (const p of s.slice(1)) ctx.lineTo(p.x * px, p.y * px);
    ctx.stroke();
  }
}

/** Rasterize at low resolution and return which cells are inked. */
function mask(n: number, paint: (ctx: CanvasRenderingContext2D) => void): boolean[] {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = ctx.strokeStyle = "#000";
  paint(ctx);
  const { data } = ctx.getImageData(0, 0, n, n);
  const out: boolean[] = new Array(n * n);
  for (let i = 0; i < n * n; i++) out[i] = data[i * 4 + 3] > 64;
  return out;
}

function dilate(m: boolean[], n: number, r: number): boolean[] {
  const out = new Array(n * n).fill(false);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (!m[y * n + x]) continue;
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < n && yy < n) out[yy * n + xx] = true;
        }
    }
  return out;
}

/**
 * Prototype check (no stroke-order data yet): how much of the drawing lies on the
 * letter, and how much of the letter the drawing covers.
 */
export function scoreTrace(char: string, strokes: Stroke[]): "nice" | "tryAgain" | "tooLittle" {
  const n = 48;
  const glyph = mask(n, (ctx) => drawGlyph(ctx, char, n));
  const drawn = mask(n, (ctx) => drawStrokes(ctx, strokes, n));
  const drawnCount = drawn.filter(Boolean).length;
  if (drawnCount < 12) return "tooLittle";
  const glyphNear = dilate(glyph, n, 2);
  const drawnNear = dilate(drawn, n, 2);
  let onLetter = 0;
  let covered = 0;
  let glyphCount = 0;
  for (let i = 0; i < n * n; i++) {
    if (drawn[i] && glyphNear[i]) onLetter++;
    if (glyph[i]) {
      glyphCount++;
      if (drawnNear[i]) covered++;
    }
  }
  const precision = onLetter / drawnCount;
  const recall = glyphCount ? covered / glyphCount : 0;
  return precision >= 0.75 && recall >= 0.65 ? "nice" : "tryAgain";
}

export function TraceCanvas({
  char,
  showGuide,
  onStrokesChange,
  size = 280,
}: {
  char: string;
  showGuide: boolean;
  onStrokesChange: (strokes: Stroke[]) => void;
  size?: number;
}) {
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    document.fonts.load(glyphFont(size), char).then(() => setFontReady(true));
  }, [char, size]);

  const setup = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }, [size]);

  // Guide layer: faint character + a soft cross to help placement.
  useEffect(() => {
    const ctx = setup(guideRef.current);
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = "#E8DCCB";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();
    if (showGuide) {
      ctx.fillStyle = "rgba(46, 33, 25, 0.13)";
      drawGlyph(ctx, char, size);
    }
  }, [char, showGuide, size, fontReady, setup]);

  const redraw = useCallback(() => {
    const ctx = inkRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = "#2E2119";
    drawStrokes(ctx, strokes.current, size);
  }, [size]);

  // New character: clear the ink.
  useEffect(() => {
    setup(inkRef.current);
    strokes.current = [];
    redraw();
    onStrokesChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, size]);

  function point(e: React.PointerEvent): Point {
    const r = inkRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }

  return (
    <div className="relative mx-auto touch-none select-none" style={{ width: size, height: size }}>
      <canvas ref={guideRef} className="absolute inset-0 rounded-2xl border border-line bg-card" style={{ width: size, height: size }} />
      <canvas
        ref={inkRef}
        aria-label={`Drawing area for ${char}`}
        className="absolute inset-0 cursor-crosshair"
        style={{ width: size, height: size }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          strokes.current = [...strokes.current, [point(e)]];
          redraw();
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          strokes.current[strokes.current.length - 1].push(point(e));
          redraw();
        }}
        onPointerUp={() => {
          drawing.current = false;
          onStrokesChange([...strokes.current]);
        }}
        onPointerCancel={() => {
          drawing.current = false;
          onStrokesChange([...strokes.current]);
        }}
      />
    </div>
  );
}

export type { Stroke };
