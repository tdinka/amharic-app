// Shared decorative and feedback marks for the "Mix 2.1" look.

/** The mesob-basket medallion: woven segments in the app's colours, with an ink ring. */
export function Mesob({ size = 64 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full border-2 border-ink"
      style={{
        width: size,
        height: size,
        background:
          "conic-gradient(#A8142A 0 12.5%, #F0AE1C 0 25%, #1E7448 0 37.5%, #D9558E 0 50%, #A8142A 0 62.5%, #F0AE1C 0 75%, #1E7448 0 87.5%, #8E5BD1 0)",
      }}
    >
      <div className="rounded-full border-2 border-card bg-[#8E5BD1]" style={{ width: size * 0.3, height: size * 0.3 }} />
    </div>
  );
}

export function CheckIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  );
}

export function CrossIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden className={className}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

/** A small round ✓ or ✕ badge, so right and wrong never rely on colour alone. */
export function AnswerMark({ correct, className = "" }: { correct: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${correct ? "bg-leaf" : "bg-rose"} ${className}`}
      aria-label={correct ? "right" : "wrong"}
      role="img"
    >
      {correct ? <CheckIcon size={14} /> : <CrossIcon size={13} />}
    </span>
  );
}
