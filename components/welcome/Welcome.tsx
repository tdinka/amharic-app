"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AudioButton } from "@/components/AudioButton";
import { VowelMarkGlyph } from "@/components/Glyphs";
import { Roman } from "@/components/Roman";
import { wordAudioPath } from "@/lib/audio";
import { families, intro, lessons, wordById, type IntroPage } from "@/lib/content";
import { nextLesson } from "@/lib/learning";
import { useProgress } from "@/lib/progress/ProgressProvider";

function Example({ example }: { example: NonNullable<IntroPage["example"]> }) {
  if (example.word) {
    const word = wordById(example.word);
    if (!word) return null;
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line bg-card p-5 text-center">
        <div className="font-ethiopic text-6xl leading-tight">{word.amharic}</div>
        <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2">
          <Roman text={word.roman} level="always" />
          <span className="font-semibold">{word.english}</span>
        </div>
        <AudioButton path={wordAudioPath(word)} label={`Play ${word.english}`} className="mt-3" />
      </div>
    );
  }
  const family = families.find((f) => f.consonantRoman === example.family);
  if (!family) return null;
  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <div className="grid grid-cols-7 gap-1">
        {family.forms.map((f) => (
          <div key={f.char} className="flex flex-col items-center">
            <VowelMarkGlyph char={f.char} base={family.base} size={44} />
            <span className="text-xs text-muted">{f.roman}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-muted">One family: the same base shape, with a gold vowel mark for each vowel.</p>
    </div>
  );
}

export function Welcome() {
  const router = useRouter();
  const { ready, data, act } = useProgress();
  const [index, setIndex] = useState(0);
  const pages = intro.pages;
  const page = pages[index];
  const last = index === pages.length - 1;
  const upNext = ready ? nextLesson(data) : lessons[0];
  const firstTime = ready && Object.keys(data.completedLessons).length === 0;

  async function finish(href: string) {
    await act((s) => s.updateSettings({ introSeen: true }));
    router.push(href);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-4">
        <div className="flex gap-1.5" aria-label={`Page ${index + 1} of ${pages.length}`}>
          {pages.map((_, i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-berbere" : "w-2 bg-line"}`} />
          ))}
        </div>
        {!last && (
          <button type="button" onClick={() => finish("/")} className="text-sm text-muted underline">
            Skip
          </button>
        )}
      </header>

      <main key={index} className="mx-auto w-full max-w-2xl flex-1 animate-pop px-4 pb-36 pt-6">
        {index === 0 && <div className="tibeb mb-6 rounded" />}
        <h1 className="font-display text-3xl font-semibold leading-tight">{page.title}</h1>
        {page.example && (
          <div className="mt-5">
            <Example example={page.example} />
          </div>
        )}
        <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink/90">
          {page.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-3">
          {last ? (
            <>
              <button
                type="button"
                onClick={() => finish(upNext ? `/lesson/${upNext.id}` : "/")}
                className="btn-primary w-full py-3.5 text-lg"
              >
                {firstTime || !upNext ? (upNext ? "Start lesson 1" : "Back to lessons") : "Continue learning"}
              </button>
              <button type="button" onClick={() => finish("/")} className="w-full py-2 text-muted">
                {firstTime ? "Look around first" : "Back to lessons"}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex(index - 1)}
                  className="btn-secondary px-5 py-3.5"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => setIndex(index + 1)}
                className="btn-primary flex-1 py-3.5 text-lg"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
