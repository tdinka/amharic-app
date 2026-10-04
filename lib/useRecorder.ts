"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "recorded" | "denied" | "unsupported";

/**
 * Records audio with the MediaRecorder API. Learners' recordings stay in the
 * browser (an object URL) and are never uploaded; the studio uses `blob` to save
 * Tsega's recordings to her own computer.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)) {
      setState("unsupported");
    }
  }, []);

  // Free the old recording when a new one replaces it, and on unmount.
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  useEffect(() => {
    return () => {
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        setBlob(blob);
        setUrl(URL.createObjectURL(blob));
        setState("recorded");
      };
      recorder.current = rec;
      rec.start();
      setState("recording");
    } catch {
      setState("denied");
    }
  }, []);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const reset = useCallback(() => {
    setBlob(null);
    setUrl(null);
    setState("idle");
  }, []);

  return { state, url, blob, start, stop, reset };
}
