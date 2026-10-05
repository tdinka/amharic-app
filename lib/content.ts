// Typed, read-only access to the content files. Characters are always taken
// from content/fidel.json — never typed into the code by hand.
import fidelJson from "@/content/fidel.json";
import week1Json from "@/content/lessons/week-1.json";
import week2Json from "@/content/lessons/week-2.json";
import week3Json from "@/content/lessons/week-3.json";
import week4Json from "@/content/lessons/week-4.json";
import week5Json from "@/content/lessons/week-5.json";
import week6Json from "@/content/lessons/week-6.json";

export type FidelForm = {
  order: number;
  char: string;
  roman: string;
  codepoint: string;
  unicodeName: string;
};

export type LabializedForm = Omit<FidelForm, "order">;

export type FidelFamily = {
  id: string;
  sequence: number;
  base: string;
  consonantRoman: string;
  week: number;
  ejective: boolean;
  homophoneOf: string | null;
  notes: string;
  forms: FidelForm[];
  labialized: LabializedForm | null;
  reviewed: boolean;
};

export type FidelData = {
  meta: {
    description: string;
    vowelOrders: { order: number; roman: string }[];
    romanization: string;
    punctuation: { char: string; name: string }[];
    numerals: { char: string; value: number }[];
  };
  families: FidelFamily[];
};

export type Word = {
  id: string;
  amharic: string;
  roman: string;
  english: string;
  picture: string;
  audio: string;
  reviewed: boolean;
  note?: string;
};

export type StoryLine = { amharic: string; english: string; reviewed?: boolean };

export type Step =
  | { type: "intro"; text: string }
  | { type: "wrapUp"; text: string }
  | { type: "rule"; title?: string; text: string }
  | { type: "hear"; items: string[]; text?: string }
  | { type: "see"; family: string; text?: string }
  | { type: "chant"; family: string }
  | { type: "trace"; chars: string[] }
  | { type: "say"; items: string[] }
  | { type: "words"; items: Word[] }
  | { type: "phrase"; word: Word }
  | { type: "exercise"; kind: "soundMatch"; prompt: string; options: string[] }
  | { type: "exercise"; kind: "gridFill"; family: string; hide: number[] }
  | { type: "exercise"; kind: "buildWord"; target: string; tiles: string[] }
  | { type: "exercise"; kind: "minimalPair"; note?: string; a: Word; b: Word }
  | { type: "exercise"; kind: "dictation"; target: string }
  | { type: "exercise"; kind: "pictureNaming"; target: string; options: string[] }
  | { type: "story"; title: string; lines: StoryLine[]; note?: string }
  | { type: "review" }
  | { type: "punctuation"; items: string[]; text?: string }
  | { type: "numerals"; items: string[]; text?: string };

export type ExerciseStep = Extract<Step, { type: "exercise" }>;

export type Lesson = {
  id: string;
  week: number;
  order: number;
  title: string;
  goal: string;
  newFamilies: string[];
  /** "w" forms (labialized, e.g. ቋ) this lesson teaches; they count as taught only from here on. */
  newLabialized?: string[];
  estimatedMinutes: number;
  cultureNote: string;
  steps: Step[];
};

export type LessonWeek = { week: number; lessons: Lesson[] };

export const fidel = fidelJson as FidelData;
export const weeks: LessonWeek[] = [week1Json, week2Json, week3Json, week4Json, week5Json, week6Json] as unknown as LessonWeek[];
export const lessons: Lesson[] = weeks.flatMap((w) => w.lessons);
export const families: FidelFamily[] = [...fidel.families].sort(
  (a, b) => a.sequence - b.sequence,
);
export const TOTAL_WEEKS = Math.max(...families.map((f) => f.week));
export const ALL_FORMS: FidelForm[] = families.flatMap((f) => f.forms);
export const TOTAL_CHARACTERS = ALL_FORMS.length;

export type CharInfo = {
  char: string;
  roman: string;
  codepoint: string;
  order: number | null; // null for labialized forms
  family: FidelFamily;
};

const charIndex = new Map<string, CharInfo>();
for (const family of families) {
  for (const form of family.forms) {
    charIndex.set(form.char, { ...form, family });
  }
  if (family.labialized) {
    charIndex.set(family.labialized.char, { ...family.labialized, order: null, family });
  }
}

export function charInfo(char: string): CharInfo | undefined {
  return charIndex.get(char);
}

export function familyByBase(base: string): FidelFamily | undefined {
  return families.find((f) => f.base === base);
}

export function lessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

/** Every word object in the lessons, keyed by id (first occurrence wins). */
const wordsById = new Map<string, Word>();
/** Words keyed by their Amharic spelling, preferring the ones taught in `words` steps. */
const wordsByAmharic = new Map<string, Word>();
for (const lesson of lessons) {
  for (const step of lesson.steps) {
    for (const w of wordsInStep(step)) {
      if (!wordsById.has(w.id)) wordsById.set(w.id, w);
    }
    if (step.type === "words") {
      for (const w of step.items) {
        if (!wordsByAmharic.has(w.amharic)) wordsByAmharic.set(w.amharic, w);
      }
    }
  }
}

export function wordsInStep(step: Step): Word[] {
  if (step.type === "words") return step.items;
  if (step.type === "phrase") return [step.word];
  if (step.type === "exercise" && step.kind === "minimalPair") return [step.a, step.b];
  return [];
}

export function wordById(id: string): Word | undefined {
  return wordsById.get(id);
}

export function wordByAmharic(amharic: string): Word | undefined {
  return wordsByAmharic.get(amharic);
}

export function allWords(): Word[] {
  return Array.from(wordsById.values());
}

/** Families whose characters a learner has been taught by the end of `lessonId`. */
export function familiesTaughtThrough(lessonId: string): FidelFamily[] {
  const target = lessonById(lessonId);
  if (!target) return [];
  const bases = new Set<string>();
  for (const l of lessons) {
    if (l.week < target.week || (l.week === target.week && l.order <= target.order)) {
      l.newFamilies.forEach((b) => bases.add(b));
    }
  }
  return families.filter((f) => bases.has(f.base));
}

/** Ethiopic punctuation marks we strip when splitting a line into words. */
const PUNCTUATION = new Set(fidel.meta.punctuation.map((p) => p.char));

/** Split a line of Amharic text into word tokens, keeping trailing punctuation separate. */
export function tokenizeLine(line: string): { text: string; word: string }[] {
  return line
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const word = Array.from(token)
        .filter((c) => !PUNCTUATION.has(c) && !/[!?.,;:]/.test(c))
        .join("");
      return { text: token, word };
    });
}

export function punctuationName(char: string): string | undefined {
  return fidel.meta.punctuation.find((p) => p.char === char)?.name;
}

/** The value of a Ge'ez numeral, e.g. ፲ → 10. */
export function numeralValue(char: string): number | undefined {
  return fidel.meta.numerals.find((n) => n.char === char)?.value;
}
