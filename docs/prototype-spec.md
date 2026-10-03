# Prototype spec — Weeks 1–4 of the build

Goal: a working web prototype that a real learner can use for the first week of the curriculum, with progress that survives closing the browser. Test it with 5–10 learners, including heritage learners.

## Screens

1. **Home / lesson path**
   - Week 1 shown as a path of 3 lesson nodes; later weeks shown locked.
   - Next lesson highlighted; finished lessons show a check.
   - Header: streak (days in a row), "reviews due" count, characters mastered out of 231.

2. **Lesson player** — plays the `steps` array from `content/lessons/week-1.json` one step per screen, with a progress bar and a Continue button. Step types to support:
   | Step type | What to render |
   | --- | --- |
   | `intro`, `rule`, `wrapUp` | Text card |
   | `hear` | Big character tiles; tap to play audio; auto-play in sequence |
   | `see` | One family's 7 forms in a row, the vowel mark highlighted in a second color, with the explanation text |
   | `chant` | Plays all 7 forms of a family in rhythm, highlighting each as it sounds |
   | `trace` | Handwriting canvas (see below) for each character |
   | `say` | Record button (MediaRecorder API), play back yours next to the native audio |
   | `words` | Word cards: big Amharic, picture, English, romanization, play button, optional note |
   | `phrase` | A single word card marked "hear and say only" |
   | `exercise` → `soundMatch` | Play audio, pick the matching character from options |
   | `exercise` → `gridFill` | A family's row with hidden cells; pick the missing ones |
   | `exercise` → `buildWord` | Drag or tap tiles into order to spell the target |
   | `exercise` → `minimalPair` | Play one of two, learner picks which they heard |
   | `exercise` → `dictation` | Play the word; learner types it with the on-screen fidel picker (only learned characters shown) |
   | `exercise` → `pictureNaming` | Show the picture, pick the word |
   | `story` | Lines of text, every word tappable for audio, English toggle, record-yourself-reading button |
   | `review` | Spaced-repetition cards due today (see below) |
   | `punctuation` | Show the marks with their names from `fidel.json` |
   - Correct/incorrect feedback is warm and quick; wrong answers come back at the end of the lesson.
   - The lesson finishes with a culture note card (`cultureNote`).

3. **Fidel explorer** — the full 34 × 7 grid from `content/fidel.json`. Families learned so far are in full color and tappable (audio + stroke animation); the rest are dimmed but visible so learners see where they're headed. Toggle to show/hide romanization.

4. **Progress page** — characters mastered, words known, minutes practiced, streak calendar, and per-skill bars (read, write, listen, speak).

5. **Recording studio** (`/studio`, hidden from learners) — for Tsega as reviewer:
   - Lists every character, word and story line in the content files that needs audio.
   - Record → listen → save each one, at slow and natural speed.
   - Saves files into `public/audio/...` at the paths the content expects (in dev, via a local API route that writes the file).
   - A "mark reviewed" toggle per item, plus a filter for "not yet reviewed".
   - This is how native audio gets made for the prototype — no TTS for core content.

## Handwriting canvas
- Pointer events, works with finger, mouse or stylus.
- Faint guide character underneath (Noto Sans Ethiopic) for tracing; a "from memory" mode hides it.
- Prototype check: compare the drawing to the rendered character (rasterize both, measure overlap) and give a simple "nice / try again". Real stroke-order data can come later.

## Spaced repetition
- Use the open-source `ts-fsrs` package.
- Every character and word the learner meets becomes a card. Reviews run at the start of each lesson and are also available on their own ("Quick 5-minute review").
- Card front varies: see char → say/pick sound; hear sound → pick char; see word → pick meaning.

## Progress storage
- `ProgressStore` interface with a `LocalStorageProgressStore` implementation.
- Stores: completed lessons, per-card FSRS state, streak dates, minutes, per-skill counts, romanization setting.
- Export / import progress as a JSON file (so nothing is lost before accounts exist).

## Romanization fading
Setting with three levels: always shown → shown on tap → hidden. Default: always shown in week 1.

## Design feel
Warm, calm and celebratory — not a game arcade. Generous Amharic type (characters at least 48px in lessons). Colors and motifs may nod to Ethiopian textiles (tibeb borders) without becoming a flag theme. Must work well on a phone.

## Out of scope for the prototype
Accounts, database, payments, AI conversation partner, pronunciation scoring, native mobile apps, weeks 2–6 content.

## Done when
- A new learner can complete lessons 1–3 on a phone, close the tab, come back the next day and see their streak and due reviews.
- Every audio slot either plays Tsega's recording or shows "recording coming".
- The fidel explorer shows all 34 families correctly.
