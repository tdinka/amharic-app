"use client";

import { useEffect, useMemo, useState } from "react";
import { AudioButton, ComputerVoice, RecordingComing } from "@/components/AudioButton";
import { Roman } from "@/components/Roman";
import { charAudioPath, wordAudioPath } from "@/lib/audio";
import {
  familiesTaughtThrough,
  familyByBase,
  wordByAmharic,
  type ExerciseStep,
} from "@/lib/content";
import { romanOf, romanOfChar } from "@/lib/romanization";
import { playAudio, useAudioSource } from "@/lib/useAudio";
import { CharTile, StepHeading, StepText } from "./ui";

type KindOf<K extends ExerciseStep["kind"]> = Extract<ExerciseStep, { kind: K }>;

export type ExerciseProps<S> = {
  step: S;
  lessonId: string;
  /** Called once, when the learner has answered. `answer` is the correct answer, for feedback. */
  onAnswer: (correct: boolean, answer: string) => void;
  /** Lets the learner move on when the exercise can't be done yet (e.g. no recording). */
  onSkip: () => void;
};

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shown when a listening exercise has no recording yet: the sound written out instead. */
function SoundClue({ text, roman }: { text?: string; roman: string | undefined }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-ochre-light px-4 py-3">
      <RecordingComing />
      <span>
        {text ?? "Find the one that says"} <strong className="text-lg">{roman ?? "?"}</strong>
      </span>
    </div>
  );
}

function ListenButton({ path, tts = false }: { path: string | undefined; tts?: boolean }) {
  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => path && playAudio(path)}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-berbere text-3xl text-white shadow-md active:scale-95"
        aria-label="Play the sound again"
      >
        🔊
      </button>
      {tts && <ComputerVoice />}
    </div>
  );
}

