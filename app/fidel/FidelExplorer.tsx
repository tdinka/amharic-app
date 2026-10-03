"use client";

import { useEffect, useMemo, useState } from "react";
import { AudioButton } from "@/components/AudioButton";
import { DrawnGlyph } from "@/components/Glyphs";
import { charAudioPath } from "@/lib/audio";
import { families, familyByBase, fidel, TOTAL_CHARACTERS, TOTAL_WEEKS, type FidelFamily } from "@/lib/content";
import { learnedFamilies, previewAll } from "@/lib/learning";
import { playAudio } from "@/lib/useAudio";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { VOWEL_ORDER_ROMAN } from "@/lib/romanization";

type Selected = { family: FidelFamily; char: string; roman: string; label: string };

export function FidelExplorer() {
  const { data, ready } = useProgress();
  const [showRoman, setShowRoman] = useState(true);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setPreview(previewAll());
  }, []);
  useEffect(() => {
    if (ready) setShowRoman(data.settings.romanization !== "hidden");
  }, [ready, data.settings.romanization]);

  const learned = useMemo(
    () => new Set(preview ? families.map((f) => f.base) : learnedFamilies(data).map((f) => f.base)),
    [data, preview],
  );
  const learnedCount = families.filter((f) => learned.has(f.base)).reduce((n, f) => n + f.forms.length, 0);

  function select(family: FidelFamily, char: string, roman: string, label: string) {
    setSelected({ family, char, roman, label });
    playAudio(charAudioPath(char) ?? "");
  }

  return (
    <main className="mx-auto max-w-3xl px-3 pb-32 pt-6 sm:px-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-3xl font-semibold">The fidel</h1>
          <p className="mt-1 text-muted">
            {families.length} families × 7 vowel orders. You know{" "}
            <strong className="text-ink">{learnedCount}</strong> of {TOTAL_CHARACTERS}.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-sm">
          <input
            type="checkbox"
            checked={showRoman}
            onChange={(e) => setShowRoman(e.target.checked)}
            className="accent-berbere"
          />
          Show sounds
        </label>
      </div>

      {learned.size === 0 && ready && (
        <p className="mb-4 rounded-2xl bg-ochre-light px-4 py-3 text-sm">
          Finish your first lesson and its letters light up here. Everything else stays visible so you can see where
          you&rsquo;re headed.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {/* Column headings: the 7 vowel orders */}
        <div className="grid grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] border-b border-line bg-paper text-center text-xs text-muted">
          <div />
          {fidel.meta.vowelOrders.map((v) => (
            <div key={v.order} className="py-2">
              <div className="font-semibold text-ink">{v.order}</div>
              {showRoman && <div>{v.roman}</div>}
            </div>
          ))}
        </div>

        {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => (
          <section key={week}>
            <div className="flex items-center gap-2 bg-paper/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Week {week}
            </div>
            {families
              .filter((f) => f.week === week)
              .map((family) => {
                const isLearned = learned.has(family.base);
                return (
                  <div
                    key={family.id}
                    className={`grid grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] border-t border-line/60 ${
                      isLearned ? "" : "opacity-35"
                    }`}
                  >
                    <div className="flex items-center justify-center text-xs text-muted">
                      {showRoman ? family.consonantRoman || "’" : family.sequence}
                    </div>
                    {family.forms.map((form) => {
                      const isSelected = selected?.char === form.char;
                      const content = (
                        <>
                          <span className="font-ethiopic text-2xl leading-tight sm:text-3xl">{form.char}</span>
                          {showRoman && <span className="text-[11px] leading-none text-muted">{form.roman}</span>}
                        </>
                      );
                      return isLearned ? (
                        <button
                          key={form.order}
                          type="button"
                          onClick={() => select(family, form.char, form.roman, `${ordinal(form.order)} order`)}
                          className={`flex flex-col items-center justify-center gap-0.5 py-2 transition hover:bg-ochre-light ${
                            isSelected ? "bg-ochre-light ring-2 ring-inset ring-ochre" : ""
                          }`}
                        >
                          {content}
                        </button>
                      ) : (
                        <div key={form.order} className="flex flex-col items-center justify-center gap-0.5 py-2" aria-disabled>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </section>
        ))}
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-4">
          <h2 className="mb-3 font-display text-lg font-semibold">Punctuation</h2>
          <ul className="space-y-2">
            {fidel.meta.punctuation.map((p) => (
              <li key={p.char} className="flex items-center gap-4">
                <span className="w-10 text-center font-ethiopic text-3xl">{p.char}</span>
                <span className="text-muted">{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <h2 className="mb-3 font-display text-lg font-semibold">Numerals</h2>
          <ul className="grid grid-cols-5 gap-2 text-center">
            {fidel.meta.numerals.map((n) => (
              <li key={n.char} className="rounded-xl bg-paper py-2">
                <div className="font-ethiopic text-2xl">{n.char}</div>
                <div className="text-xs text-muted">{n.value}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {selected && (
        <CharacterSheet
          selected={selected}
          showRoman={showRoman}
          onClose={() => setSelected(null)}
          onSelect={select}
        />
      )}
    </main>
  );
}

function CharacterSheet({
  selected,
  showRoman,
  onClose,
  onSelect,
}: {
  selected: Selected;
  showRoman: boolean;
  onClose: () => void;
  onSelect: (family: FidelFamily, char: string, roman: string, label: string) => void;
}) {
  const { family, char, roman, label } = selected;
  const homophone = family.homophoneOf ? familyByBase(family.homophoneOf) : undefined;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 animate-pop rounded-t-3xl border-t border-line bg-card shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96 sm:rounded-3xl sm:border">
      <div className="tibeb-thin rounded-t-3xl" />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted">
            {label} · {family.consonantRoman ? `the ${family.consonantRoman} family` : "the vowel-carrier family"}
          </p>
          <button onClick={onClose} aria-label="Close" className="-mr-2 -mt-2 rounded-full px-3 py-1 text-xl text-muted">
            ×
          </button>
        </div>

        <div className="flex items-center gap-4">
          <DrawnGlyph char={char} size={140} />
          <div className="space-y-3">
            {showRoman && <p className="font-display text-3xl">{roman}</p>}
            <AudioButton path={charAudioPath(char)} withSlow size="lg" label={`Play ${char}`} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {family.forms.map((f) => (
            <button
              key={f.order}
              onClick={() => onSelect(family, f.char, f.roman, `${ordinal(f.order)} order`)}
              className={`rounded-lg py-1 font-ethiopic text-2xl ${f.char === char ? "bg-ochre-light" : "hover:bg-paper"}`}
              title={VOWEL_ORDER_ROMAN[f.order]}
            >
              {f.char}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {family.labialized && (
            <button
              onClick={() => onSelect(family, family.labialized!.char, family.labialized!.roman, "labialized (wa) form")}
              className="rounded-full border border-line px-3 py-1"
            >
              wa form: <span className="font-ethiopic text-base">{family.labialized.char}</span>
              {showRoman && <span className="text-muted"> {family.labialized.roman}</span>}
            </button>
          )}
          {family.ejective && <span className="rounded-full bg-berbere-light px-3 py-1">ejective — a popped sound</span>}
          {homophone && (
            <span className="rounded-full bg-indigo-light px-3 py-1">
              sounds the same as the <span className="font-ethiopic text-base">{homophone.base}</span> family
            </span>
          )}
          {family.notes && <span className="rounded-full bg-paper px-3 py-1">{family.notes}</span>}
        </div>
      </div>
    </div>
  );
}

function ordinal(n: number) {
  return ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"][n - 1] ?? `${n}th`;
}
