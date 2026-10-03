"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress/ProgressProvider";
import type { RomanizationLevel } from "@/lib/progress/types";

/**
 * Shows a romanization according to the learner's fading setting:
 * always shown → shown on tap → hidden. Pass `level` to override.
 */
export function Roman({
  text,
  level,
  className = "",
}: {
  text: string | undefined;
  level?: RomanizationLevel;
  className?: string;
}) {
  const { data } = useProgress();
  const [revealed, setRevealed] = useState(false);
  const mode = level ?? data.settings.romanization;
  if (!text || mode === "hidden") return null;

  if (mode === "tap" && !revealed) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setRevealed(true);
        }}
        className={`rounded-full bg-line/60 px-3 py-0.5 text-sm text-muted ${className}`}
      >
        show sound
      </button>
    );
  }
  return <span className={`text-muted ${className}`}>{text}</span>;
}

export function RomanizationSetting() {
  const { data, act } = useProgress();
  const options: { value: RomanizationLevel; label: string }[] = [
    { value: "always", label: "Always" },
    { value: "tap", label: "On tap" },
    { value: "hidden", label: "Hidden" },
  ];
  return (
    <div role="radiogroup" aria-label="Romanization" className="inline-flex rounded-full border border-line bg-card p-1 text-sm">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={data.settings.romanization === o.value}
          onClick={() => act((s) => s.updateSettings({ romanization: o.value }))}
          className={`rounded-full px-3 py-1 ${
            data.settings.romanization === o.value ? "bg-ink text-paper" : "text-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