export function SoundMatch({ step, onAnswer }: ExerciseProps<KindOf<"soundMatch">>) {
  const path = charAudioPath(step.prompt);
  const source = useAudioSource(path);
  const hasAudio = source === null ? null : source !== "none";
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (hasAudio && path) playAudio(path);
  }, [hasAudio, path]);

  function pick(c: string) {
    if (picked) return;
    setPicked(c);
    onAnswer(c === step.prompt, step.prompt);
  }

  return (
    <div>
      <StepHeading>Which letter do you hear?</StepHeading>
      {hasAudio ? (
        <ListenButton path={path} tts={source === "tts"} />
      ) : (
        hasAudio === false && <SoundClue roman={romanOfChar(step.prompt)} />
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {step.options.map((c) => (
          <CharTile
            key={c}
            char={c}
            onClick={() => pick(c)}
            disabled={!!picked}
            state={!picked ? "plain" : c === step.prompt ? "correct" : c === picked ? "wrong" : "dim"}
            sub={picked ? <Roman text={romanOfChar(c)} level="always" /> : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function GridFill({ step, lessonId, onAnswer }: ExerciseProps<KindOf<"gridFill">>) {
  const family = familyByBase(step.family);
  // `hide` lists vowel orders (1–7), matching `order` in fidel.json.
  const hidden = useMemo(() => [...step.hide].sort((a, b) => a - b), [step.hide]);
  const [filled, setFilled] = useState<Record<number, string>>({});
  const current = hidden.find((o) => !(o in filled));

  const options = useMemo(() => {
    if (!family || current === undefined) return [];
    const correct = family.forms.find((f) => f.order === current)!.char;
    const sameOrderOtherFamilies = familiesTaughtThrough(lessonId)
      .filter((f) => f.base !== family.base)
      .map((f) => f.forms.find((x) => x.order === current)?.char)
      .filter((c): c is string => !!c);
    const neighbours = family.forms
      .filter((f) => f.order !== current && Math.abs(f.order - current) <= 2)
      .map((f) => f.char);
    // Always one same-vowel letter from another family (tests the consonant), then neighbours (test the vowel).
    const distractors = [...shuffle(sameOrderOtherFamilies).slice(0, 1), ...shuffle(neighbours)].slice(0, 3);
    return shuffle([correct, ...distractors]);
  }, [family, current, lessonId]);

  if (!family) return <p>Missing family {step.family} in fidel.json.</p>;

  function pick(c: string) {
    if (current === undefined || !family) return;
    const next = { ...filled, [current]: c };
    setFilled(next);
    if (hidden.every((o) => o in next)) {
      const allRight = hidden.every((o) => next[o] === family.forms.find((f) => f.order === o)!.char);
      const answer = hidden.map((o) => family.forms.find((f) => f.order === o)!.char).join(" ");
      onAnswer(allRight, answer);
    }
  }

  return (
    <div>
      <StepHeading>Fill in the missing letters</StepHeading>
      <StepText>Pick the letter that belongs in the gold space.</StepText>
      <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {family.forms.map((f) => {
          const isHidden = hidden.includes(f.order);
          const value = filled[f.order];
          const state = !isHidden
            ? "plain"
            : value === undefined
              ? f.order === current
                ? "active"
                : "plain"
              : value === f.char
                ? "correct"
                : "wrong";
          return (
            <CharTile
              key={f.char}
              size="md"
              char={isHidden ? (value ?? "?") : f.char}
              state={state}
              sub={<span className="text-xs text-muted">{f.order}</span>}
              label={isHidden ? `Missing letter, order ${f.order}` : undefined}
            />
          );
        })}
      </div>
      {current !== undefined && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {options.map((c) => (
            <CharTile key={c} char={c} onClick={() => pick(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BuildWord({ step, onAnswer }: ExerciseProps<KindOf<"buildWord">>) {
  const targetChars = useMemo(() => Array.from(step.target), [step.target]);
  const tiles = useMemo(() => shuffle(step.tiles.map((c, i) => ({ c, i }))), [step.tiles]);
  const [placed, setPlaced] = useState<number[]>([]); // tile ids, in order
  const [done, setDone] = useState(false);
  const word = wordByAmharic(step.target);

  function add(id: number) {
    if (done || placed.includes(id) || placed.length >= targetChars.length) return;
    const next = [...placed, id];
    setPlaced(next);
    if (next.length === targetChars.length) {
      setDone(true);
      const spelled = next.map((t) => step.tiles[t]).join("");
      onAnswer(spelled === step.target, step.target);
    }
  }

  return (
    <div>
      <StepHeading>Build the word</StepHeading>
      {word && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-4xl" aria-hidden>
            {word.picture}
          </span>
          <span className="text-lg font-semibold">{word.english}</span>
          <Roman text={word.roman} />
          <AudioButton path={wordAudioPath(word)} size="sm" label={`Play ${word.english}`} />
        </div>
      )}
      <div className="mt-6 flex justify-center gap-2">
        {targetChars.map((_, i) => {
          const id = placed[i];
          const c = id === undefined ? "" : step.tiles[id];
          return (
            <button
              key={i}
              type="button"
              disabled={done || id === undefined}
              onClick={() => setPlaced(placed.filter((_, j) => j !== i))}
              className={`flex h-24 w-20 items-center justify-center rounded-2xl border-2 border-dashed font-ethiopic text-5xl ${
                done ? (c === targetChars[i] ? "border-leaf bg-leaf-light" : "border-berbere bg-berbere-light") : "border-line bg-card"
              }`}
              aria-label={c ? `Remove ${c}` : `Empty space ${i + 1}`}
            >
              {c}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted">Tap a letter to place it. Tap a placed letter to take it back.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {tiles.map(({ c, i }) => (
          <CharTile key={i} char={c} size="md" onClick={() => add(i)} disabled={done} state={placed.includes(i) ? "dim" : "plain"} />
        ))}
      </div>
    </div>
  );
}

export function MinimalPair({ step, onAnswer, onSkip }: ExerciseProps<KindOf<"minimalPair">>) {
  const [target] = useState(() => (Math.random() < 0.5 ? step.a : step.b));
  const otherPath = target === step.a ? wordAudioPath(step.b) : wordAudioPath(step.a);
  // Only real recordings work here: a computer voice reads both spellings the same,
  // because doubling isn't written.
  const targetSource = useAudioSource(wordAudioPath(target));
  const otherSource = useAudioSource(otherPath);
  const [picked, setPicked] = useState<string | null>(null);
  const ready =
    targetSource === null || otherSource === null ? null : targetSource === "native" && otherSource === "native";

  useEffect(() => {
    if (ready) playAudio(wordAudioPath(target));
  }, [ready, target]);

  function pick(id: string) {
    if (picked) return;
    setPicked(id);
    onAnswer(id === target.id, `${target.amharic} (${target.roman})`);
  }

  return (
    <div>
      <StepHeading>Which one do you hear?</StepHeading>
      {step.note && <StepText>{step.note}</StepText>}
      {ready === false ? (
        <div className="mt-5 rounded-2xl bg-ochre-light p-4">
          <RecordingComing />
          <p className="mt-2 text-sm">
            This one needs a native speaker&rsquo;s recordings of both words — a computer voice can&rsquo;t show
            the difference. Read the two below, then skip for now.
          </p>
          <button type="button" onClick={onSkip} className="mt-3 rounded-full border border-ink px-4 py-2 text-sm">
            Skip for now
          </button>
        </div>
      ) : (
        ready && <ListenButton path={wordAudioPath(target)} />
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[step.a, step.b].map((w) => (
          <button
            key={w.id}
            type="button"
            disabled={!ready || !!picked}
            onClick={() => pick(w.id)}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              !picked
                ? "border-line bg-card"
                : w.id === target.id
                  ? "border-leaf bg-leaf-light"
                  : w.id === picked
                    ? "border-berbere bg-berbere-light"
                    : "border-line bg-card opacity-50"
            }`}
          >
            <div className="font-ethiopic text-4xl">{w.amharic}</div>
            <div className="mt-1 text-lg font-semibold">{w.roman}</div>
            <div className="text-muted">{w.english}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Dictation({ step, lessonId, onAnswer }: ExerciseProps<KindOf<"dictation">>) {
  const word = wordByAmharic(step.target);
  const path = word ? wordAudioPath(word) : undefined;
  const source = useAudioSource(path);
  const hasAudio = source === null ? null : source !== "none";
  const [typed, setTyped] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const picker = useMemo(() => familiesTaughtThrough(lessonId), [lessonId]);

  useEffect(() => {
    if (hasAudio && path) playAudio(path);
  }, [hasAudio, path]);

  function check() {
    setChecked(true);
    onAnswer(typed.join("") === step.target, step.target);
  }

  return (
    <div>
      <StepHeading>Write what you hear</StepHeading>
      {hasAudio ? (
        <ListenButton path={path} tts={source === "tts"} />
      ) : (
        hasAudio === false && (
          <SoundClue
            text={word ? `${word.picture} ${word.english} — write the word that says` : "Write the word that says"}
            roman={romanOf(step.target)}
          />
        )
      )}

      <div
        className={`mt-5 flex min-h-[5.5rem] items-center justify-center rounded-2xl border-2 px-4 font-ethiopic text-5xl ${
          !checked ? "border-line bg-card" : typed.join("") === step.target ? "border-leaf bg-leaf-light" : "border-berbere bg-berbere-light"
        }`}
        aria-live="polite"
      >
        {typed.join("") || <span className="font-sans text-base text-muted">Tap letters below</span>}
      </div>

      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setTyped(typed.slice(0, -1))}
          disabled={checked || typed.length === 0}
          className="rounded-full border border-line bg-card px-4 py-2 text-sm disabled:opacity-40"
        >
          ⌫ Delete
        </button>
        <button
          type="button"
          onClick={check}
          disabled={checked || typed.length === 0}
          className="rounded-full bg-indigo px-5 py-2 text-sm text-white disabled:opacity-40"
        >
          Check
        </button>
      </div>

      <div className="mt-5 space-y-1.5 rounded-2xl border border-line bg-paper p-2">
        {picker.map((f) => (
          <div key={f.base} className="grid grid-cols-7 gap-1.5">
            {f.forms.map((form) => (
              <button
                key={form.char}
                type="button"
                disabled={checked}
                onClick={() => setTyped([...typed, form.char])}
                className="rounded-lg border border-line bg-card py-1.5 font-ethiopic text-2xl active:scale-95"
              >
                {form.char}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PictureNaming({ step, onAnswer }: ExerciseProps<KindOf<"pictureNaming">>) {
  const word = wordByAmharic(step.target);
  const [picked, setPicked] = useState<string | null>(null);

  function pick(option: string) {
    if (picked) return;
    setPicked(option);
    onAnswer(option === step.target, step.target);
    if (word) playAudio(wordAudioPath(word));
  }

  return (
    <div>
      <StepHeading>Which word is this?</StepHeading>
      <div className="mt-5 text-center text-8xl" aria-label={word?.english ?? "picture"}>
        {word?.picture ?? "?"}
      </div>
      {picked && word && <p className="mt-2 text-center text-lg font-semibold">{word.english}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {step.options.map((o) => (
          <button
            key={o}
            type="button"
            disabled={!!picked}
            onClick={() => pick(o)}
            className={`flex flex-col items-center rounded-2xl border-2 p-4 transition ${
              !picked
                ? "border-line bg-card active:scale-95"
                : o === step.target
                  ? "border-leaf bg-leaf-light"
                  : o === picked
                    ? "border-berbere bg-berbere-light"
                    : "border-line bg-card opacity-50"
            }`}
          >
            <span className="font-ethiopic text-5xl">{o}</span>
            <Roman text={romanOf(o)} className="mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
