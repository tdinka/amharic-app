import { emptyProgress, type ProgressData, type ProgressStore } from "./types";
import { localDateKey } from "./dates";

const KEY = "amharic-app:progress:v1";

function isProgressData(value: unknown): value is ProgressData {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ProgressData>;
  return (
    v.version === 1 &&
    typeof v.completedLessons === "object" &&
    typeof v.cards === "object" &&
    typeof v.days === "object" &&
    typeof v.skills === "object" &&
    typeof v.settings === "object"
  );
}

/** Fill in any fields missing from older saves so the rest of the app can rely on them. */
function normalize(data: ProgressData): ProgressData {
  const base = emptyProgress();
  return {
    ...base,
    ...data,
    skills: { ...base.skills, ...data.skills },
    settings: { ...base.settings, ...data.settings },
  };
}

export class LocalStorageProgressStore implements ProgressStore {
  private read(): ProgressData {
    // Guard on `window`, not `localStorage`: newer Node versions define a global
    // localStorage on the server too.
    if (typeof window === "undefined") return emptyProgress();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return emptyProgress();
      const parsed = JSON.parse(raw);
      return isProgressData(parsed) ? normalize(parsed) : emptyProgress();
    } catch {
      return emptyProgress();
    }
  }

  private write(data: ProgressData) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(data));
  }

  private mutate(fn: (data: ProgressData) => void) {
    const data = this.read();
    fn(data);
    this.write(data);
  }

  async load() {
    return this.read();
  }

  async completeLesson(lessonId: string, at: Date) {
    this.mutate((d) => {
      if (!d.completedLessons[lessonId]) d.completedLessons[lessonId] = at.toISOString();
      touchDay(d, at);
    });
  }

  async upsertCards(cards: ProgressData["cards"][string][]) {
    this.mutate((d) => {
      for (const c of cards) d.cards[c.id] = c;
    });
  }

  async logPractice(entry: Parameters<ProgressStore["logPractice"]>[0]) {
    this.mutate((d) => {
      const day = touchDay(d, entry.at);
      if (entry.seconds) {
        day.seconds += entry.seconds;
        d.secondsPracticed += entry.seconds;
      }
      if (entry.skill) d.skills[entry.skill] += entry.count ?? 1;
    });
  }

  async updateSettings(patch: Partial<ProgressData["settings"]>) {
    this.mutate((d) => {
      d.settings = { ...d.settings, ...patch };
    });
  }

  async exportJSON() {
    return JSON.stringify(
      { app: "amharic-app", exportedAt: new Date().toISOString(), progress: this.read() },
      null,
      2,
    );
  }

  async importJSON(json: string) {
    const parsed = JSON.parse(json);
    const progress = parsed?.progress ?? parsed;
    if (!isProgressData(progress)) {
      throw new Error("That file doesn't look like an Amharic app progress file.");
    }
    this.write(normalize(progress));
  }

  async reset() {
    this.write(emptyProgress());
  }
}

function touchDay(d: ProgressData, at: Date) {
  const key = localDateKey(at);
  d.days[key] ??= { seconds: 0 };
  return d.days[key];
}
