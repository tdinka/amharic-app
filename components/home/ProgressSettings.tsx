"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { RomanizationSetting } from "@/components/Roman";
import { localDateKey } from "@/lib/progress/dates";
import { useProgress } from "@/lib/progress/ProgressProvider";

export function ProgressSettings() {
  const { store, act } = useProgress();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function exportProgress() {
    const json = await store.exportJSON();
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `amharic-progress-${localDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: "Saved. Keep the file somewhere safe.", ok: true });
  }

  async function importProgress(file: File) {
    if (!window.confirm("Replace the progress on this device with the progress in this file?")) return;
    try {
      await act(async (s) => s.importJSON(await file.text()));
      setMessage({ text: "Progress loaded.", ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "That file couldn't be read.", ok: false });
    }
  }

  return (
    <section className="mt-12 space-y-5 rounded-2xl border border-line bg-card p-5">
      <h2 className="font-display text-lg font-semibold">Settings</h2>

      <Link href="/welcome" className="block text-sm font-semibold text-berbere">
        About Amharic and this course →
      </Link>

      <div>
        <div className="mb-2 text-sm font-semibold">Show the sounds in Latin letters</div>
        <RomanizationSetting />
        <p className="mt-2 text-sm text-muted">
          Start with &ldquo;Always&rdquo;. As you get comfortable, switch to &ldquo;On tap&rdquo;, then &ldquo;Hidden&rdquo;, so you read the
          fidel itself.
        </p>
      </div>

      <div>
        <div className="mb-1 text-sm font-semibold">Your progress</div>
        <p className="text-sm text-muted">
          Progress is saved in this browser on this device. Save a copy to move it to another device, or as a backup.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={exportProgress} className="rounded-full border border-line bg-paper px-4 py-2 text-sm">
            ⬇ Save progress to a file
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded-full border border-line bg-paper px-4 py-2 text-sm"
          >
            ⬆ Load progress from a file
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) importProgress(file);
            }}
          />
        </div>
        {message && (
          <p className={`mt-2 text-sm ${message.ok ? "text-leaf" : "text-berbere-dark"}`} role="status">
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
