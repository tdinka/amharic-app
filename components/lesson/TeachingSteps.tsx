"use client";

import { useEffect, useRef, useState } from "react";
import { AudioButton, ComputerVoice, RecordingComing } from "@/components/AudioButton";
import { VowelMarkGlyph } from "@/components/Glyphs";
import { Roman } from "@/components/Roman";
import { charAudioPath, wordAudioPath } from "@/lib/audio";
import { familyByBase, punctuationName, type Step, type Word } from "@/lib/content";
import { romanOfChar } from "@/lib/romanization";
import { audioSource, playAudio, stopAudio, wait } from "@/lib/useAudio";
import { Badge, CharTile, StepHeading, StepText } from "./ui";

type StepOf<T extends Step["type"]> = Extract<Step, { type: T }>;

export function TextCardStep({ step }: { step: StepOf<"intro"> | StepOf<"rule"> | StepOf<"wrapUp"> }) {
  const heading =
    step.type === "rule" ? (step.title ?? "A rule to remember") : step.type === "wrapUp" ? "Lesson done" : "Let’s begin";
  return (
    <div className="animate-pop">
      {step.type === "rule" && <Badge tone="indigo">Rule</Badge>}
      <div className={step.type === "rule" ? "mt-3" : ""}>
        <StepHeading>{heading}</StepHeading>
      </div>
      <StepText>{step.text}</StepText>
    </div>
  );
}

/**
 * Play characters one after another, highlighting each. Missing recordings
 * still get their turn (a short pause) so the rhythm and highlighting work.
 */
function useSequence(chars: string[], gapMs: number) {
  const [active, setActive] = useState<number | null>(null);
  const [anyMissing, setAnyMissing] = useState(false);
  const [anyTts, setAnyTts] = useState(false);
  const run = useRef(0);

  async function play() {
    const id = ++run.current;
    for (let i = 0; i < chars.length; i++) {
      if (run.current !== id) return;
      setActive(i);
      const path = charAudioPath(chars[i]) ?? "";
      if ((await audioSource(path)) === "tts") setAnyTts(true);
      const ok = await playAudio(path);
      if (!ok) {
        setAnyMissing(true);
        await wait(650);
      }
      await wait(gapMs);
    }
    if (run.current === id) setActive(null);
  }

  useEffect(() => {
    return () => {
      // A counter, not a DOM node: bumping it cancels any sequence still playing.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      run.current++;
      stopAudio();
    };
  }, []);

  return { active, anyMissing, anyTts, play, stop: () => (run.current++, setActive(null)) };
}

export function HearStep({ step }: { step: StepOf<"hear"> }) {
  const { active, anyMissing, anyTts, play, stop } = useSequence(step.items, 250);

  useEffect(() => {
    play();
    // Play once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <StepHeading>Listen</StepHeading>
      {step.text && <StepText>{step.text}</StepText>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {step.items.map((c, i) => (
          <CharTile
            key={`${c}${i}`}
            char={c}
            sub={<Roman text={romanOfChar(c)} />}
            state={active === i ? "active" : "plain"}
            onClick={() => {
              stop();
              playAudio(charAudioPath(c) ?? "");
            }}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={play} className="rounded-full border border-line bg-card px-4 py-2 text-sm">
          ▶ Play all again
        </button>
        {anyMissing && <RecordingComing />}
        {anyTts && <ComputerVoice />}
      </div>
    </div>
  );
}

export function SeeStep({ step }: { step: StepOf<"see"> }) {
  const family = familyByBase(step.family);
  if (!family) return <p>Missing family {step.family} in fidel.json.</p>;
  return (
    <div>
      <StepHeading>One family, seven forms</StepHeading>
      <StepText>
        {step.text ?? "The base shape stays the same. Only the vowel mark changes — shown here in gold."}
      </StepText>
      <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {family.forms.map((f) => (
          <button
            key={f.char}
            type="button"
            onClick={() => playAudio(charAudioPath(f.char) ?? "")}
            className="flex flex-col items-center rounded-2xl border border-line bg-card pb-2"
          >
            <VowelMarkGlyph char={f.char} base={family.base} size={72} />
            <span className="text-xs text-muted">{f.order}</span>
            <Roman text={f.roman} className="text-sm" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChantStep({ step }: { step: StepOf<"chant"> }) {
  const family = familyByBase(step.family);
  const chars = family?.forms.map((f) => f.char) ?? [];
  const { active, anyMissing, anyTts, play } = useSequence(chars, 120);

  useEffect(() => {
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!family) return <p>Missing family {step.family} in fidel.json.</p>;
  return (
    <div>
      <StepHeading>Chant it</StepHeading>
      <StepText>Say each sound with the recording, in rhythm — the way children learn the fidel.</StepText>
      <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {family.forms.map((f, i) => (
          <div
            key={f.char}
            className={`flex flex-col items-center rounded-2xl border-2 pb-2 transition ${
              active === i ? "border-ochre bg-ochre-light" : "border-line bg-card"
            }`}
          >
            <VowelMarkGlyph char={f.char} base={family.base} size={72} active={active === i} />
            <Roman text={f.roman} className="text-sm" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={play} className="rounded-full bg-berbere px-5 py-2.5 text-white">
          ▶ Chant again
        </button>
        {anyMissing && <RecordingComing />}
        {anyTts && <ComputerVoice />}
      </div>
    </div>
  );
}

export function WordCard({ word, onlyHearSay = false }: { word: Word; onlyHearSay?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="text-5xl leading-none" aria-hidden>
          {word.picture}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-ethiopic text-5xl leading-tight">{word.amharic}</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
            <span className="text-lg font-semibold">{word.english}</span>
            <Roman text={word.roman} />
          </div>
          <AudioButton path={wordAudioPath(word)} label={`Play ${word.english}`} withSlow className="mt-3" />
        </div>
      </div>
      {onlyHearSay && (
        <div className="mt-3">
          <Badge tone="indigo">Hear and say only</Badge>
        </div>
      )}
      {word.note && <p className="mt-3 rounded-xl bg-paper px-3 py-2 text-sm">{word.note}</p>}
    </div>
  );
}

export function WordsStep({ step }: { step: StepOf<"words"> }) {
  return (
    <div>
      <StepHeading>New words</StepHeading>
      <StepText>Tap ▶ to hear each one. Say it back out loud.</StepText>
      <div className="mt-5 space-y-3">
        {step.items.map((w) => (
          <WordCard key={w.id} word={w} />
        ))}
      </div>
    </div>
  );
}

export function PhraseStep({ step }: { step: StepOf<"phrase"> }) {
  return (
    <div>
      <StepHeading>A word to say</StepHeading>
      <div className="mt-5">
        <WordCard word={step.word} onlyHearSay />
      </div>
    </div>
  );
}

export function PunctuationStep({ step }: { step: StepOf<"punctuation"> }) {
  return (
    <div>
      <StepHeading>Punctuation</StepHeading>
      <StepText>Amharic has its own punctuation marks. You just met these in the story.</StepText>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {step.items.map((c) => (
          <div key={c} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
            <span className="font-ethiopic text-6xl leading-none">{c}</span>
            <span className="text-lg">{punctuationName(c) ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
