# Questions for Tsega to review

Open questions about content and wording. Claude adds to this list and brings it up at the start of sessions; move an item to **Answered** once Tsega decides.

## Open

- **"ejective — a popped sound"** — the label shown on ejective letter families in the fidel explorer (`app/fidel/FidelExplorer.tsx`). Is this wording clear and accurate for learners? Kept as is for now.
- **Computer voice** — Week 1 uses Google's `am-ET-Wavenet-A` (female) as a stand-in. Does it pronounce the letters and words correctly, and is it the best of the four voices (Standard A/B, Wavenet A/B)? Note any that sound wrong; they're listed in `public/audio-tts/manifest.json`.

- **Week 2 drafts (all unreviewed)** — please check every word, romanization and picture in `content/lessons/week-2.json`. Things I’m least sure of:
  - Doubled sounds in the romanization: ቡና “bunna”, ዳቦ “dabbo”. Is the consonant really held in each? Any other Week 2 word that should show doubling?
  - ቅቤ romanized “qəbē” and እናት “ənat” — right?
  - አንተ glossed “you (to a man or boy)” — good, or should Week 2 teach a different “you” first?
  - Story line 2, “ቁርስ ቡና፣ ዳቦ፣ ቅቤ።” = “Breakfast: coffee, bread, butter.” — fine without a colon after the first word?
  - Story line 3, “ቡና ለእናት፣ ዳቦ ለአባ።” = “Coffee for Mother, bread for Dad.” — natural Amharic? It introduces ለ- “for”.
  - Culture notes: coffee ceremony (three rounds, jebena), Ethiopian time counting from sunrise, the Ethiopian calendar (13 months, new year in September). Accurate and the way you’d put it?
  - The ejective rule uses the same “a popped sound” wording that’s still an open question above.
- **ካል “kal” contrast recording** — Week 2’s minimal pair (ቃል qal vs ካል kal) needs your own recordings of both, like the “held m” pair in Week 1; a computer voice can’t make the difference.

## Answered

- **Total characters:** 238 (the count in `content/fidel.json`) is right. Spec updated from 231.
- **Week 1 word count:** the Lesson 3 wrap-up now says 11 words, not 9.
- **Grid-fill `hide` numbers:** they are vowel orders (1–7), so `"hide": [3, 5]` in Lesson 1 hides ሊ (li) and ሌ (lē). Use the same numbering in new lessons.
- **ሰባ (seventy):** moved from Week 1 lesson 2 to lesson 3, after its letters are taught. `npm run check:lessons` now passes.
