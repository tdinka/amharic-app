"use client";

import Link from "next/link";
import { families, TOTAL_CHARACTERS, TOTAL_WEEKS, weeks, type Lesson } from "@/lib/content";
import { isLessonUnlocked, learnedFamilies, nextLesson } from "@/lib/learning";
import { currentStreak, localDateKey } from "@/lib/progress/dates";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { dueCards, masteredLetterCount } from "@/lib/srs";
import { ProgressSettings } from "./ProgressSettings";

function Stat({ value, label, href, highlight }: { value: React.ReactNode; label: React.ReactNode; href?: string; highlight?: boolean }) {
  const inner = (
    <>
      <div className={`font-display text-2xl font-semibold ${highlight ? "text-berbere" : ""}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </>
  );
  const cls = "flex-1 rounded-2xl border border-line bg-card px-3 py-3 text-center";
  return href ? (
    <Link href={href} className={`${cls} hover:border-berbere`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

type NodeState = "done" | "next" | "open" | "locked";

function LessonNode({ lesson, state, offset }: { lesson: Lesson; state: NodeState; offset: number }) {
  const circle = {
    done: "bg-leaf text-white border-leaf",
    next: "bg-berbere text-white border-berbere ring-4 ring-berbere/25",
    open: "bg-card text-ink border-berbere",
    locked: "bg-line/60 text-muted border-line",
  }[state];
  const content = (
    <div className="flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full border-4 font-display text-2xl font-semibold shadow-sm transition ${circle} ${
          state === "next" ? "animate-glow" : ""
        }`}
      >
        {state === "done" ? "✓" : state === "locked" ? "🔒" : lesson.order}
      </div>
      <div className={`mt-2 max-w-[12rem] text-center text-sm font-semibold ${state === "locked" ? "text-muted" : ""}`}>
        {lesson.title}
      </div>
    </div>
  );
  if (state === "locked") return <div aria-label={`${lesson.title} (locked)`}>{content}</div>;
  return (
    <Link href={`/lesson/${lesson.id}`} aria-label={`${lesson.title}${state === "done" ? " (finished — practise again)" : ""}`}>
      {content}
    </Link>
  );
}

const OFFSETS = [0, 56, -56, 0];

export function HomeScreen() {
  const { ready, data } = useProgress();

  if (!ready) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <div className="h-20 animate-pulse rounded-2xl bg-line/50" />
        <div className="h-72 animate-pulse rounded-2xl bg-line/50" />
      </main>
    );
  }

  const now = new Date();
  const streak = currentStreak(data.days, now);
  const practisedToday = !!data.days[localDateKey(now)];
  const due = dueCards(data, now).length;
  const lettersMastered = masteredLetterCount(data);
  const lettersLearned = learnedFamilies(data).reduce((n, f) => n + f.forms.length, 0);
  const upNext = nextLesson(data);
  const weeksWithLessons = new Set(weeks.map((w) => w.week));

  function stateOf(lesson: Lesson): NodeState {
    if (data.completedLessons[lesson.id]) return "done";
    if (lesson === upNext) return "next";
    return isLessonUnlocked(lesson, data) ? "open" : "locked";
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-6">
      <div className="flex gap-2">
        <Stat value={<>🔥 {streak}</>} label="day streak" highlight={practisedToday && streak > 0} />
        <Stat value={due} label={due === 1 ? "review due" : "reviews due"} href="/review" highlight={due > 0} />
        <Stat
          value={
            <>
              {lettersMastered}
              <span className="text-base font-normal text-muted">/{TOTAL_CHARACTERS}</span>
            </>
          }
          label={
            <>
              letters mastered
              <span className="block">{lettersLearned} learned</span>
            </>
          }
          href="/fidel"
        />
      </div>

      {upNext ? (
        <Link
          href={`/lesson/${upNext.id}`}
          className="mt-5 block overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition hover:border-berbere"
        >
          <div className="tibeb" />
          <div className="p-5">
            <div className="text-sm text-muted">
              {Object.keys(data.completedLessons).length === 0 ? "Start here" : "Up next"} · Week {upNext.week}, lesson{" "}
              {upNext.order} · about {upNext.estimatedMinutes} min
            </div>
            <div className="mt-1 font-display text-2xl font-semibold">{upNext.title}</div>
            <p className="mt-1 text-muted">{upNext.goal}</p>
            <span className="mt-4 inline-block rounded-full bg-berbere px-6 py-2.5 font-semibold text-white">
              {Object.keys(data.completedLessons).length === 0 ? "Start your first lesson" : "Continue"}
            </span>
          </div>
        </Link>
      ) : (
        <div className="mt-5 rounded-2xl border border-line bg-card p-5 text-center">
          <div className="text-4xl" aria-hidden>
            🎉
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">Every lesson so far is done</div>
          <p className="mt-1 text-muted">
            {due > 0 ? "Keep your letters fresh with today's reviews." : "New lessons are on their way. Reviews will keep what you've learned fresh."}
          </p>
        </div>
      )}

      <div className="mt-8 space-y-8">
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => {
          const weekData = weeks.find((w) => w.week === week);
          const weekFamilies = families.filter((f) => f.week === week);
          if (!weekData || !weeksWithLessons.has(week)) {
            return (
              <section key={week} className="rounded-2xl border border-dashed border-line px-4 py-4 opacity-70">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Week {week}</h2>
                  <span className="text-sm text-muted">🔒 coming soon</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-2 font-ethiopic text-2xl text-muted" aria-label={`Letters in week ${week}`}>
                  {weekFamilies.map((f) => (
                    <span key={f.base}>{f.base}</span>
                  ))}
                </div>
              </section>
            );
          }
          return (
            <section key={week}>
              <h2 className="font-display text-lg font-semibold">Week {week}</h2>
              <div className="relative mt-4 flex flex-col items-center gap-8">
                <div className="absolute inset-y-10 left-1/2 w-0 border-l-4 border-dotted border-line" aria-hidden />
                {weekData.lessons.map((lesson, i) => (
                  <div key={lesson.id} className="relative">
                    <LessonNode lesson={lesson} state={stateOf(lesson)} offset={OFFSETS[i % OFFSETS.length]} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <ProgressSettings />
    </main>
  );
}
