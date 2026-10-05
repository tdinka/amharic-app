// Checks every lesson file in content/lessons/ for mistakes a person would easily miss:
//
//   npm run check:lessons
//
// - Every Amharic character in a lesson has been taught by then (its family is in
//   this lesson's or an earlier lesson's newFamilies; a "w" form like ቋ must also be
//   listed in newLabialized; numerals count from the lesson whose "numerals" step shows them). The culture note, "phrase"
//   steps (hear-and-say only) and the wrap-up (which previews the next lesson) are
//   allowed to run ahead.
// - Exercises are well formed: answers are among the options, word tiles can spell
//   the target, words used by exercises exist, grid-fill orders are 1–7.
// - Word ids are unique and each word's audio path matches its id.
// It also prints each lesson's new words and characters, to check wrap-up text.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const fidel = JSON.parse(readFileSync(join(ROOT, "content/fidel.json"), "utf8"));
const lessons = readdirSync(join(ROOT, "content/lessons"))
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(readFileSync(join(ROOT, "content/lessons", f), "utf8")).lessons)
  .sort((a, b) => a.week - b.week || a.order - b.order);

const ETHIOPIC = /[ሀ-፿]/g;
const punctuation = new Set(fidel.meta.punctuation.map((p) => p.char));
const numerals = new Set(fidel.meta.numerals.map((n) => n.char));
const familyOf = new Map();
const labializedOf = new Map(); // w-form char → its family's base
for (const fam of fidel.families) {
  for (const form of fam.forms) familyOf.set(form.char, fam.base);
  if (fam.labialized) labializedOf.set(fam.labialized.char, fam.base);
}
const formsOf = (base) => fidel.families.find((f) => f.base === base)?.forms ?? [];

const errors = [];
const taughtFamilies = new Set();
const taughtLabialized = new Set();
const taughtNumerals = new Set();
const wordsByAmharic = new Map();
const wordIds = new Map(); // id → amharic
const taughtWordIds = new Set(); // first taught in a "words" step
let totalWords = 0;

function wordsIn(step) {
  if (step.type === "words") return step.items;
  if (step.type === "phrase") return [step.word];
  if (step.type === "exercise" && step.kind === "minimalPair") return [step.a, step.b];
  return [];
}

/** Every string inside a value, with where it came from. */
function* strings(value, path) {
  if (typeof value === "string") yield [value, path];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* strings(value[i], `${path}[${i}]`);
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) yield* strings(v, `${path}.${k}`);
}

