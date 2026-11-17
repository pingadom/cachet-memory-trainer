# ¢achet — memory trainer

**Train your human cache.** Cachet teaches memory techniques from nothing, up to memorising a shuffled deck of 52 playing cards in under two minutes and recalling it perfectly.

**Use it:** https://pingadom.github.io/cachet-memory-trainer/

It is a free static website. There is no account, no server and no tracking; your progress is stored in your own browser.

## What it teaches

A written course of 30 lessons in ten stages. Every lesson has an objective, an explanation, a demonstration, a worked example, an exercise that requires real recall, feedback on your result, and a recap.

| Stage | | You can then |
|---|---|---|
| 1 | Understanding memory | explain why repetition fails and what replaces it |
| 2 | Building mental imagery | link ten unrelated words in order, forwards and backwards |
| 3 | The memory palace | build your own palace and hold 20 items in it |
| 4 | Numbers | turn digits into images with the Major system and memorise a 20-digit number |
| 5 | Cards as images | give each of the 52 cards a fixed image |
| 6 | Card recognition | recognise any card's image in about a second |
| 7 | Card sequences | memorise 3 → 5 → 10 → 15 → 26 → 52 cards |
| 8 | Person–Action–Object | encode three cards as one scene and decode it again |
| 9 | Speed training | remove hesitation without losing accuracy |
| 10 | The two-minute deck | attempt the full challenge |

## Goals along the way

- 10, then 20 words in order
- A palace of 10 locations; 52 locations in total
- A 20-digit number memorised in 2 minutes → 60 s → 30 s → 15 s → 5 s (the last is world-class pace)
- Your own image for all 52 cards; all 52 associations solid
- 10 cards, then half a deck, recalled perfectly
- A full deck recalled perfectly, then in under 15, 10, 5, 3 and 2 minutes

A timed goal counts only when recall is perfect and no hints were used. A 100-second deck with three mistakes is recorded as 49/52, and is not a sub-two-minute deck.

## What is in it

- **Dashboard** — current stage, today's 10–20 minute plan, the journey to the two-minute deck, key numbers and charts.
- **Learn** — the course.
- **Train** — every exercise on demand: word lists, paired associations, digits, palace walks, card → image, image → card, rapid recognition, weak cards, due reviews, suit training, card sequences, PAO components, scene building and decoding, deck run-throughs.
- **My Systems** — a memory palace builder (areas, ordered locations, notes, optional images, duplicate, reorder), a 52-card image editor, a PAO builder with duplicate and conflict checks and import/export, and a 00–99 number image list. Suggestions are shown separately from what you have saved and never overwrite it.
- **Speed Cards** — the full-deck arena: memorise (1, 2 or 3 cards per view, optional auto-advance, keyboard / mouse / touch), recall (52 slots, no duplicates, drag to swap, keyboard entry), and a position-by-position comparison.
- **Progress** — a 52-card mastery grid with a record for every card (accuracy, response times, attempts, confusions, next review), goals, the sequence ladder, charts and history.
- **Handbook** — a searchable reference for every technique, including the exact review schedule and recommendation rules.

The adaptive part is a set of fixed, readable rules (see `www/js/core/adapt.js` and the handbook), not a model. Each recommendation shows the reason for it.

## Run it locally

No build step and no dependencies. Node 20 or newer.

```bash
npm run serve
```

Then open http://localhost:8791. Any static file server pointed at `www/` works as well.

```bash
npm test
```

## How it is built

Plain HTML, CSS and JavaScript modules in `www/`.

```
www/
  index.html, css/style.css, fonts/
  js/
    core/      logic with no DOM: fully unit tested
      cards.js       deck, unbiased shuffle (crypto + Fisher–Yates)
      session.js     one memorise → recall → results attempt; holds the deck privately
      scoring.js     recall comparison, error types, milestone rules
      srs.js         per-card statistics and the spaced-repetition schedule
      pao.js         PAO encoding, decoding, conflict detection
      systems.js     example card images, PAO system and number list
      store.js       versioned persistence, validation, import/export
      curriculum.js  lesson order and completion
      adapt.js       recommendations, daily plan, goals
    content/   the lessons, the handbook, word lists
    ui/        shared components, exercises, the card arena
    views/     one module per page
tests/core.test.js
```

Persistence is one versioned JSON document in `localStorage`, read and written through `createStore(storage)`. The store accepts any Storage-like object, which is where an account or sync layer would attach.

## Your data

Everything stays on your device. Use **My Systems → Data** to download a backup or restore one. Clearing your browser's site data deletes your progress, so keep a backup if it matters to you.

## Credits

Design language borrowed from its sibling project, [Theo](https://github.com/pingadom/quant-trainer). Fonts: IBM Plex Sans, IBM Plex Mono and Newsreader, under the SIL Open Font Licence (see `www/fonts/`).

The techniques themselves are old and shared: the method of loci goes back to classical antiquity, the Major system to the seventeenth century, and PAO to the competitive memory community.

## Licence

MIT
