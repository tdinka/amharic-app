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
- Font: Noto Sans Ethiopic (Google Fonts).
- Hosting later: Railway (same as Recipe Box).

## Content is data, not code
- `content/fidel.json` — all 34 consonant families × 7 vowel orders, labialized forms, punctuation, numerals, in teaching order (`week` 1–6). Generated from Unicode; do not hand-edit codepoints.
- `content/lessons/week-1.json` — the first three lessons. Every word and story in them uses only characters taught so far — keep that rule for all new lessons.
- Audio lives at `public/audio/...` with paths given in the content. Missing audio must never break a lesson: show a "recording coming" state.

## Working with Tsega
- She is early in her technical journey: explain every terminal command before running it, one step at a time, in plain words.
- **Do not run `git commit` or `git push`.** She reviews diffs and commits in GitHub Desktop — tell her when it's a good moment to commit and suggest a message.
- Back up `.env` before any file reorganizing.
- If Prisma is added later: use `prisma db push`, never `prisma migrate dev`.
- Known Next.js 14.2 trap: `useSearchParams` + `Suspense` + `force-dynamic` in a Server Component can stack-overflow; read `window.location.search` instead.
- `export const dynamic = "force-dynamic"` does nothing in Client Components.

## Quality bar
This project is personal to Tsega. Get the Amharic exactly right: render characters from the content files, never retype them from memory. When unsure about Amharic, ask her rather than guess.
