// Makes computer-voice stand-ins (Google Cloud Text-to-Speech, Amharic) for every
// letter, word and story line the lessons use, until Tsega records her own.
//
//   npm run audio:tts              make any files that are missing
//   npm run audio:tts -- --dry-run list what would be made, without calling Google
//   npm run audio:tts -- --force   remake every stand-in (e.g. after changing voice)
//
// Needs GOOGLE_TTS_API_KEY in .env.local (never committed). Optional
// GOOGLE_TTS_VOICE picks a voice; the script prints the Amharic voices available.
//
// Files go to public/audio-tts/, mirroring public/audio/. The app plays Tsega's
// recording when one exists and falls back to these. Nothing here is "reviewed":
// public/audio-tts/manifest.json lists every file with "reviewed": false.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const MANIFEST = join(PUBLIC, "audio-tts", "manifest.json");
const API = "https://texttospeech.googleapis.com/v1";
const SLOW_RATE = 0.75;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");
const key = process.env.GOOGLE_TTS_API_KEY;

// ---- What needs audio (path rules must match lib/audio.ts) ----------------------

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const fidel = readJson("content/fidel.json");
const lessons = readdirSync(join(ROOT, "content/lessons"))
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => readJson(`content/lessons/${f}`).lessons);

const charPath = (codepoint) => `/audio/chars/${codepoint.replace("U+", "u").toLowerCase()}.mp3`;
const storyLinePath = (lessonId, i) => `/audio/stories/${lessonId}-${i + 1}.mp3`;
const slowPath = (p) => p.replace(/\.mp3$/, "-slow.mp3");

/** path → { text, kind } */
const items = new Map();

const taught = new Set(lessons.flatMap((l) => l.newFamilies));
for (const family of fidel.families.filter((f) => taught.has(f.base))) {
  for (const form of family.forms) items.set(charPath(form.codepoint), { text: form.char, kind: "char" });
}
// "w" forms (labialized, e.g. ቋ) that a lesson teaches.
const taughtLabialized = new Set(lessons.flatMap((l) => l.newLabialized ?? []));
for (const family of fidel.families) {
  const lab = family.labialized;
  if (lab && taughtLabialized.has(lab.char)) items.set(charPath(lab.codepoint), { text: lab.char, kind: "char" });
}

for (const lesson of lessons) {
  for (const step of lesson.steps) {
    // Minimal-pair contrast words are skipped on purpose: a computer voice can't
    // show doubling, so those need Tsega's recordings.
    const words = step.type === "words" ? step.items : step.type === "phrase" ? [step.word] : [];
    for (const w of words) items.set(w.audio, { text: w.amharic, kind: "word" });
    if (step.type === "story") {
      step.lines.forEach((line, i) => items.set(storyLinePath(lesson.id, i), { text: line.amharic, kind: "story" }));
    }
  }
}

// ---- Google Cloud ---------------------------------------------------------------

async function google(path, body) {
  const res = await fetch(`${API}/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json.error?.message ?? res.statusText;
    throw new Error(`Google said (${res.status}): ${msg}`);
  }
  return json;
}

async function pickVoice() {
  const { voices = [] } = await google("voices?languageCode=am-ET");
  if (voices.length === 0) throw new Error("Google has no Amharic (am-ET) voices for this key.");
  console.log("Amharic voices available:", voices.map((v) => `${v.name} (${v.ssmlGender.toLowerCase()})`).join(", "));
  const wanted = process.env.GOOGLE_TTS_VOICE?.trim(); // an empty line in .env.local means "no preference"
  const voice =
    (wanted ? voices.find((v) => v.name === wanted) : undefined) ??
    voices.find((v) => v.name.includes("Wavenet")) ??
    voices[0];
  if (wanted && voice.name !== wanted) console.log(`GOOGLE_TTS_VOICE "${wanted}" not found.`);
  console.log(`Using ${voice.name}.\n`);
  return voice.name;
}

async function synthesize(text, voiceName, speakingRate) {
  const { audioContent } = await google("text:synthesize", {
    input: { text },
    voice: { languageCode: "am-ET", name: voiceName },
    audioConfig: { audioEncoding: "MP3", speakingRate },
  });
  return Buffer.from(audioContent, "base64");
}

// ---- Run ------------------------------------------------------------------------

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { files: {} };

const jobs = [];
for (const [path, item] of items) {
  for (const [p, rate] of [
    [path, 1],
    [slowPath(path), SLOW_RATE],
  ]) {
    const recorded = existsSync(join(PUBLIC, p));
    const out = join(PUBLIC, p.replace(/^\/audio\//, "audio-tts/"));
    if (recorded) continue; // Tsega's recording exists — no stand-in needed.
    if (existsSync(out) && !force) continue;
    jobs.push({ path: p, out, rate, ...item });
  }
}

console.log(`${items.size} recordings used by the lessons; ${jobs.length} computer-voice files to make.`);

if (dryRun || !key) {
  if (!key && !dryRun) console.log("\nNo GOOGLE_TTS_API_KEY in .env.local, so nothing was made. Showing the list instead.");
  for (const j of jobs) console.log(`  ${j.kind.padEnd(5)} ${j.text}  →  ${j.out.replace(ROOT + "/", "")}`);
  process.exit(0);
}

const voiceName = await pickVoice();
let made = 0;
for (const j of jobs) {
  try {
    const mp3 = await synthesize(j.text, voiceName, j.rate);
    mkdirSync(dirname(j.out), { recursive: true });
    writeFileSync(j.out, mp3);
    manifest.files[j.path] = { text: j.text, kind: j.kind, voice: voiceName, reviewed: false };
    made++;
    console.log(`  ✓ ${j.text}  ${j.rate === 1 ? "" : "(slow)"}`);
  } catch (err) {
    console.error(`  ✗ ${j.text}: ${err.message}`);
    if (made === 0) break; // First call failed — likely a setup problem, so stop.
  }
}

mkdirSync(dirname(MANIFEST), { recursive: true });
manifest.note = "Computer-voice stand-ins. Tsega's recordings in public/audio/ always win.";
manifest.files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nMade ${made} of ${jobs.length}.`);
