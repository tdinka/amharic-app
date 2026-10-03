# Start here — building the prototype with Claude Code

## 1. Put the folder in place
1. Unzip `amharic-app.zip`.
2. Move the `amharic-app` folder into `~/Projects/` (next to `recipe-app`).

## 2. Open it in Claude Code
In Terminal:
```
cd ~/Projects/amharic-app
claude
```

## 3. Paste this as your first message

> Read CLAUDE.md and docs/prototype-spec.md, then look at content/fidel.json and content/lessons/week-1.json. Build the prototype described in the spec. Start by scaffolding the Next.js 14 app in this folder without overwriting the existing files, then build in this order: (1) the fidel explorer, (2) the lesson player with all step types, (3) progress saving and the home/lesson path, (4) spaced-repetition reviews, (5) the recording studio, (6) the progress page. After each one, tell me how to see it in my browser and suggest a good moment to commit in GitHub Desktop. Explain any terminal command before you run it.

## 4. Make it a GitHub repo
After the scaffold step, open GitHub Desktop → **File → Add Local Repository** → choose `~/Projects/amharic-app` → create the repository → publish it.

## 5. Record your audio
Once step 5 is built, open `http://localhost:3000/studio` and record the Week 1 characters and words. Each recording drops straight into the lessons.

## What's in the folder
| File | What it is |
| --- | --- |
| `CLAUDE.md` | Standing instructions Claude Code reads every session: decisions, stack, how you like to work |
| `docs/prototype-spec.md` | Exactly what to build and when it's "done" |
| `content/fidel.json` | All 34 consonant families × 7 vowel orders (238 characters) + 26 labialized forms, punctuation and numerals, in teaching order |
| `content/lessons/week-1.json` | Lessons 1–3: 5 families, 9 words, a first story — every word uses only letters already taught |
