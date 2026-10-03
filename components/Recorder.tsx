"use client";

import { useEffect, useRef } from "react";
import { useRecorder } from "@/lib/useRecorder";

/** Record yourself, then play it back. Pairs with an AudioButton for the native recording. */
export function Recorder({ label = "Record yourself", onRecorded }: { label?: string; onRecorded?: () => void }) {
  const { state, url, start, stop } = useRecorder();
  const player = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (state === "recorded") onRecorded?.();
  }, [state, onRecorded]);

  if (state === "unsupported") {
    return <span className="text-sm text-muted">Recording isn&rsquo;t available in this browser — say it out loud instead.</span>;
  }
  if (state === "denied") {
    return (
      <span className="text-sm text-muted">
        Microphone access was blocked. Say it out loud for now, or allow the microphone in your browser settings.
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {state === "recording" ? (
        <button
          type="button"
          onClick={stop}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-berbere px-4 text-white shadow-sm"
        >
          <span className="h-3 w-3 animate-pulse rounded-full bg-white" /> Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-berbere px-4 text-berbere"
        >
          🎙️ {state === "recorded" ? "Record again" : label}
        </button>
      )}
      {url && state === "recorded" && (
        <>
          <button
            type="button"
            onClick={() => player.current?.play()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-indigo px-4 text-white"
          >
            ▶ Yours
          </button>
          <audio ref={player} src={url} className="hidden" />
        </>
      )}
    </span>
  );
}
