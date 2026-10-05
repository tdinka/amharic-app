# Amharic learning app — notes for Claude Code

A web app that teaches non-speakers to read, write and speak Amharic through short daily lessons, with progress saved over months. Full research and curriculum plan: https://claude.ai/code/artifact/ce7a2d2d-ff3e-4279-98b4-63e88ae4d701

## Decisions already made
- **Web first** (mobile-friendly, installable to home screen). Native apps later.
- **Free** to start; may add a paid tier later. Don't build payments.
- **Addis Ababa standard Amharic** only. No regional variants.
- **Simple, learner-friendly romanization** (see `content/fidel.json` → `meta.romanization`). Keep all romanization logic in ONE mapping file so it can be changed in one place.
- **Tsega is the content reviewer.** Every content item has `"reviewed": false` until she approves it.
- Tigrinya / Ge'ez extensions: later, not now.

## Stack (matches Tsega's other project, Family Recipe Box)
- Next.js 14 (App Router, TypeScript) + Tailwind CSS
- Prototype: progress in `localStorage` behind a `ProgressStore` interface, so it can be swapped for Postgres + Prisma + NextAuth (credentials) later without touching UI code.
- Fonts: Young Serif (headings), Libre Franklin (text, with Noto Sans as backup for letters like ə), Noto Serif Ethiopic (the fidel) — all Google Fonts via `lib/fonts.ts`.
- Look ("Mix 2.1", chosen Oct 2026): linen ground, ink outlines, woven-basket colours. Colours live in `tailwind.config.ts`. Rules: crimson (`berbere`) only for actions; wrong answers rose with ✕, right answers emerald (`leaf`) with ✓ (`components/Marks.tsx`); ink press-shadows only on things you can press (`.btn-*` in `app/globals.css`); the woven `.tibeb` band only on headers and celebrations; gold (`ochre`) only behind dark text.
- Hosting later: Railway (same as Recipe Box).

## Content is data, not code
- `content/intro.json` — the welcome screens new learners see before lesson 1 (also linked from Settings). Same review rule: `"reviewed": false` until Tsega approves.
- `content/fidel.json` — all 34 consonant families × 7 vowel orders, labialized forms, punctuation, numerals, in teaching order (`week` 1–6). Generated from Unicode; do not hand-edit codepoints.
- `content/lessons/week-N.json` — three lessons per week (load new week files in `lib/content.ts`). Every word and story uses only characters taught so far — keep that rule for all new lessons.
- When writing lessons, never type Amharic from memory: build each character from `fidel.json` (family + vowel order), print the letters' romanization to check spelling, and run `npm run check:lessons` (taught-letters rule, exercise sanity, word/character counts for wrap-ups). "w" forms such as ቋ count as taught only from the lesson that lists them in `newLabialized`. New content is `"reviewed": false`; list anything uncertain in `docs/questions-for-tsega.md`.
- Audio lives at `public/audio/...` with paths given in the content. Missing audio must never break a lesson: show a "recording coming" state.
- Temporary computer voices (Google Cloud TTS, Amharic) live in `public/audio-tts/`, made by `npm run audio:tts` (needs `GOOGLE_TTS_API_KEY` in `.env.local`). The app prefers Tsega's recording, falls back to these, and labels them "computer voice". Never treat them as reviewed.
- Tsega records audio in the recording studio at `/studio` (not linked from the menu). It only saves while running `npm run dev`: recordings go to `public/audio/...` as MP3, and its "reviewed" switches write the `reviewed` flags in `content/` (letters are reviewed per family). Commit her new recordings and flag changes when she asks.

## Working with Tsega
- She is early in her technical journey: explain every terminal command before running it, one step at a time, in plain words.
- **Claude may run `git commit` and `git push`.** Before each one, tell her in plain words which files are included and the commit message. Never force-push. She can still review diffs and commit herself in GitHub Desktop.
- `docs/questions-for-tsega.md` lists open content questions. Mention any open items at the start of a session, add new ones there instead of guessing, and move items to "Answered" when she decides.
- Back up `.env` before any file reorganizing.
- If Prisma is added later: use `prisma db push`, never `prisma migrate dev`.
- Known Next.js 14.2 trap: `useSearchParams` + `Suspense` + `force-dynamic` in a Server Component can stack-overflow; read `window.location.search` instead.
- `export const dynamic = "force-dynamic"` does nothing in Client Components.

## Quality bar
This project is personal to Tsega. Get the Amharic exactly right: render characters from the content files, never retype them from memory. When unsure about Amharic, ask her rather than guess.
