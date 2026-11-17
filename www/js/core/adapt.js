// The adaptive engine. Rules, not machine learning: every recommendation carries the reason
// that produced it, and each rule below can be read in a line or two.

import { DECK, cardLabel } from './cards.js';
import { level, mastery, isDue, recentAccuracy, recentSpeed, median, FAST_MS } from './srs.js';
import { milestoneEligible, earnedMilestones, DECK_MILESTONES, fmtTime } from './scoring.js';
import { nextLesson, isDone } from './curriculum.js';
import { allLoci } from './store.js';
import { savedImageCount } from './systems.js';
import { paoCompletion } from './pao.js';

export const SEQ_LADDER = [3, 5, 10, 15, 26, 52];
const DAY = 86400000;
export const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/** Summary of one family of associations: 'img' (card images), 'p' / 'a' / 'o' (PAO parts). */
export function cardSummary(state, prefix = 'img', now = Date.now()) {
  const levels = { new: 0, learning: 0, shaky: 0, solid: 0, automatic: 0 };
  const rows = DECK.map((id) => {
    const s = state.stats[`${prefix}:${id}`];
    const lv = level(s);
    levels[lv]++;
    return { id, s, level: lv, mastery: mastery(s) };
  });
  const seen = rows.filter((r) => r.s && r.s.n);
  const speeds = seen.map((r) => recentSpeed(r.s)).filter(Number.isFinite);
  const pairs = new Map();
  for (const r of seen) for (const [other, n] of Object.entries(r.s.conf || {})) {
    const k = [r.id, other].sort().join('|');
    pairs.set(k, (pairs.get(k) || 0) + n);
  }
  return {
    rows,
    levels,
    seen: seen.length,
    mastered: levels.solid + levels.automatic,
    automatic: levels.automatic,
    accuracy: seen.length ? seen.reduce((a, r) => a + recentAccuracy(r.s), 0) / seen.length : 0,
    medianMs: median(speeds),
    due: seen.filter((r) => isDue(r.s, now)).map((r) => r.id),
    weak: seen.filter((r) => r.level === 'shaky' || r.level === 'learning').sort((a, b) => a.mastery - b.mastery).map((r) => r.id),
    confusions: [...pairs].map(([k, n]) => ({ cards: k.split('|'), n })).sort((a, b) => b.n - a.n),
  };
}

const seqAttempts = (state) => state.history.filter((h) => h.kind === 'seq');

/** Where the learner is on the 3 → 52 card ladder. A rung is cleared by two perfect, unassisted attempts. */
export function seqProgress(state) {
  const attempts = seqAttempts(state);
  const rungs = SEQ_LADDER.map((n) => {
    const at = attempts.filter((h) => h.total === n);
    const clean = at.filter((h) => h.correct === n && !h.assisted);
    return { n, attempts: at.length, perfect: clean.length, cleared: clean.length >= 2 || (n === 52 && clean.length >= 1), best: clean.length ? Math.min(...clean.map((h) => h.encodeMs)) : null };
  });
  const next = rungs.find((r) => !r.cleared) || rungs[rungs.length - 1];
  return { rungs, next: next.n };
}

export function deckSummary(state) {
  const decks = seqAttempts(state).filter((h) => h.total === 52);
  const valid = decks.filter(milestoneEligible);
  const best = valid.length ? Math.min(...valid.map((h) => h.encodeMs)) : null;
  const recent = decks.slice(-5);
  return {
    attempts: decks,
    perfect: valid.length,
    bestMs: best,
    recentAccuracy: recent.length ? recent.reduce((a, h) => a + h.correct / 52, 0) / recent.length : null,
    // 0..1 progress to the 120 s goal on a log scale from 20 minutes, so early gains still show.
    toGoal: best == null ? 0 : Math.max(0, Math.min(1, Math.log(1200000 / best) / Math.log(1200000 / 120000))),
  };
}

