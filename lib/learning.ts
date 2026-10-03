// What the learner has been taught so far, derived from saved progress + content.
import { families, lessons, type FidelFamily, type Lesson } from "@/lib/content";
import type { ProgressData } from "@/lib/progress/types";

export function learnedFamilies(progress: ProgressData): FidelFamily[] {
  const bases = new Set<string>();
  for (const l of lessons) {
    if (progress.completedLessons[l.id]) l.newFamilies.forEach((b) => bases.add(b));
  }
  return families.filter((f) => bases.has(f.base));
}

/** The first lesson not yet completed, in order (undefined when all are done). */
export function nextLesson(progress: ProgressData): Lesson | undefined {
  return lessons.find((l) => !progress.completedLessons[l.id]);
}

export function isLessonUnlocked(lesson: Lesson, progress: ProgressData): boolean {
  const idx = lessons.indexOf(lesson);
  return idx === 0 || lessons.slice(0, idx).every((l) => progress.completedLessons[l.id]);
}

/** Dev/testing aid: add ?preview=all to a URL to treat everything as learned. */
export function previewAll(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "all";
}
