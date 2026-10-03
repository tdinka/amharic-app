"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { lessonById, lessons, type ExerciseStep, type Lesson, type Step } from "@/lib/content";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { stopAudio } from "@/lib/useAudio";
import { BuildWord, Dictation, GridFill, MinimalPair, PictureNaming, SoundMatch, type ExerciseProps } from "./Exercises";
import { SayStep, StoryStep, TraceStep } from "./PracticeSteps";
import {
  ChantStep,
  HearStep,
  PhraseStep,
  PunctuationStep,
  ReviewStep,
  SeeStep,
  TextCardStep,
  WordsStep,
} from "./TeachingSteps";
import { Badge, StepHeading, StepText } from "./ui";

type QueueItem = { stepIndex: number; retry: boolean };
type Feedback = { correct: boolean; answer: string; praise: string } | { skipped: true };

const PRAISE = ["Nice!", "Exactly right!", "Yes — well done!", "Perfect!", "You got it!"];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function Exercise({ step, ...rest }: ExerciseProps<ExerciseStep>) {
  switch (step.kind) {
    case "soundMatch":
      return <SoundMatch step={step} {...rest} />;
    case "gridFill":
      return <GridFill step={step} {...rest} />;
    case "buildWord":
      return <BuildWord step={step} {...rest} />;
    case "minimalPair":
      return <MinimalPair step={step} {...rest} />;
    case "dictation":
      return <Dictation step={step} {...rest} />;
    case "pictureNaming":
      return <PictureNaming step={step} {...rest} />;
  }
}

function StepView({
  step,
  lesson,
  onAnswer,
  onSkip,
}: {
  step: Step;
  lesson: Lesson;
  onAnswer: ExerciseProps<ExerciseStep>["onAnswer"];
  onSkip: () => void;
}) {
  switch (step.type) {
    case "intro":
    case "rule":
    case "wrapUp":
      return <TextCardStep step={step} />;
    case "hear":
      return <HearStep step={step} />;
    case "see":
      return <SeeStep step={step} />;
    case "chant":
      return <ChantStep step={step} />;
    case "trace":
      return <TraceStep step={step} />;
    case "say":
      return <SayStep step={step} />;
    case "words":
      return <WordsStep step={step} />;
    case "phrase":
      return <PhraseStep step={step} />;
    case "story":
      return <StoryStep step={step} lessonId={lesson.id} />;
    case "review":
      return <ReviewStep />;
    case "punctuation":
      return <PunctuationStep step={step} />;
    case "exercise":
      return <Exercise step={step} lessonId={lesson.id} onAnswer={onAnswer} onSkip={onSkip} />;
  }
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = lessonById(lessonId)!;
  const { ready, act } = useProgress();
  const [queue, setQueue] = useState<QueueItem[]>(() => lesson.steps.map((_, i) => ({ stepIndex: i, retry: false })));
  const [pos, setPos] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [phase, setPhase] = useState<"steps" | "culture" | "done">("steps");
  const startedAt = useRef(Date.now());
  const saved = useRef(false);

  const item = queue[pos];
  const step = item ? lesson.steps[item.stepIndex] : undefined;
  const isExercise = step?.type === "exercise";
  const canContinue = !isExercise || feedback !== null;
  const nextLesson = lessons[lessons.indexOf(lesson) + 1];

  useEffect(() => {
    window.scrollTo({ top: 0 });
    return () => stopAudio();
  }, [pos, phase]);

  // Save once when the lesson is finished.
  useEffect(() => {
    if (phase !== "done" || saved.current) return;
    saved.current = true;
    const now = new Date();
    act(async (s) => {
      await s.completeLesson(lesson.id, now);
      await s.logPractice({ at: now, seconds: Math.round((now.getTime() - startedAt.current) / 1000) });
    });
  }, [phase, act, lesson.id]);

  function onAnswer(correct: boolean, answer: string) {
    setFeedback({ correct, answer, praise: pick(PRAISE) });
    if (!correct && !item.retry) {
      // Bring it back at the end — before the closing wrap-up card, if there is one.
      setQueue((q) => {
        const wrapAt = q.findIndex((x, i) => i > pos && !x.retry && lesson.steps[x.stepIndex].type === "wrapUp");
        const at = wrapAt === -1 ? q.length : wrapAt;
        return [...q.slice(0, at), { stepIndex: item.stepIndex, retry: true }, ...q.slice(at)];
      });
    }
  }

  function next() {
    stopAudio();
    setFeedback(null);
    if (pos + 1 < queue.length) setPos(pos + 1);
    else setPhase("culture");
  }

  const total = queue.length + 1; // + culture note
  const done = phase === "steps" ? pos : phase === "culture" ? queue.length : total;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link href="/" aria-label="Leave lesson" className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-muted hover:bg-line/50">
            ✕
          </Link>
          <div
            className="h-3 flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
          >
            <div className="h-full rounded-full bg-leaf transition-all duration-300" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>
        <div className="tibeb-thin" />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-40 pt-6">
        {!ready ? (
          <div className="h-40 animate-pulse rounded-2xl bg-line/50" />
        ) : phase === "steps" && step ? (
          <div key={pos}>
            {item.retry && (
              <div className="mb-3">
                <Badge tone="indigo">One more try</Badge>
              </div>
            )}
            <StepView step={step} lesson={lesson} onAnswer={onAnswer} onSkip={() => setFeedback({ skipped: true })} />
          </div>
        ) : phase === "culture" ? (
          <div className="animate-pop">
            <div className="tibeb mb-5 rounded" />
            <Badge>Culture note</Badge>
            <div className="mt-3">
              <StepHeading>{lesson.title}</StepHeading>
            </div>
            <StepText>{lesson.cultureNote}</StepText>
          </div>
        ) : (
          <div className="animate-pop text-center">
            <div className="text-6xl" aria-hidden>
              🎉
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold">Lesson complete</h1>
            <p className="mt-2 text-muted">{lesson.title}</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              {nextLesson && (
                <Link href={`/lesson/${nextLesson.id}`} className="rounded-full bg-berbere px-6 py-3 text-white">
                  Next lesson: {nextLesson.title}
                </Link>
              )}
              <Link href="/" className="rounded-full border border-line bg-card px-6 py-3">
                Back to lessons
              </Link>
            </div>
          </div>
        )}
      </main>

      {phase !== "done" && ready && (
        <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          {feedback && (
            <div
              className={`animate-pop px-4 py-3 text-center font-semibold ${
                "skipped" in feedback ? "bg-paper text-muted" : feedback.correct ? "bg-leaf-light text-leaf" : "bg-berbere-light text-berbere-dark"
              }`}
              role="status"
            >
              {"skipped" in feedback
                ? "Skipped for now."
                : feedback.correct
                  ? feedback.praise
                  : item.retry
                    ? <>The answer is {feedback.answer}. You&rsquo;ll see it again in reviews.</>
                    : <>Not quite — it&rsquo;s {feedback.answer}. We&rsquo;ll come back to this one.</>}
            </div>
          )}
          <div className="mx-auto max-w-2xl px-4 py-3">
            <button
              type="button"
              onClick={phase === "culture" ? () => setPhase("done") : next}
              disabled={!canContinue}
              className="w-full rounded-full bg-berbere py-3.5 text-lg font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:bg-line disabled:text-muted"
            >
              {phase === "culture" ? "Finish lesson" : isExercise && !feedback ? "Answer to continue" : "Continue"}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
