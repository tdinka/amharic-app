// Everything in the content that needs a native recording, for the recording
// studio (/studio). Used by both the page and the dev-only API routes that save
// files, so the routes can only ever write paths the lessons actually use.
import { charAudioPath, storyLineAudioPath, withSpeed, wordAudioPath } from "@/lib/audio";
import { allWords, charInfo, families, lessons, type FidelFamily } from "@/lib/content";

/** What a "reviewed" switch updates in the content files. */
export type ReviewTarget =
  | { type: "family"; base: string }
  | { type: "word"; id: string }
  | { type: "storyLine"; lessonId: string; stepIndex: number; lineIndex: number };

export type StudioItem = {
  key: string;
  group: "letters" | "words" | "stories";
  text: string;
  roman?: string;
  english?: string;
  note?: string;
  path: string; // natural speed; the slow one is withSpeed(path, "slow")
  reviewed: boolean;
  review: ReviewTarget;
  family?: FidelFamily;
};

/** Families taught in at least one lesson. Later weeks join as their lessons are written. */
export function taughtFamilies(): FidelFamily[] {
  const bases = new Set(lessons.flatMap((l) => l.newFamilies));
  return families.filter((f) => bases.has(f.base));
}

export function studioItems(): StudioItem[] {
  const items: StudioItem[] = [];

  for (const family of taughtFamilies()) {
    for (const form of family.forms) {
      items.push({
        key: `char:${form.char}`,
        group: "letters",
        text: form.char,
        roman: form.roman,
        path: charAudioPath(form.char)!,
        reviewed: family.reviewed,
        review: { type: "family", base: family.base },
        family,
      });
    }
  }

  for (const char of lessons.flatMap((l) => l.newLabialized ?? [])) {
    const info = charInfo(char);
    if (!info) continue;
    items.push({
      key: `char:${char}`,
      group: "letters",
      text: char,
      roman: info.roman,
      path: charAudioPath(char)!,
      reviewed: info.family.reviewed,
      review: { type: "family", base: info.family.base },
      family: info.family,
    });
  }

  for (const word of allWords()) {
    items.push({
      key: `word:${word.id}`,
      group: "words",
      text: word.amharic,
      roman: word.roman,
      english: word.english,
      note: word.note,
      path: wordAudioPath(word),
      reviewed: word.reviewed,
      review: { type: "word", id: word.id },
    });
  }

  for (const lesson of lessons) {
    lesson.steps.forEach((step, stepIndex) => {
      if (step.type !== "story") return;
      step.lines.forEach((line, lineIndex) => {
        items.push({
          key: `story:${lesson.id}:${lineIndex}`,
          group: "stories",
          text: line.amharic,
          english: line.english,
          note: `${step.title}, line ${lineIndex + 1}`,
          path: storyLineAudioPath(lesson.id, lineIndex),
          reviewed: line.reviewed ?? false,
          review: { type: "storyLine", lessonId: lesson.id, stepIndex, lineIndex },
        });
      });
    });
  }

  return items;
}

/** Every file the studio may write: each item's path, at both speeds. */
export function allowedAudioPaths(): Set<string> {
  const paths = new Set<string>();
  for (const item of studioItems()) {
    paths.add(item.path);
    paths.add(withSpeed(item.path, "slow"));
  }
  return paths;
}

/** The studio only saves files while the app runs on Tsega's computer (`npm run dev`). */
export const STUDIO_CAN_SAVE = process.env.NODE_ENV === "development";
