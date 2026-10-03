import type { Card } from "ts-fsrs";

export type Skill = "read" | "write" | "listen" | "speak";
export const SKILLS: Skill[] = ["read", "write", "listen", "speak"];

export type RomanizationLevel = "always" | "tap" | "hidden";

/** An FSRS card as saved to storage: dates become ISO strings. */
export type SavedFsrsCard = Omit<Card, "due" | "last_review"> & {
  due: string;
  last_review?: string;
};

export type CardKind = "char" | "word";

export type StoredCard = {
  /** e.g. "char:ሉ" or "word:selam" */
  id: string;
  kind: CardKind;
  /** the character itself, or the word id */
  ref: string;
  introducedAt: string;
  fsrs: SavedFsrsCard;
};

export type DayLog = { seconds: number };

export type Settings = {
  romanization: RomanizationLevel;
};

export type ProgressData = {
  version: 1;
  /** lesson id → ISO date when first completed */
  completedLessons: Record<string, string>;
  cards: Record<string, StoredCard>;
  /** local date "YYYY-MM-DD" → activity that day (any entry counts toward the streak) */
  days: Record<string, DayLog>;
  secondsPracticed: number;
  skills: Record<Skill, number>;
  settings: Settings;
};

export function emptyProgress(): ProgressData {
  return {
    version: 1,
    completedLessons: {},
    cards: {},
    days: {},
    secondsPracticed: 0,
    skills: { read: 0, write: 0, listen: 0, speak: 0 },
    settings: { romanization: "always" },
  };
}

/**
 * Everything the UI can do to progress. The prototype uses localStorage; a
 * Postgres/Prisma version can implement the same interface later without the UI
 * changing. All methods are async so a network-backed store fits the same shape.
 */
export interface ProgressStore {
  load(): Promise<ProgressData>;
  completeLesson(lessonId: string, at: Date): Promise<void>;
  upsertCards(cards: StoredCard[]): Promise<void>;
  /** Log practice time and/or skill activity; also marks the day for the streak. */
  logPractice(entry: { at: Date; seconds?: number; skill?: Skill; count?: number }): Promise<void>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  exportJSON(): Promise<string>;
  importJSON(json: string): Promise<void>;
  reset(): Promise<void>;
}
