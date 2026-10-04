"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ttsPath, withSpeed, type Speed } from "@/lib/audio";
import { STUDIO_CAN_SAVE, studioItems, type ReviewTarget, type StudioItem } from "@/lib/studio";
import { fileExists } from "@/lib/useAudio";
import { SpeedSlot, type SlotStatus } from "./SpeedSlot";

type Group = StudioItem["group"];
type Filter = "all" | "record" | "review";

const GROUPS: { id: Group; label: string }[] = [
  { id: "letters", label: "Letters" },
  { id: "words", label: "Words" },
  { id: "stories", label: "Story lines" },
];
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "record", label: "Needs recording" },
  { id: "review", label: "Not reviewed" },
];
const SPEEDS: Speed[] = ["natural", "slow"];
const UI_KEY = "amharic-app:studio-ui";

function reviewKey(t: ReviewTarget) {
  return t.type === "family" ? `family:${t.base}` : t.type === "word" ? `word:${t.id}` : `story:${t.lessonId}:${t.stepIndex}:${t.lineIndex}`;
}

async function statusOf(file: string): Promise<SlotStatus> {
  if (await fileExists(file)) return "native";
  if (await fileExists(ttsPath(file))) return "tts";
  return "none";
}

function ReviewedSwitch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={!STUDIO_CAN_SAVE}
      onClick={() => onChange(!on)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
        on ? "border-leaf bg-leaf-light text-leaf" : "border-line bg-card text-muted"
      } disabled:opacity-50`}
    >
      <span className={`h-3 w-3 rounded-full ${on ? "bg-leaf" : "bg-line"}`} />
      {on ? "Reviewed" : "Mark reviewed"}
    </button>
  );
}

export function StudioPage() {
  const items = useMemo(() => studioItems(), []);
  const [group, setGroup] = useState<Group>("letters");
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<Record<string, SlotStatus>>({});
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({}); // optimistic overrides
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Remember the tab and filter (saving a "reviewed" switch can reload the page).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(UI_KEY) ?? "{}");
      if (GROUPS.some((g) => g.id === saved.group)) setGroup(saved.group);
      if (FILTERS.some((f) => f.id === saved.filter)) setFilter(saved.filter);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(UI_KEY, JSON.stringify({ group, filter }));
    } catch {}
  }, [group, filter]);

  const refresh = useCallback(async (files: string[]) => {
    const entries = await Promise.all(files.map(async (f) => [f, await statusOf(f)] as const));
    setStatus((s) => ({ ...s, ...Object.fromEntries(entries) }));
  }, []);

  useEffect(() => {
    refresh(items.flatMap((i) => SPEEDS.map((sp) => withSpeed(i.path, sp))));
  }, [items, refresh]);

  const isReviewed = (item: StudioItem) => reviewed[reviewKey(item.review)] ?? item.reviewed;

  async function setItemReviewed(target: ReviewTarget, value: boolean) {
    const key = reviewKey(target);
    setReviewed((r) => ({ ...r, [key]: value }));
    setReviewError(null);
    const res = await fetch("/api/studio/reviewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, reviewed: value }),
    }).catch(() => null);
    if (!res?.ok) {
      setReviewed((r) => ({ ...r, [key]: !value }));
      setReviewError("Couldn't save that change. Is the app running on your computer?");
    }
  }

  const needsRecording = (item: StudioItem) => SPEEDS.some((sp) => status[withSpeed(item.path, sp)] !== "native");
  const visible = items.filter(
    (i) => i.group === group && (filter === "all" || (filter === "record" ? needsRecording(i) : !isReviewed(i))),
  );

  const natural = items.filter((i) => status[i.path] === "native").length;
  const slow = items.filter((i) => status[withSpeed(i.path, "slow")] === "native").length;
  const reviewedCount = items.filter(isReviewed).length;

  // Letters are grouped by family; the family is what gets marked reviewed.
  const sections: { title?: string; target?: ReviewTarget; items: StudioItem[] }[] =
    group === "letters"
      ? Array.from(new Map(visible.map((i) => [i.family!.base, i.family!])).values()).map((f) => ({
          title: f.consonantRoman ? `${f.base} family · ${f.consonantRoman}` : `${f.base} family`,
          target: { type: "family", base: f.base } as ReviewTarget,
          items: visible.filter((i) => i.family?.base === f.base),
        }))
      : [{ items: visible }];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="font-display text-xl font-semibold">Recording studio</h1>
            <p className="text-xs text-muted">
              Yours: {natural}/{items.length} natural · {slow}/{items.length} slow · Reviewed: {reviewedCount}/{items.length}
            </p>
          </div>
          <Link href="/" className="text-sm text-berbere">
            ← App
          </Link>
        </div>
        <div className="mx-auto flex max-w-3xl flex-wrap gap-2 px-4 pb-3">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${group === g.id ? "bg-ink text-paper" : "border border-line bg-card"}`}
            >
              {g.label} ({items.filter((i) => i.group === g.id).length})
            </button>
          ))}
          <span className="mx-1 w-px bg-line" />
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${filter === f.id ? "bg-indigo text-white" : "border border-line bg-card"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-5">
        {!STUDIO_CAN_SAVE && (
          <p className="rounded-2xl bg-berbere-light p-4 text-sm">
            Saving only works while the app runs on your computer (<code>npm run dev</code>). You can still listen here.
          </p>
        )}
        <p className="text-sm text-muted">
          Record each one at a natural pace, then slowly and clearly. Silence at the start and end is trimmed for you.
          Your recording replaces the computer voice straight away.
        </p>
        {reviewError && <p className="rounded-xl bg-berbere-light px-3 py-2 text-sm">{reviewError}</p>}
        {visible.length === 0 && <p className="text-muted">Nothing here — all done for this filter. 🎉</p>}

        {sections.map((section) => (
          <section key={section.title ?? "all"} className="space-y-3">
            {section.title && section.target && (
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">{section.title}</h2>
                <ReviewedSwitch
                  on={isReviewed(section.items[0])}
                  onChange={(v) => setItemReviewed(section.target!, v)}
                  label={`Mark the ${section.title} reviewed`}
                />
              </div>
            )}
            {section.items.map((item) => (
              <div key={item.key} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-ethiopic text-4xl leading-tight">{item.text}</div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-sm">
                      {item.roman && <span className="text-muted">{item.roman}</span>}
                      {item.english && <span className="font-semibold">{item.english}</span>}
                    </div>
                    {item.note && <p className="mt-1 text-xs text-muted">{item.note}</p>}
                  </div>
                  {group !== "letters" && (
                    <ReviewedSwitch
                      on={isReviewed(item)}
                      onChange={(v) => setItemReviewed(item.review, v)}
                      label={`Mark ${item.text} reviewed`}
                    />
                  )}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {SPEEDS.map((sp) => (
                    <SpeedSlot
                      key={sp}
                      path={item.path}
                      speed={sp}
                      status={status[withSpeed(item.path, sp)]}
                      onSaved={() => refresh([withSpeed(item.path, sp)])}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
