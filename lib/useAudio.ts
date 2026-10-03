"use client";

import { useEffect, useState } from "react";
import { audioUrl, withSpeed, type Speed } from "@/lib/audio";

// Checks whether a recording exists, remembering the answer so each file is only
// asked about once. Missing audio is normal (Tsega hasn't recorded it yet) and must
// never break a lesson — callers show "recording coming" instead.
const existsCache = new Map<string, Promise<boolean>>();

export function audioExists(path: string): Promise<boolean> {
  let p = existsCache.get(path);
  if (!p) {
    p = fetch(audioUrl(path), { method: "HEAD", cache: "no-store" })
      .then((r) => r.ok && (r.headers.get("content-type") ?? "").startsWith("audio"))
      .catch(() => false);
    existsCache.set(path, p);
  }
  return p;
}

/** Forget what we know about a file (e.g. right after recording it in the studio). */
export function forgetAudio(path: string) {
  existsCache.delete(path);
  existsCache.delete(withSpeed(path, "slow"));
  versions.set(path, Date.now());
}

const versions = new Map<string, number>();
let current: HTMLAudioElement | null = null;

export function stopAudio() {
  if (current) {
    current.pause();
    current = null;
  }
}

/**
 * Play a recording. Resolves `true` when it finishes playing, `false` if it
 * doesn't exist or can't be played. Starting a new sound stops the previous one.
 */
export async function playAudio(path: string, speed: Speed = "natural"): Promise<boolean> {
  const p = withSpeed(path, speed);
  if (!(await audioExists(p))) return false;
  stopAudio();
  const el = new Audio(audioUrl(p, versions.get(path)));
  current = el;
  return new Promise((resolve) => {
    el.onended = () => resolve(true);
    el.onerror = () => resolve(false);
    el.onpause = () => resolve(true);
    el.play().catch(() => resolve(false));
  });
}

export function useAudioAvailable(path: string | undefined): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    setAvailable(null);
    if (!path) {
      setAvailable(false);
      return;
    }
    audioExists(path).then((ok) => alive && setAvailable(ok));
    return () => {
      alive = false;
    };
  }, [path]);
  return available;
}

export function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
