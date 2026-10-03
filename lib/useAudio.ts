"use client";

import { useEffect, useState } from "react";
import { audioUrl, ttsPath, withSpeed, type Speed } from "@/lib/audio";

// Checks whether a file exists, remembering the answer so each file is only asked
// about once. Missing audio is normal (Tsega hasn't recorded it yet) and must never
// break a lesson — callers fall back to the computer voice, then "recording coming".
const existsCache = new Map<string, Promise<boolean>>();

export function fileExists(path: string): Promise<boolean> {
  let p = existsCache.get(path);
  if (!p) {
    p = fetch(audioUrl(path), { method: "HEAD", cache: "no-store" })
      .then((r) => r.ok && (r.headers.get("content-type") ?? "").startsWith("audio"))
      .catch(() => false);
    existsCache.set(path, p);
  }
  return p;
}

/** "native" = Tsega's recording, "tts" = computer-voice stand-in. */
export type AudioSource = "native" | "tts";

/** Which version of a recording to play: Tsega's if it exists, else the computer voice. */
export async function audioSource(path: string): Promise<AudioSource | null> {
  if (await fileExists(path)) return "native";
  if (await fileExists(ttsPath(path))) return "tts";
  return null;
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
 * Play a recording (or its computer-voice stand-in). Resolves `true` when it
 * finishes playing, `false` if neither exists or it can't be played. Starting a
 * new sound stops the previous one.
 */
export async function playAudio(path: string, speed: Speed = "natural"): Promise<boolean> {
  const p = withSpeed(path, speed);
  const source = await audioSource(p);
  if (!source) return false;
  stopAudio();
  const el = new Audio(source === "native" ? audioUrl(p, versions.get(path)) : audioUrl(ttsPath(p)));
  current = el;
  return new Promise((resolve) => {
    el.onended = () => resolve(true);
    el.onerror = () => resolve(false);
    el.onpause = () => resolve(true);
    el.play().catch(() => resolve(false));
  });
}

/** null while checking, "none" when there's nothing to play yet. */
export function useAudioSource(path: string | undefined): AudioSource | "none" | null {
  const [source, setSource] = useState<AudioSource | "none" | null>(null);
  useEffect(() => {
    let alive = true;
    setSource(null);
    if (!path) {
      setSource("none");
      return;
    }
    audioSource(path).then((s) => alive && setSource(s ?? "none"));
    return () => {
      alive = false;
    };
  }, [path]);
  return source;
}

export function useAudioAvailable(path: string | undefined): boolean | null {
  const source = useAudioSource(path);
  return source === null ? null : source !== "none";
}

export function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