/** Milestones newly earned by an attempt; records them on the state. */
export function awardMilestones(state, attempt, now = Date.now()) {
  const fresh = [];
  for (const id of earnedMilestones(attempt)) if (!state.milestones[id]) { state.milestones[id] = now; fresh.push(id); }
  return fresh;
}

const bestTimed = (state, kind, n, pred = () => true) => {
  const ok = state.history.filter((h) => h.kind === kind && h.total >= n && h.correct === h.total && !h.assisted && pred(h));
  return ok.length ? Math.min(...ok.map((h) => h.encodeMs ?? Infinity)) : null;
};

/** The ladder of intermediate goals, from ten words to the two-minute deck. */
export function goals(state) {
  const loci = state.palaces.reduce((a, p) => a + allLoci(p).length, 0);
  const img = cardSummary(state, 'img');
  const words10 = bestTimed(state, 'words', 10) != null;
  const words20 = bestTimed(state, 'words', 20) != null;
  const d20 = bestTimed(state, 'digits', 20);
  const seq = seqProgress(state);
  const rung = (n) => seq.rungs.find((r) => r.n === n);
  const g = (id, group, label, done, detail = '', href = '') => ({ id, group, label, done: !!done, detail, href });
  const digit = (secs) => g(`digits-${secs}`, 'Numbers', `20 digits memorised in ${secs >= 60 ? `${secs / 60} minute${secs > 60 ? 's' : ''}` : `${secs} seconds`}`, d20 != null && d20 <= secs * 1000, d20 != null ? `best ${fmtTime(d20)}` : '', '#/train/digits?n=20');
  return [
    g('words-10', 'Foundations', '10 words in order, perfectly', words10, '', '#/train/words?n=10'),
    g('words-20', 'Foundations', '20 words in order, perfectly', words20, '', '#/train/words?n=20'),
    g('palace-10', 'Palaces', 'A palace with 10 locations', state.palaces.some((p) => allLoci(p).length >= 10), `${loci} locations so far`, '#/systems/palaces'),
    g('palace-52', 'Palaces', '52 locations across your palaces', loci >= 52, `${loci} of 52`, '#/systems/palaces'),
    digit(120), digit(60), digit(30), digit(15), digit(5),
    g('images-52', 'Cards', 'Your own image for all 52 cards', savedImageCount(state) === 52, `${savedImageCount(state)} of 52 saved`, '#/systems/cards'),
    g('auto-52', 'Cards', 'All 52 associations solid or automatic', img.mastered === 52, `${img.mastered} of 52`, '#/train/weak'),
    g('seq-10', 'Cards', '10 cards recalled perfectly', rung(10).perfect > 0, '', '#/train/seq?n=10'),
    g('seq-26', 'Cards', 'Half a deck recalled perfectly', rung(26).perfect > 0, '', '#/train/seq?n=26'),
    ...DECK_MILESTONES.map((m) => g(m.id, 'Full deck', m.id === 'deck-perfect' ? 'A full deck recalled perfectly' : `Full deck memorised in ${m.label.toLowerCase()}`, state.milestones[m.id], state.milestones[m.id] ? new Date(state.milestones[m.id]).toLocaleDateString() : '', '#/speed')),
  ];
}

/** The short version of the ladder shown as the journey strip on the dashboard. */
export function journey(state) {
  const all = Object.fromEntries(goals(state).map((x) => [x.id, x]));
  return [
    ['words-10', '10 words'], ['palace-10', 'First palace'], ['digits-60', '20 digits · 60s'], ['images-52', '52 images'],
    ['seq-10', '10 cards'], ['seq-26', 'Half deck'], ['deck-perfect', 'Full deck'], ['deck-5', 'Under 5:00'], ['deck-2', 'Under 2:00'],
  ].map(([id, short]) => ({ ...all[id], short }));
}

/**
 * What to practise next, most useful first. Each item: { id, title, why, href, minutes, match }.
 * `match` describes the history entry that would count as having done it.
 */
