"use client";

import { useState } from "react";
import { AudioButton, RecordingComing } from "@/components/AudioButton";
import { Recorder } from "@/components/Recorder";
import { Roman } from "@/components/Roman";
import { scoreTrace, TraceCanvas, type Stroke } from "@/components/TraceCanvas";
import { charAudioPath, storyLineAudioPath, wordAudioPath } from "@/lib/audio";
import { tokenizeLine, wordByAmharic, type Step } from "@/lib/content";
import { romanOf, romanOfChar } from "@/lib/romanization";
import { playAudio } from "@/lib/useAudio";
import { StepHeading, StepText } from "./ui";

type StepOf<T extends Step["type"]> = Extract<Step, { type: T }>;

const TRACE_MESSAGES = {
  nice: { text: "Nice! That looks right.", className: "bg-leaf-light text-leaf" },
  tryAgain: { text: "Close — try again, following the shape.", className: "bg-ochre-light text-ink" },
  tooLittle: { text: "Draw the whole letter, then check.", className: "bg-ochre-light text-ink" },
};

export function TraceStep({ step }: { step: StepOf<"trace"> }) {
  const [index, setIndex] = useState(0);
  const [fromMemory, setFromMemory] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [result, setResult] = useState<keyof typeof TRACE_MESSAGES | null>(null);
  const char = step.chars[index];
  const last = index === step.chars.length - 1;

  function clear() {
    setAttempt((a) => a + 1);
    setResult(null);
  }

  function next() {
    setIndex((i) => i + 1);
    setResult(null);
    setAttempt(0);
  }

  return (
    <div>
      <StepHeading>Write it</StepHeading>
      <StepText>
        {fromMemory ? "Write the letter from memory." : "Trace over the faint letter with your finger, mouse or pen."}
      </StepText>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-ethiopic text-4xl">{char}</span>
          <Roman text={romanOfChar(char)} />
          <AudioButton path={charAudioPath(char)} size="sm" label={`Play ${char}`} />
        </div>
        <span className="text-sm text-muted">
          {index + 1} of {step.chars.length}
        </span>
      </div>

      <div className="mt-4">
        <TraceCanvas
          key={`${char}-${attempt}`}
          char={char}
          showGuide={!fromMemory}
          onStrokesChange={(s) => {
            setStrokes(s);
            setResult(null);
          }}
        />
      </div>

      {result && (
        <p className={`mx-auto mt-3 max-w-[280px] rounded-xl px-3 py-2 text-center text-sm font-semibold ${TRACE_MESSAGES[result].className}`}>
          {TRACE_MESSAGES[result].text}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={clear} className="btn-secondary px-4 py-2 text-sm">
          Clear
        </button>
        <button
          type="button"
          onClick={() => setResult(scoreTrace(char, strokes))}
          disabled={strokes.length === 0}
          className="btn-dark px-4 py-2 text-sm"
        >
          Check
        </button>
        {!last && (
          <button type="button" onClick={next} className="btn-secondary px-4 py-2 text-sm">
            Next letter →
          </button>
        )}
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={fromMemory}
          onChange={(e) => {
            setFromMemory(e.target.checked);
            clear();
          }}
          className="accent-berbere"
        />
        From memory (hide the guide)
      </label>
    </div>
  );
}

/** The recording for something to say: a word if it's a known word, otherwise a character. */
function sayAudioPath(text: string): string | undefined {
  const word = wordByAmharic(text);
  if (word) return wordAudioPath(word);
  return charAudioPath(text);
}

export function SayStep({ step }: { step: StepOf<"say"> }) {
  return (
    <div>
      <StepHeading>Say it</StepHeading>
      <StepText>Listen, record yourself, then compare.</StepText>
      <div className="mt-5 space-y-3">
        {step.items.map((text) => {
          const word = wordByAmharic(text);
          return (
            <div key={text} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-ethiopic text-5xl leading-tight">{text}</span>
                <Roman text={romanOf(text)} />
                {word && <span className="text-muted">{word.english}</span>}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AudioButton path={sayAudioPath(text)} label={`Play ${text}`} />
                <Recorder />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StoryStep({ step, lessonId }: { step: StepOf<"story">; lessonId: string }) {
  const [showEnglish, setShowEnglish] = useState(false);
  const [missing, setMissing] = useState<string | null>(null);

  async function playWord(word: string) {
    const known = wordByAmharic(word);
    const ok = known ? await playAudio(wordAudioPath(known)) : false;
    setMissing(ok ? null : word);
  }

  return (
    <div>
      <StepHeading>Story: {step.title}</StepHeading>
      {step.note && <StepText>{step.note}</StepText>}

      <div className="mt-4 flex justify-end">
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-sm">
          <input
            type="checkbox"
            checked={showEnglish}
            onChange={(e) => setShowEnglish(e.target.checked)}
            className="accent-berbere"
          />
          English
        </label>
      </div>

      <div className="mt-3 space-y-3 rounded-2xl border border-line bg-card p-4">
        {step.lines.map((line, i) => (
          <div key={i}>
            <div>
              <p className="flex flex-wrap gap-x-2 font-ethiopic text-4xl leading-snug">
                {tokenizeLine(line.amharic).map((t, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => playWord(t.word)}
                    className="rounded-lg px-1 hover:bg-ochre-light focus:bg-ochre-light"
                  >
                    {t.text}
                  </button>
                ))}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <AudioButton path={storyLineAudioPath(lessonId, i)} size="sm" label={`Play line ${i + 1}`} />
                {showEnglish && <p className="text-muted">{line.english}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {missing && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-ethiopic text-2xl">{missing}</span>
          <Roman text={romanOf(missing)} />
          <RecordingComing />
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-dashed border-line p-4">
        <p className="mb-3 text-sm text-muted">Now read the whole story out loud.</p>
        <Recorder label="Record yourself reading" />
      </div>
    </div>
  );
}
