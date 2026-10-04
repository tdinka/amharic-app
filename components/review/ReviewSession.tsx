"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ComputerVoice } from "@/components/AudioButton";
import { Roman } from "@/components/Roman";
import { CharTile } from "@/components/lesson/ui";
import { charAudioPath, wordAudioPath } from "@/lib/audio";
import type { StoredCard } from "@/lib/progress/types";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { buildQuestion, rateCard, skillOfQuestion, type Question } from "@/lib/review";
import { romanOfChar } from "@/lib/romanization";
import { audioSource, playAudio, stopAudio, useAudioSource } from "@/lib/useAudio";

export type ReviewResult = { total: number; correct: number };

type Item = { card: StoredCard; retry: boolean };

function questionAudio(q: Question): string | undefined {
  return q.kind === "seeWord" ? wordAudioPath(q.word) : charAudioPath(q.char);
}

function HearButton({ path }: { path: string | undefined }) {
  const source = useAudioSource(path);
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => path && playAudio(path)}
        aria-label="Play the sound again"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-berbere text-3xl text-white shadow-md active:scale-95"
      >
        🔊
      </button>
      {source === "tts" && <ComputerVoice />}
    </div>
  );
}

function optionClass(state: "plain" | "correct" | "wrong" | "dim") {
  return {
    plain: "border-line bg-card active:scale-95",
    correct: "border-leaf bg-leaf-light",
    wrong: "border-berbere bg-berbere-light",
    dim: "border-line bg-card opacity-50",
  }[state];
}

/**
 * A run of review questions. `cards` is fixed when the session starts, so saving
 * answers (which changes what's due) doesn't reshuffle it mid-way.
 */
export function ReviewSession({ cards, onDone }: { cards: StoredCard[]; onDone: (r: ReviewResult) => void }) {
  const { data, act } = useProgress();
  const [snapshot] = useState(data); // for choosing wrong options; stable for the session
  const [queue, setQueue] = useState<Item[]>(() => cards.map((card) => ({ card, retry: false })));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hearable, setHearable] = useState<Set<string> | null>(null);
  const firstTry = useRef({ total: 0, correct: 0 });
  const startedAt = useRef(Date.now());

  // Which characters can be asked as "hear it → pick it" (needs a recording or computer voice).
  useEffect(() => {
    let alive = true;
    const chars = cards.filter((c) => c.kind === "char").map((c) => c.ref);
    Promise.all(chars.map(async (c) => ((await audioSource(charAudioPath(c) ?? "")) ? c : null))).then(
      (ok) => alive && setHearable(new Set(ok.filter((c): c is string => !!c))),
    );
    return () => {
      alive = false;
      stopAudio();
    };
  }, [cards]);

  const item = queue[pos];
  const question = useMemo(
    () => (item && hearable ? buildQuestion(item.card, snapshot, hearable.has(item.card.ref)) : null),
    // A new question per position (a retry gets a fresh one).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pos, hearable],
  );

  useEffect(() => {
    if (question?.kind === "hearChar") playAudio(charAudioPath(question.char) ?? "");
  }, [question]);

  // Skip anything that can't be turned into a question (e.g. content that changed).
  useEffect(() => {
    if (hearable && item && !question) setPos((p) => p + 1);
  }, [hearable, item, question]);

  useEffect(() => {
    if (hearable && pos >= queue.length) {
      const seconds = Math.round((Date.now() - startedAt.current) / 1000);
      act((s) => s.logPractice({ at: new Date(), seconds }));
      onDone(firstTry.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, hearable]);

  if (!hearable || !item || !question) {
    return <div className="h-48 animate-pulse rounded-2xl bg-line/50" />;
  }

  function answer(option: string) {
    if (picked || !question) return;
    setPicked(option);
    const correct = option === question.answer;
    const audio = questionAudio(question);
    if (audio && question.kind !== "hearChar") playAudio(audio);
    if (!item.retry) {
      firstTry.current.total++;
      if (correct) firstTry.current.correct++;
      const rated = rateCard(item.card, correct, new Date());
      act(async (s) => {
        await s.upsertCards([rated]);
        await s.logPractice({ at: new Date(), skill: skillOfQuestion(question) });
      });
      if (!correct) setQueue((q) => [...q, { card: item.card, retry: true }]);
    }
  }

  function next() {
    stopAudio();
    setPicked(null);
    setPos((p) => p + 1);
  }

  const state = (option: string) =>
    !picked ? "plain" : option === question.answer ? "correct" : option === picked ? "wrong" : "dim";
  const correct = picked === question.answer;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-indigo transition-all" style={{ width: `${(pos / queue.length) * 100}%` }} />
        </div>
        <span className="text-xs text-muted">
          {Math.min(pos + 1, queue.length)} / {queue.length}
        </span>
      </div>
      {item.retry && <p className="mb-2 text-sm font-semibold text-indigo">One more try</p>}

      {question.kind === "seeChar" && (
        <>
          <p className="text-center text-muted">What sound does this make?</p>
          <div className="mt-2 text-center font-ethiopic text-8xl leading-tight">{question.char}</div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {question.options.map((o) => (
              <button
                key={o}
                type="button"
                disabled={!!picked}
                onClick={() => answer(o)}
                className={`rounded-2xl border-2 py-4 text-2xl font-semibold transition ${optionClass(state(o))}`}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {question.kind === "hearChar" && (
        <>
          <p className="text-center text-muted">Which letter do you hear?</p>
          <HearButton path={charAudioPath(question.char)} />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {question.options.map((c) => (
              <CharTile
                key={c}
                char={c}
                onClick={() => answer(c)}
                disabled={!!picked}
                state={state(c)}
                sub={picked ? <Roman text={romanOfChar(c)} level="always" /> : undefined}
              />
            ))}
          </div>
        </>
      )}

      {question.kind === "seeWord" && (
        <>
          <p className="text-center text-muted">What does this word mean?</p>
          <div className="mt-2 text-center font-ethiopic text-7xl leading-tight">{question.word.amharic}</div>
          <div className="mt-1 text-center">
            <Roman text={question.word.roman} />
          </div>
          <div className="mt-6 grid gap-3">
            {question.options.map((o) => (
              <button
                key={o}
                type="button"
                disabled={!!picked}
                onClick={() => answer(o)}
                className={`rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition ${optionClass(state(o))}`}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {picked && (
        <div className="mt-5 animate-pop">
          <p className={`text-center font-semibold ${correct ? "text-leaf" : "text-berbere-dark"}`} role="status">
            {correct
              ? "Right!"
              : question.kind === "seeWord"
                ? `It means “${question.answer}”.`
                : question.kind === "seeChar"
                  ? `It says “${question.answer}”.`
                  : "Not quite — the green one is the letter you heard."}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-3 w-full rounded-full bg-indigo py-3 text-lg font-semibold text-white active:scale-[0.98]"
          >
            {pos + 1 < queue.length ? "Next" : "Finish"}
          </button>
        </div>
      )}
    </div>
  );
}