export function recommend(state, now = Date.now()) {
  const out = [];
  const add = (item) => { if (!out.some((o) => o.id === item.id)) out.push(item); };
  const img = cardSummary(state, 'img', now);
  const seq = seqProgress(state);
  const attempts = seqAttempts(state);
  const lesson = nextLesson(state);

  // 1. Two cards repeatedly mistaken for each other: separate them before anything else.
  const pair = img.confusions.find((c) => c.n >= 2);
  if (pair) add({
    id: `confuse-${pair.cards.join('-')}`, minutes: 3,
    title: `Separate ${pair.cards.map(cardLabel).join(' and ')}`,
    why: `You have mixed these two up ${pair.n} times. A short drill on just this pair and its neighbours fixes it faster than general practice.`,
    href: `#/train/i2c?pool=cards:${[...new Set([...pair.cards, ...img.weak.slice(0, 4)])].join(',')}`,
    match: { kind: 'drill' },
  });

  // 2. Scheduled reviews.
  if (img.due.length >= 5) add({
    id: 'due', minutes: Math.min(6, Math.ceil(img.due.length / 8) + 1),
    title: `Review ${img.due.length} due cards`,
    why: 'These associations are scheduled for review today. Reviewing just before you would forget is the cheapest way to keep them.',
    href: '#/train/due', match: { kind: 'drill', mode: 'due' },
  });

  // 3. Accuracy before speed.
  if (img.seen >= 13 && img.accuracy < 0.8) add({
    id: 'accuracy', minutes: 5,
    title: 'Slow, accurate card recognition',
    why: `Recent recognition accuracy is ${Math.round(img.accuracy * 100)}%. Speed built on wrong associations has to be unlearned, so take this session without time pressure.`,
    href: '#/train/weak', match: { kind: 'drill' },
  });

  // 4. Fast but inaccurate sequences: slow down.
  const lastSeq = attempts.slice(-3);
  const rushed = lastSeq.length >= 2 && lastSeq.every((h) => h.correct / h.total < 0.9 && h.encodeMs / h.total < 4000);
  if (rushed) add({
    id: 'slow-seq', minutes: 6,
    title: `${lastSeq[lastSeq.length - 1].total} cards, untimed and accurate`,
    why: 'Your recent attempts were quick but lost cards. Take one attempt at half the pace and aim for every position correct.',
    href: `#/train/seq?n=${lastSeq[lastSeq.length - 1].total}`, match: { kind: 'seq' },
  });

  // 5. Short sequences fine, long ones failing: the palace is the bottleneck.
  const idx = SEQ_LADDER.indexOf(seq.next);
  const stuck = attempts.filter((h) => h.total === seq.next).slice(-3);
  if (idx > 0 && stuck.length >= 3 && stuck.every((h) => h.correct < h.total)) add({
    id: 'palace-fluency', minutes: 4,
    title: 'Palace walk, forwards and backwards',
    why: `${SEQ_LADDER[idx - 1]} cards is solid but ${seq.next} keeps slipping. Longer sequences fail at the route, not the images: make the walk itself effortless.`,
    href: '#/train/walk', match: { kind: 'palace' },
  });

  // 6. The next lesson.
  if (lesson) add({
    id: `lesson-${lesson.id}`, minutes: lesson.minutes,
    title: `Lesson: ${lesson.title}`,
    why: 'The next step in the course.',
    href: `#/learn/${lesson.id}`, match: { kind: 'lesson', id: lesson.id },
  });

  // 7. Weak associations.
  if (img.weak.length >= 4 && img.accuracy >= 0.8) add({
    id: 'weak', minutes: 4,
    title: `Strengthen ${img.weak.length} weak cards`,
    why: 'These are the cards you answer slowly or miss. They are where a full-deck attempt will break.',
    href: '#/train/weak', match: { kind: 'drill', mode: 'weak' },
  });

  // 8. Accurate but slow: recognition speed.
  if (img.seen >= 40 && img.accuracy >= 0.9 && img.medianMs > FAST_MS) add({
    id: 'rapid', minutes: 4,
    title: 'Rapid recognition',
    why: `You know the cards (${Math.round(img.accuracy * 100)}%) but take ${(img.medianMs / 1000).toFixed(1)}s each. Recognition under about 1.5s is what makes whole-deck speed possible.`,
    href: '#/train/rapid', match: { kind: 'drill', mode: 'rapid' },
  });

  // 9. The sequence ladder, once the card lessons have started.
  if (isDone(state, 'first-sequence')) add({
    id: `seq-${seq.next}`, minutes: seq.next <= 10 ? 4 : seq.next <= 26 ? 8 : 15,
    title: seq.next === 52 ? 'Full deck attempt' : `${seq.next}-card sequence`,
    why: seq.next === 52 ? 'Half decks are clean. Time to hold all 52.' : `The next rung of the ladder. Two perfect unassisted attempts clear it.`,
    href: seq.next === 52 ? '#/speed' : `#/train/seq?n=${seq.next}`, match: { kind: 'seq', total: seq.next },
  });

  // 10. PAO: accurate but slow scenes.
  const pao = ['p', 'a', 'o'].map((f) => cardSummary(state, f, now));
  if (isDone(state, 'pao-build')) {
    const weakest = pao.map((s, i) => ({ s, f: 'pao'[i] })).sort((a, b) => a.s.mastered - b.s.mastered)[0];
    if (weakest.s.mastered < 52) add({
      id: `pao-${weakest.f}`, minutes: 4,
      title: `PAO ${{ p: 'people', a: 'actions', o: 'objects' }[weakest.f]}`,
      why: `Only ${weakest.s.mastered} of 52 are solid. A scene is as fast as its slowest part.`,
      href: `#/train/pao-${weakest.f}`, match: { kind: 'drill', field: weakest.f },
    });
    else add({ id: 'pao-encode', minutes: 5, title: 'PAO scene speed', why: 'All three components are solid. Now practise fusing three cards into one scene without pausing.', href: '#/train/pao-encode', match: { kind: 'pao' } });
  }

  // 11. Numbers goal.
  if (isDone(state, 'number-pegs') && !goals(state).find((x) => x.id === 'digits-30').done) add({
    id: 'digits', minutes: 4, title: '20-digit number', why: 'An intermediate goal that uses the same skills as cards: fast encoding, a clean route, exact recall.',
    href: '#/train/digits?n=20', match: { kind: 'digits' },
  });

  // 12. Always something: basic recall practice.
  if (!out.length) add({ id: 'words', minutes: 4, title: '10 words in order', why: 'A warm-up that exercises image-making and linking.', href: '#/train/words?n=10', match: { kind: 'words' } });
  return out;
}

