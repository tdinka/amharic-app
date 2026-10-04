// Review questions for spaced-repetition cards, and scheduling the answers.
//
// Card fronts vary (from the spec):
//   see a character → pick its sound
//   hear a sound    → pick the character
//   see a word      → pick its meaning
import { Rating } from "ts-fsrs";
import { allWords, charInfo, wordById, type Word } from "@/lib/content";
import type { ProgressData, Skill, StoredCard } from "@/lib/progress/types";
import { romanOfChar } from "@/lib/romanization";
import { fromSaved, scheduler, toSaved } from "@/lib/srs";

export type Question =
  | { kind: "seeChar"; card: StoredCard; char: string; answer: string; options: string[] }
  | { kind: "hearChar"; card: StoredCard; char: string; answer: string; options: string[] }
  | { kind: "seeWord"; card: StoredCard; word: Word; answer: string; options: string[] };

export function skillOfQuestion(q: Question): Skill {
  return q.kind === "hearChar" ? "listen" : "read";
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Up to three characters to mix with `char`, chosen to be close but never sound
 * identical to it (አ and ኣ are both "a" — offering both would be unfair).
 * Prefers the same family (tests the vowel) and the same vowel order (tests the consonant).
 */
function charDistractors(char: string, known: string[]): string[] {
  const info = charInfo(char);
  const roman = romanOfChar(char);
  if (!info) return [];
  const candidates = known.filter((c) => c !== char && romanOfChar(c) !== roman);
  const sameFamily = shuffle(candidates.filter((c) => charInfo(c)?.family.base === info.family.base));
  const sameOrder = shuffle(candidates.filter((c) => charInfo(c)?.order === info.order));
  const rest = shuffle(candidates);
  const picked: string[] = [];
  const romans = new Set([roman]);
  for (const c of [...sameFamily.slice(0, 2), ...sameOrder.slice(0, 1), ...rest]) {
    const r = romanOfChar(c);
    if (picked.length === 3) break;
    if (picked.includes(c) || romans.has(r)) continue;
    picked.push(c);
    romans.add(r);
  }
  return picked;
}

export function buildQuestion(card: StoredCard, data: ProgressData, canHear: boolean): Question | null {
  if (card.kind === "char") {
    const char = card.ref;
    const roman = romanOfChar(char);
    if (!roman) return null;
    const known = Object.values(data.cards)
      .filter((c) => c.kind === "char")
      .map((c) => c.ref);
    const distractors = charDistractors(char, known);
    if (canHear && Math.random() < 0.5) {
      return { kind: "hearChar", card, char, answer: char, options: shuffle([char, ...distractors]) };
    }
    return {
      kind: "seeChar",
      card,
      char,
      answer: roman,
      options: shuffle([roman, ...distractors.map((c) => romanOfChar(c)!)]),
    };
  }

  const word = wordById(card.ref);
  if (!word) return null;
  // Meanings of other words: the learner's own first, then any lesson word.
  const knownIds = new Set(Object.values(data.cards).filter((c) => c.kind === "word").map((c) => c.ref));
  const others = allWords().filter((w) => w.id !== word.id && w.english !== word.english && w.amharic !== word.amharic);
  const pool = [...shuffle(others.filter((w) => knownIds.has(w.id))), ...shuffle(others.filter((w) => !knownIds.has(w.id)))];
  const meanings = Array.from(new Set(pool.map((w) => w.english))).slice(0, 3);
  return { kind: "seeWord", card, word, answer: word.english, options: shuffle([word.english, ...meanings]) };
}

/** Schedule the card's next review: right → Good, wrong → Again. */
export function rateCard(card: StoredCard, correct: boolean, now: Date): StoredCard {
  const { card: next } = scheduler.next(fromSaved(card.fsrs), now, correct ? Rating.Good : Rating.Again);
  return { ...card, fsrs: toSaved(next) };
}

/**
 * Cards for a session: everything due (oldest first), and for a "quick review"
 * topped up with the cards coming due soonest, so there's always something to practise.
 */
export function sessionCards(data: ProgressData, now: Date, opts: { max: number; topUp: boolean }): StoredCard[] {
  const all = Object.values(data.cards).sort((a, b) => a.fsrs.due.localeCompare(b.fsrs.due));
  const due = all.filter((c) => new Date(c.fsrs.due) <= now);
  const picked = due.slice(0, opts.max);
  if (opts.topUp && picked.length < opts.max) {
    picked.push(...all.filter((c) => !due.includes(c)).slice(0, opts.max - picked.length));
  }
  return shuffle(picked);
}