for (const lesson of lessons) {
  const where = (s) => `${lesson.id} ${s}`;
  for (const base of lesson.newFamilies) {
    if (!formsOf(base).length) errors.push(where(`newFamilies: ${base} is not a family in fidel.json`));
    taughtFamilies.add(base);
  }
  for (const char of lesson.newLabialized ?? []) {
    if (!labializedOf.has(char)) errors.push(where(`newLabialized: ${char} is not a w-form in fidel.json`));
    else if (!taughtFamilies.has(labializedOf.get(char))) errors.push(where(`newLabialized: ${char}'s family ${labializedOf.get(char)} isn't taught yet`));
    taughtLabialized.add(char);
  }
  for (const step of lesson.steps) {
    if (step.type === "numerals") {
      for (const n of step.items) {
        if (!numerals.has(n)) errors.push(where(`numerals step: ${n} is not a numeral in fidel.json`));
        taughtNumerals.add(n);
      }
    }
    if (step.type === "punctuation") {
      for (const m of step.items) if (!punctuation.has(m)) errors.push(where(`punctuation step: ${m} is not in fidel.json`));
    }
  }
  const taught = (ch) =>
    punctuation.has(ch) ||
    (numerals.has(ch) ? taughtNumerals.has(ch) : labializedOf.has(ch) ? taughtLabialized.has(ch) : taughtFamilies.has(familyOf.get(ch)));

  // Words first, so exercises later in the same lesson can use them.
  const newWords = [];
  for (const step of lesson.steps) {
    for (const w of wordsIn(step)) {
      if (wordIds.has(w.id) && wordIds.get(w.id) !== w.amharic) errors.push(where(`word id "${w.id}" is used for two different words`));
      if (!wordIds.has(w.id)) wordIds.set(w.id, w.amharic);
      if (step.type === "words" && !taughtWordIds.has(w.id)) {
        taughtWordIds.add(w.id);
        newWords.push(w);
      }
      if (w.audio !== `/audio/words/${w.id}.mp3`) errors.push(where(`word "${w.id}" audio should be /audio/words/${w.id}.mp3`));
      if (w.reviewed !== false && w.reviewed !== true) errors.push(where(`word "${w.id}" needs "reviewed": false`));
      for (const field of ["id", "amharic", "roman", "english", "picture"]) {
        if (!w[field]) errors.push(where(`word "${w.id}" is missing ${field}`));
      }
      if (step.type !== "exercise" && !wordsByAmharic.has(w.amharic)) wordsByAmharic.set(w.amharic, w);
    }
  }
  totalWords += newWords.length;

  lesson.steps.forEach((step, i) => {
    const at = `step ${i} (${step.type}${step.kind ? `/${step.kind}` : ""})`;
    if (step.type !== "phrase" && step.type !== "wrapUp") {
      for (const [text, path] of strings(step, at)) {
        for (const ch of text.match(ETHIOPIC) ?? []) {
          if (!taught(ch)) errors.push(where(`${path}: "${ch}" in "${text}" is not taught yet`));
        }
      }
    }
    if (step.type === "see" || step.type === "chant") {
      if (!formsOf(step.family).length) errors.push(where(`${at}: unknown family ${step.family}`));
    }
    if (step.type !== "exercise") return;
    const needWord = (amharic) => {
      if (!wordsByAmharic.has(amharic)) errors.push(where(`${at}: "${amharic}" isn't a word taught so far`));
    };
    switch (step.kind) {
      case "soundMatch":
        if (!step.options.includes(step.prompt)) errors.push(where(`${at}: prompt is not among the options`));
        if (new Set(step.options).size !== step.options.length) errors.push(where(`${at}: duplicate options`));
        break;
      case "gridFill":
        if (!formsOf(step.family).length) errors.push(where(`${at}: unknown family ${step.family}`));
        if (!step.hide.every((o) => Number.isInteger(o) && o >= 1 && o <= 7)) errors.push(where(`${at}: hide must list vowel orders 1–7`));
        break;
      case "buildWord": {
        needWord(step.target);
        const pool = [...step.tiles];
        for (const ch of Array.from(step.target)) {
          const k = pool.indexOf(ch);
          if (k === -1) errors.push(where(`${at}: tiles can't spell "${step.target}" (missing ${ch})`));
          else pool.splice(k, 1);
        }
        break;
      }
      case "dictation":
        needWord(step.target);
        break;
      case "pictureNaming":
        needWord(step.target);
        if (!step.options.includes(step.target)) errors.push(where(`${at}: target is not among the options`));
        step.options.forEach(needWord);
        break;
      case "minimalPair":
        break;
      default:
        errors.push(where(`${at}: unknown exercise kind "${step.kind}"`));
    }
  });

  const chars = lesson.newFamilies.reduce((n, b) => n + formsOf(b).length, 0);
  const lab = (lesson.newLabialized ?? []).length;
  console.log(
    `${lesson.id}  +${chars} characters (${[...taughtFamilies].reduce((n, b) => n + formsOf(b).length, 0)} total)` +
      `${lab ? ` +${lab} w-forms (${taughtLabialized.size} total)` : ""}  ` +
      `+${newWords.length} words (${totalWords} total): ${newWords.map((w) => w.amharic).join(" ")}`,
  );
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("\n✓ All lessons check out.");
