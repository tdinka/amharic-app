"use client";

import { useState } from "react";
import { withSpeed } from "@/lib/audio";
import { playAudio, useAudioAvailable, useAudioSource } from "@/lib/useAudio";

type Props = {
  path: string | undefined;
  label?: string;
  size?: "sm" | "md" | "lg";
  /** Show a 🐢 button too, if a slow recording exists. */
  withSlow?: boolean;
  className?: string;
};

export function RecordingComing({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-dashed border-line bg-paper px-3 py-1 text-xs text-muted ${className}`}
      title="A native speaker hasn't recorded this one yet"
    >
      🎙️ recording coming
    </span>
  );
}

/** Marks audio that is a computer-voice stand-in, not Tsega's recording. */
export function ComputerVoice({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-indigo-light px-2 py-0.5 text-[11px] text-indigo ${className}`}
      title="A computer voice for now — a native speaker's recording will replace it"
    >
      computer voice
    </span>
  );
}

export function AudioButton({ path, label = "Play", size = "md", withSlow = false, className = "" }: Props) {
  const source = useAudioSource(path);
  const available = source === null ? null : source !== "none";
  const slowAvailable = useAudioAvailable(withSlow && path ? withSpeed(path, "slow") : undefined);
  const [playing, setPlaying] = useState<null | "natural" | "slow">(null);

  if (available === null) {
    return <span className={`inline-block h-10 w-10 animate-pulse rounded-full bg-line ${className}`} />;
  }
  if (!available || !path) return <RecordingComing className={className} />;

  const dims = size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-lg";

  async function play(speed: "natural" | "slow") {
    if (!path) return;
    setPlaying(speed);
    await playAudio(path, speed);
    setPlaying(null);
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => play("natural")}
        aria-label={label}
        className={`${dims} inline-flex items-center justify-center rounded-full border-2 border-ink bg-berbere text-white shadow-press transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
          playing === "natural" ? "animate-pulse" : ""
        }`}
      >
        ▶
      </button>
      {slowAvailable && (
        <button
          type="button"
          onClick={() => play("slow")}
          aria-label={`${label} slowly`}
          className={`btn-secondary h-9 px-3 text-sm font-normal ${
            playing === "slow" ? "animate-pulse" : ""
          }`}
        >
          🐢 slow
        </button>
      )}
      {source === "tts" && <ComputerVoice />}
    </span>
  );
}
