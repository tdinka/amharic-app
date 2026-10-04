"use client";

import { useEffect, useRef, useState } from "react";
import { withSpeed, type Speed } from "@/lib/audio";
import { recordingToMp3 } from "@/lib/mp3";
import { STUDIO_CAN_SAVE } from "@/lib/studio";
import { forgetAudio, playAudio } from "@/lib/useAudio";
import { useRecorder } from "@/lib/useRecorder";

export type SlotStatus = "native" | "tts" | "none";

const STATUS = {
  native: { label: "✓ yours", className: "bg-leaf-light text-leaf" },
  tts: { label: "computer voice", className: "bg-indigo-light text-indigo" },
  none: { label: "missing", className: "bg-berbere-light text-berbere-dark" },
};

type Take = { mp3: Blob; url: string; seconds: number; silent: boolean };

/** One recording slot (natural or slow) for one item: play what's there, record, listen, save. */
export function SpeedSlot({
  path,
  speed,
  status,
  onSaved,
}: {
  path: string;
  speed: Speed;
  status: SlotStatus | undefined;
  onSaved: () => void;
}) {
  const recorder = useRecorder();
  const [take, setTake] = useState<Take | null>(null);
  const [busy, setBusy] = useState<null | "converting" | "saving">(null);
  const [error, setError] = useState<string | null>(null);
  const player = useRef<HTMLAudioElement>(null);
  const file = withSpeed(path, speed);

  // Convert each finished recording to MP3 so what you hear is exactly what gets saved.
  useEffect(() => {
    if (recorder.state !== "recorded" || !recorder.blob) return;
    let alive = true;
    setBusy("converting");
    setError(null);
    recordingToMp3(recorder.blob)
      .then(({ mp3, seconds, silent }) => {
        if (!alive) return;
        setTake({ mp3, url: URL.createObjectURL(mp3), seconds, silent });
      })
      .catch(() => alive && setError("That recording couldn't be read. Try again."))
      .finally(() => alive && setBusy(null));
    return () => {
      alive = false;
    };
  }, [recorder.state, recorder.blob]);

  useEffect(() => {
    return () => {
      if (take) URL.revokeObjectURL(take.url);
    };
  }, [take]);

  function redo() {
    setTake(null);
    setError(null);
    recorder.reset();
  }

  async function save() {
    if (!take) return;
    setBusy("saving");
    setError(null);
    try {
      const res = await fetch(`/api/studio/audio?path=${encodeURIComponent(file)}`, {
        method: "POST",
        headers: { "Content-Type": "audio/mpeg" },
        body: take.mp3,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Saving failed.");
      forgetAudio(path);
      setTake(null);
      recorder.reset();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving failed.");
    } finally {
      setBusy(null);
    }
  }

  const s = STATUS[status ?? "none"];

  return (
    <div className="rounded-xl border border-line bg-paper p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-14 text-sm font-semibold">{speed === "slow" ? "🐢 Slow" : "Natural"}</span>
        {status === undefined ? (
          <span className="h-5 w-16 animate-pulse rounded-full bg-line" />
        ) : (
          <span className={`rounded-full px-2 py-0.5 text-xs ${s.className}`}>{s.label}</span>
        )}
        {status && status !== "none" && !take && recorder.state !== "recording" && (
          <button
            type="button"
            onClick={() => playAudio(path, speed)}
            aria-label={`Play the ${speed} version`}
            className="h-8 w-8 rounded-full border border-line bg-card text-sm"
          >
            ▶
          </button>
        )}

        <span className="ml-auto flex flex-wrap items-center gap-2">
          {recorder.state === "recording" ? (
            <button
              type="button"
              onClick={recorder.stop}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-berbere px-4 text-sm text-white"
            >
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" /> Stop
            </button>
          ) : take ? (
            <>
              <button
                type="button"
                onClick={() => player.current?.play()}
                className="h-9 rounded-full border border-indigo px-3 text-sm text-indigo"
              >
                ▶ Listen ({take.seconds.toFixed(1)}s)
              </button>
              <button type="button" onClick={redo} disabled={!!busy} className="h-9 rounded-full border border-line px-3 text-sm">
                Redo
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!!busy || !STUDIO_CAN_SAVE}
                className="h-9 rounded-full bg-leaf px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy === "saving" ? "Saving…" : "Save"}
              </button>
              <audio ref={player} src={take.url} className="hidden" />
            </>
          ) : busy === "converting" ? (
            <span className="text-sm text-muted">Preparing…</span>
          ) : (
            <button
              type="button"
              onClick={recorder.start}
              disabled={recorder.state === "denied" || recorder.state === "unsupported"}
              className="h-9 rounded-full border border-berbere px-4 text-sm text-berbere disabled:opacity-40"
            >
              🎙️ {status === "native" ? "Re-record" : "Record"}
            </button>
          )}
        </span>
      </div>
      {take?.silent && <p className="mt-1.5 text-xs text-berbere-dark">That was almost silent — is the right microphone selected?</p>}
      {recorder.state === "denied" && (
        <p className="mt-1.5 text-xs text-berbere-dark">Microphone access is blocked. Allow it in the browser&rsquo;s site settings.</p>
      )}
      {error && <p className="mt-1.5 text-xs text-berbere-dark">{error}</p>}
    </div>
  );
}
