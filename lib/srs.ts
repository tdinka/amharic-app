// Spaced-repetition cards (FSRS, via the open-source ts-fsrs package).
//
// Every character and word a learner meets in a lesson becomes a card when the
// lesson is finished. The lesson itself is the introduction, not a review, so a
// new card first comes due the next morning; reviews (build step 4) take it from there.
import { createEmptyCard, fsrs, generatorParameters, type Card } from "ts-fsrs";
import { familyByBase, wordsInStep, type Lesson } from "@/lib/content";
import { addDays } from "@/lib/progress/dates";
import type { CardKind, ProgressData, SavedFsrsCard, StoredCard } from "@/lib/progress/types";

export const scheduler = fsrs(generatorParameters({ enable_short_term: false }));

export function cardId(kind: CardKind, ref: string) {
  return `${kind}:${ref}`;
}

export function toSaved(card: Card): SavedFsrsCard {
  return { ...card, due: card.due.toISOString(), last_review: card.last_review?.toISOString() };
}

export function fromSaved(card: SavedFsrsCard): Card {
  return { ...card, due: new Date(card.due), last_review: card.last_review ? new Date(card.last_review) : undefined };
}

/** What a lesson teaches: every form of its new families, and the words it shows. */
export function lessonCardRefs(lesson: Lesson): { kind: CardKind; ref: string }[] {
  const refs: { kind: CardKind; ref: string }[] = [];
  for (const base of lesson.newFamilies) {
    for (const form of familyByBase(base)?.forms ?? []) refs.push({ kind: "char", ref: form.char });
  }
  for (const step of lesson.steps) {
    // Minimal-pair contrast words are listening practice, not vocabulary.
    if (step.type !== "words" && step.type !== "phrase") continue;
    for (const w of wordsInStep(step)) refs.push({ kind: "word", ref: w.id });
  }
  return refs;
}

/** New cards for a finished lesson, skipping any the learner already has. */
export function cardsToIntroduce(lesson: Lesson, data: ProgressData, now: Date): StoredCard[] {
  const firstDue = addDays(now, 1);
  firstDue.setHours(0, 0, 0, 0); // tomorrow morning, in the learner's time zone
  const seen = new Set<string>();
  const cards: StoredCard[] = [];
  for (const { kind, ref } of lessonCardRefs(lesson)) {
    const id = cardId(kind, ref);
    if (data.cards[id] || seen.has(id)) continue;
    seen.add(id);
    const fsrsCard = { ...createEmptyCard(now), due: firstDue };
    cards.push({ id, kind, ref, introducedAt: now.toISOString(), fsrs: toSaved(fsrsCard) });
  }
  return cards;
}

export function dueCards(data: ProgressData, now = new Date()): StoredCard[] {
  return Object.values(data.cards)
    .filter((c) => new Date(c.fsrs.due) <= now)
    .sort((a, b) => a.fsrs.due.localeCompare(b.fsrs.due));
}

/** A card is "mastered" once reviews have pushed its next showing at least this far out. */
export const MASTERED_INTERVAL_DAYS = 21;

export function isMastered(card: StoredCard): boolean {
  if (!card.fsrs.last_review) return false; // introduced but never reviewed
  const interval = (new Date(card.fsrs.due).getTime() - new Date(card.fsrs.last_review).getTime()) / 86_400_000;
  return interval >= MASTERED_INTERVAL_DAYS;
}

/** Letters (not words) the learner has mastered, for "letters mastered out of 238". */
export function masteredLetterCount(data: ProgressData): number {
  return Object.values(data.cards).filter((c) => c.kind === "char" && isMastered(c)).length;
}

/** The next time any card comes due (for "next review tomorrow" style messages). */
export function nextDue(data: ProgressData): Date | undefined {
  const dues = Object.values(data.cards).map((c) => c.fsrs.due).sort();
  return dues.length ? new Date(dues[0]) : undefined;
}
