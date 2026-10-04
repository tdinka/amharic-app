"use client";

import Link from "next/link";
import { TOTAL_CHARACTERS } from "@/lib/content";
import { learnedFamilies } from "@/lib/learning";
import { addDays, currentStreak, localDateKey, longestStreak } from "@/lib/progress/dates";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { SKILLS, type ProgressData, type Skill } from "@/lib/progress/types";
import { cardId, isMastered, masteredLetterCount } from "@/lib/srs";

const CALENDAR_WEEKS = 6;
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const SKILL_INFO: Record<Skill, { label: string; icon: string; color: string }> = {
  read: { label: "Reading", icon: "📖", color: "bg-indigo" },
  write: { label: "Writing", icon: "✍️", color: "bg-berbere" },
  listen: { label: "Listening", icon: "👂", color: "bg-ochre" },
  speak: { label: "Speaking", icon: "🗣️", color: "bg-leaf" },
};

function Tile({ value, label, sub }: { value: React.ReactNode; label: string; sub?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="font-display text-3xl font-semibold">{value}</div>
      <div className="text-sm font-semibold">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

/** The last few weeks, Monday first, ending with the current week. */
function StreakCalendar({ data, now }: { data: ProgressData; now: Date }) {
  const mondayOffset = (now.getDay() + 6) % 7; // days since Monday
  const start = addDays(now, -mondayOffset - (CALENDAR_WEEKS - 1) * 7);
  const today = localDateKey(now);
  const days = Array.from({ length: CALENDAR_WEEKS * 7 }, (_, i) => addDays(start, i));

  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        {fmt(days[0])} – {fmt(days[days.length - 1])}
      </p>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const key = localDateKey(d);
          const log = data.days[key];
          const future = key > today;
          const minutes = log ? Math.round(log.seconds / 60) : 0;
          return (
            <div
              key={key}
              title={log ? `${d.toLocaleDateString()} — practised${minutes ? `, ${minutes} min` : ""}` : d.toLocaleDateString()}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs ${
                log ? "bg-leaf font-semibold text-white" : future ? "bg-transparent text-line" : "bg-line/50 text-muted"
              } ${key === today ? "ring-2 ring-berbere ring-offset-1 ring-offset-paper" : ""}`}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillBars({ data }: { data: ProgressData }) {
  const max = Math.max(1, ...SKILLS.map((s) => data.skills[s]));
  return (
    <div className="space-y-3">
      {SKILLS.map((s) => {
        const info = SKILL_INFO[s];
        const count = data.skills[s];
        return (
          <div key={s}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">
                {info.icon} {info.label}
              </span>
              <span className="text-muted">{count}</span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-line/60">
              <div className={`h-full rounded-full ${info.color} transition-all`} style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted">Each bar counts the activities you&rsquo;ve done for that skill in lessons and reviews.</p>
    </div>
  );
}

/** Letters from finished lessons, coloured by whether they're mastered yet. */
function LetterGrid({ data }: { data: ProgressData }) {
  const fams = learnedFamilies(data);
  return (
    <div>
      <div className="space-y-1.5">
        {fams.map((f) => (
          <div key={f.base} className="grid grid-cols-7 gap-1.5">
            {f.forms.map((form) => {
              const card = data.cards[cardId("char", form.char)];
              const mastered = card ? isMastered(card) : false;
              return (
                <div
                  key={form.char}
                  title={`${form.roman}${mastered ? " — mastered" : ""}`}
                  className={`flex aspect-square items-center justify-center rounded-lg border font-ethiopic text-2xl ${
                    mastered ? "border-leaf bg-leaf-light" : "border-line bg-card"
                  }`}
                >
                  {form.char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-leaf bg-leaf-light" /> mastered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-line bg-card" /> learned, still practising
        </span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function ProgressPage() {
  const { ready, data } = useProgress();

  if (!ready) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <div className="h-28 animate-pulse rounded-2xl bg-line/50" />
        <div className="h-64 animate-pulse rounded-2xl bg-line/50" />
      </main>
    );
  }

  const now = new Date();
  const lettersLearned = learnedFamilies(data).reduce((n, f) => n + f.forms.length, 0);
  const words = Object.values(data.cards).filter((c) => c.kind === "word");
  const wordsMastered = words.filter(isMastered).length;
  const minutes = Math.round(data.secondsPracticed / 60);
  const todayMinutes = Math.round((data.days[localDateKey(now)]?.seconds ?? 0) / 60);
  const streak = currentStreak(data.days, now);
  const best = longestStreak(data.days);
  const started = Object.keys(data.completedLessons).length > 0;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-6">
      <h1 className="font-display text-3xl font-semibold">Your progress</h1>

      {!started && (
        <div className="mt-4 rounded-2xl bg-ochre-light p-4">
          <p>Finish your first lesson and your progress shows up here.</p>
          <Link href="/" className="mt-2 inline-block font-semibold text-berbere">
            Go to lessons →
          </Link>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Tile
          value={
            <>
              {masteredLetterCount(data)}
              <span className="text-lg font-normal text-muted">/{TOTAL_CHARACTERS}</span>
            </>
          }
          label="letters mastered"
          sub={`${lettersLearned} learned`}
        />
        <Tile value={words.length} label={words.length === 1 ? "word known" : "words known"} sub={`${wordsMastered} mastered`} />
        <Tile value={minutes} label="minutes practised" sub={`${todayMinutes} today`} />
        <Tile value={<>🔥 {streak}</>} label="day streak" sub={`Longest: ${best} ${best === 1 ? "day" : "days"}`} />
      </div>

      <div className="mt-5 space-y-5">
        <Section title="Practice calendar">
          <StreakCalendar data={data} now={now} />
        </Section>
        <Section title="Skills">
          <SkillBars data={data} />
        </Section>
        {lettersLearned > 0 && (
          <Section title="Your letters">
            <LetterGrid data={data} />
          </Section>
        )}
      </div>
    </main>
  );
}