const matches = (h, m) => Object.entries(m).every(([k, v]) => h[k] === v);

/** Today's plan: the top recommendations, capped at roughly 10-20 minutes, with done-today flags. */
export function dailyPlan(state, now = Date.now()) {
  const today = dayKey(now);
  const todays = state.history.filter((h) => dayKey(h.t) === today);
  const items = [];
  let minutes = 0;
  for (const r of recommend(state, now)) {
    if (items.length >= 2 && minutes + r.minutes > 20) continue;
    items.push({ ...r, done: todays.some((h) => matches(h, r.match)) });
    minutes += r.minutes;
    if (minutes >= 12 && items.length >= 3) break;
  }
  return { items, minutes, practisedToday: todays.length > 0 };
}

/** Days practised in the last `days` days, oldest first: [{ key, n, minutes }]. */
export function consistency(state, days = 84, now = Date.now()) {
  const by = new Map();
  for (const h of state.history) by.set(dayKey(h.t), (by.get(dayKey(h.t)) || 0) + 1);
  const out = [];
  for (let i = days - 1; i >= 0; i--) { const k = dayKey(now - i * DAY); out.push({ key: k, n: by.get(k) || 0 }); }
  return out;
}

export function streak(state, now = Date.now()) {
  const days = new Set(state.history.map((h) => dayKey(h.t)));
  let n = 0;
  let t = now;
  if (!days.has(dayKey(t))) t -= DAY;
  while (days.has(dayKey(t))) { n++; t -= DAY; }
  return n;
}

export { paoCompletion };
