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
- **Week 3 drafts (all unreviewed)** — please check every word, romanization and picture in `content/lessons/week-3.json`. Least sure of:
  - Spellings with more than one common form: ሀገር “hager” (country — some write it with a different first letter) and ውሃ “wuha” (water). Which spelling should learners see?
  - Romanization: ውሃ as “wuha” (the letters say wə-ha), and doubling in ገና “genna”.
  - ገና glossed “Christmas (Ethiopian)”; ሆድ “stomach”; ቸኮሌት “chekolēt” — the everyday spelling and sound?
  - Story “At the table”: “ጥሩ ቁርስ!” = “A good breakfast!” and “ቻው!” = “Bye!” — natural?
  - Culture notes: ገና on 7 January with a fast and a night church service; salt bars (amole) once used as money; greetings that bless health. Accurate?
- **Week 3 contrast recordings** — the two new minimal pairs need your own recordings of both words: ጣት t'at vs ታት tat, and ጨው ch'ew vs ቸው chew. Also worth a listen: whether the computer voice really pops the ejectives in Weeks 2–3.
- **Week 4 drafts (all unreviewed)** — please check every word, romanization and picture in `content/lessons/week-4.json`. Least sure of:
  - Romanizing the held ny: አማርኛ “amarənnya”, እንግሊዝኛ “ənglizənnya”, ሰኞ “sennyo”. fidel.json writes this letter as “ny”; would you rather learners see “ñ” (e.g. “amarəñña”)? That's a one-place change in fidel.json plus these words.
  - The ዋና pair: “wanna” = main vs “wana” = swimming — are these really told apart only by the held n? It needs your recordings of both either way.
  - ይቅርታ glossed “sorry / excuse me”; አዎ “yes”; ጋራዥ “garage” (chosen because ዥ-words are rare — is there a better everyday one?).
  - Story “A little Amharic”: line 2 is the plan's example sentence (እኔ አማርኛ እናገራለሁ።); are “ትንሽ!” = “A little!” and “ጥሩ ነው!” = “That's good!” natural replies?
  - Rule cards: “new letters from old” (an extra mark on top) and the ny/zh descriptions — clear and accurate?
  - Culture notes: no family surnames (second name = father's first name); coffee with incense and popcorn; Amharic as the federal working language, and the fidel also writing Tigrinya. Accurate?
- **Week 5 drafts (all unreviewed)** — please check every word, romanization and picture in `content/lessons/week-5.json`. Least sure of:
  - Spelling with ጸ: ጸጉር hair, ጸሎት prayer, ጽጌረዳ rose, ጽዋ cup — many people write some of these with the week-6 letter that sounds the same. Which spellings should learners see?
  - ጳጳስ “bishop” — the best everyday word for the rare ጰ family? And is ጽዋ the word you'd use for “cup”?
  - Loanword romanizations: ፒዛ “piza”, ቪዲዮ “vidiyo”, ቴሌቪዥን “tēlēvizhən”, and ጓደኛ “gwadennya” (held ny?).
  - ኸ is taught as “another h”, sounding the same as ሀ — right for Addis Ababa Amharic?
  - The w-forms taught: ቋ ጓ ኳ ሏ (the plan listed three; I added ኳ for ኳስ ball). Good choice?
  - Story “Friends”: “እኔ ትንሽ አማርኛ እናገራለሁ።” and “አማርኛ ጥሩ ቋንቋ ነው።” = “Amharic is a good language.” — natural?
  - Culture notes: Italian loanwords and the Merkato's name; Ethiopia's early Christian and Muslim communities; greeting with kisses on alternating cheeks and touching shoulders. Accurate?
- **Week 6 drafts (all unreviewed)** — please check every word, romanization and picture in `content/lessons/week-6.json`. Least sure of:
  - Spellings with the sound-alike letters: ሐኪም, ሐሙስ, ሕይወት, ኃይል, ሥራ, ሥጋ, ዓመት, ዓይን, ፀሐይ, and ሦስት (three — often written with the plain s letter). Which spellings should learners see? The rule cards now say “in these lessons” rather than “always”.
  - Number-word romanizations: አምስት “aməst”, ስድስት “sədəst”, ስምንት “səmənt”, አስር “asər”.
  - Holiday card: “እንኳን አደረሳችሁ!” = “Happy holiday!”, “ፍቅር፣ ጤና፣ ሕይወት!” = “Love, health, life!”, and signing off “ልጅሽ” = “Your child” (to a mother). Natural?
  - Café: “ቡና ስንት ነው፧” = “How much is coffee?” and “ጥሩ! ሁለት ቡና!” = “Good! Two coffees!”. Natural? The prices are made up.
  - Culture notes: why Ge'ez had separate letters for the h/s/a/ts' sounds; the Ethiopian calendar being about 7–8 years behind; where fidel numerals are still used. Accurate?
  - No dictation in lesson 1–2 and only one in lesson 3 (ሰባት), since hearing a word can't tell you which sound-alike letter it uses. Is that the right call?
- **Welcome screens (unreviewed)** — `content/intro.json`, shown to new learners before lesson 1 and linked from Settings. Is the description of Amharic right (one of Ethiopia's main languages and its federal working language; tens of millions of speakers; Semitic, related to Arabic and Hebrew; Addis Ababa standard)? And does “How the course works” set the right expectations for your learners — especially heritage learners?
- **Gentler start to Week 1 (unreviewed)** — lesson 1 now teaches ለ then መ, one vowel at a time (forms 1–4, a check, then 5–7), listening and looking only; አ moved to lesson 2 with its own explanation, along with the first writing and speaking. Does this order work for your learners? And are these sound hints right for Addis Ababa Amharic: ē “like the ‘ay’ in ‘say’”, ə “a very short vowel, sometimes not said at all”, o “like the ‘o’ in ‘go’”?
- **Alphabet map in the welcome (unreviewed)** — a new card shows the whole fidel as a faded grid, one row and one column highlighted. Helpful, or too much on day one?

## Answered

- **Total characters:** 238 (the count in `content/fidel.json`) is right. Spec updated from 231.
- **Week 1 word count:** the Lesson 3 wrap-up now says 11 words, not 9.
- **Grid-fill `hide` numbers:** they are vowel orders (1–7), e.g. `"hide": [2, 4]` hides the 2nd and 4th forms. Use the same numbering in all lessons.
- **ሰባ (seventy):** moved from Week 1 lesson 2 to lesson 3, after its letters are taught. `npm run check:lessons` now passes.
