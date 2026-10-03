// THE ONE PLACE romanization comes from.
//
// The mapping itself lives in content/fidel.json (each form's `roman`, plus
// `meta.romanization` for the scheme) and in each word's `roman` field. The app
// never builds romanization by gluing letters together — Amharic doubling and the
// 6th order make that wrong — it only looks values up here. To change the scheme,
// edit the content files; to change how lookups work, edit only this file.
import { charInfo, fidel, wordByAmharic } from "@/lib/content";

export const ROMANIZATION_SCHEME = fidel.meta.romanization;

export const VOWEL_ORDER_ROMAN: Record<number, string> = Object.fromEntries(
  fidel.meta.vowelOrders.map((v) => [v.order, v.roman]),
);

/** Romanization of a single fidel character, e.g. ሉ → "lu". */
export function romanOfChar(char: string): string | undefined {
  return charInfo(char)?.roman;
}

/**
 * Romanization of a text: a known word, a single character, or a sequence of
 * characters (joined with "·" so it's clear this is letter-by-letter, not a
 * pronunciation).
 */
export function romanOf(text: string): string | undefined {
  const word = wordByAmharic(text);
  if (word) return word.roman;
  const chars = Array.from(text);
  if (chars.length === 1) return romanOfChar(text);
  const parts = chars.map(romanOfChar);
  if (parts.some((p) => p === undefined)) return undefined;
  return parts.join("·");
}
