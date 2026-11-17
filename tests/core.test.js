import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DECK, newDeck, shuffle, randInt, isValidSequence, parseCard, cardName } from '../www/js/core/cards.js';
import { compareSequences, compareWords, compareDigits, milestoneEligible, earnedMilestones, diagnose } from '../www/js/core/scoring.js';
import { emptyStat, recordAttempt, level, mastery, isDue, scoreDrill, pickNext } from '../www/js/core/srs.js';
import { effectivePao, encodeTriple, encodeDeck, decodeScene, decodeDeck, findConflicts, paoCompletion } from '../www/js/core/pao.js';
import { EXAMPLE_IMAGES, EXAMPLE_PAO, EXAMPLE_PEGS, effectiveImage } from '../www/js/core/systems.js';
import { createStore, memoryStorage, migrate, defaults, KEY, VERSION } from '../www/js/core/store.js';
import { LESSONS, STAGES, nextLesson, recordLesson, overallProgress, isDone, skipped, lessonsIn } from '../www/js/core/curriculum.js';
import { recommend, dailyPlan, seqProgress, deckSummary, awardMilestones, goals, cardSummary } from '../www/js/core/adapt.js';
import { createArenaSession } from '../www/js/core/session.js';
import { majorCode, majorWords, findIdeas } from '../www/js/core/ideas.js';

// ── deck generation ──────────────────────────────────────────────
test('the reference deck has 52 unique cards', () => {
  assert.equal(DECK.length, 52);
  assert.equal(new Set(DECK).size, 52);
  assert.equal(cardName('TH'), 'Ten of Hearts');
});

test('a new deck is a permutation of all 52 cards with no duplicates', () => {
  for (let i = 0; i < 200; i++) {
    const d = newDeck();
    assert.equal(d.length, 52);
    assert.ok(isValidSequence(d));
    assert.deepEqual([...d].sort(), [...DECK].sort());
  }
});

test('shorter sequences never repeat a card', () => {
  for (const n of [3, 5, 10, 15, 26]) for (let i = 0; i < 100; i++) {
    const d = newDeck(n);
    assert.equal(d.length, n);
    assert.ok(isValidSequence(d));
  }
  assert.throws(() => newDeck(53));
  assert.throws(() => newDeck(0));
});

test('randInt stays in range and is roughly uniform', () => {
  const counts = new Array(7).fill(0);
  for (let i = 0; i < 70000; i++) counts[randInt(7)]++;
  for (const c of counts) assert.ok(Math.abs(c - 10000) < 500, `bucket ${c} too far from 10000`);
});

test('shuffle is unbiased across positions (each card equally likely to land first)', () => {
  const first = {};
  const N = 26000;
  for (let i = 0; i < N; i++) { const c = shuffle(DECK)[0]; first[c] = (first[c] || 0) + 1; }
  assert.equal(Object.keys(first).length, 52);
  for (const c of DECK) assert.ok(Math.abs(first[c] - N / 52) < 120, `${c}: ${first[c]}`);
});

test('shuffle uses the supplied generator exactly as Fisher-Yates and does not mutate its input', () => {
  const input = ['a', 'b', 'c', 'd'];
  const out = shuffle(input, () => 0);
  assert.deepEqual(input, ['a', 'b', 'c', 'd']);
  assert.deepEqual(out, ['b', 'c', 'd', 'a']);
});

test('card parsing accepts common spellings', () => {
  assert.equal(parseCard('kh'), 'KH');
  assert.equal(parseCard('10 s'), 'TS');
  assert.equal(parseCard('T♦'), 'TD');
  assert.equal(parseCard('queen of clubs'), 'QC');
  assert.equal(parseCard('1x'), null);
});

// ── recall comparison ────────────────────────────────────────────
test('a perfect recall scores every position', () => {
  const d = newDeck(10);
  const r = compareSequences(d, [...d]);
  assert.equal(r.correct, 10);
  assert.ok(r.perfect);
  assert.equal(r.firstError, -1);
});

test('errors are classified: blank, swap, misplaced, wrong', () => {
  const orig = ['AS', '2S', '3S', '4S', '5S', '6S'];
  const got = ['AS', '3S', '2S', null, 'KH', 'AS'];
  const r = compareSequences(orig, got);
  assert.equal(r.correct, 1);
  assert.deepEqual(r.positions.map((p) => p.kind), ['ok', 'swap', 'swap', 'blank', 'wrong', 'misplaced']);
  assert.equal(r.firstError, 1);
  assert.deepEqual(r.kinds, { blank: 1, swap: 2, misplaced: 1, wrong: 1 });
  assert.ok(diagnose(r).length >= 3);
});

test('a short or empty submission counts missing positions as blanks, never as correct', () => {
  const d = newDeck(52);
  assert.equal(compareSequences(d, []).correct, 0);
  assert.equal(compareSequences(d, d.slice(0, 20)).correct, 20);
  assert.equal(compareSequences(d, d.slice(0, 20)).kinds.blank, 32);
});

test('word and digit comparison ignore case, spacing and punctuation', () => {
  assert.equal(compareWords(['Kettle', 'ice cream'], [' kettle ', 'Ice-Cream']).correct, 2);
  assert.equal(compareDigits('314159', '31 41 59').correct, 6);
  assert.equal(compareDigits('314159', '314').correct, 3);
});

// ── milestones ───────────────────────────────────────────────────
test('milestones need a full, perfect, unassisted deck', () => {
  const base = { total: 52, correct: 52, assisted: false, encodeMs: 100000 };
  assert.ok(milestoneEligible(base));
  assert.deepEqual(earnedMilestones(base), ['deck-perfect', 'deck-15', 'deck-10', 'deck-5', 'deck-3', 'deck-2']);
  assert.deepEqual(earnedMilestones({ ...base, encodeMs: 4 * 60000 }), ['deck-perfect', 'deck-15', 'deck-10', 'deck-5']);
  assert.deepEqual(earnedMilestones({ ...base, encodeMs: 30 * 60000 }), ['deck-perfect']);
});

test('100 seconds with three mistakes is not a sub-two-minute deck', () => {
  assert.deepEqual(earnedMilestones({ total: 52, correct: 49, assisted: false, encodeMs: 100000 }), []);
});

test('hints, short sequences and missing times never earn a milestone', () => {
  assert.deepEqual(earnedMilestones({ total: 52, correct: 52, assisted: true, encodeMs: 90000 }), []);
  assert.deepEqual(earnedMilestones({ total: 26, correct: 26, assisted: false, encodeMs: 30000 }), []);
  assert.deepEqual(earnedMilestones({ total: 52, correct: 52, assisted: false, encodeMs: 0 }), []);
  assert.deepEqual(earnedMilestones(null), []);
});

test('exactly two minutes is not under two minutes', () => {
  assert.ok(!earnedMilestones({ total: 52, correct: 52, assisted: false, encodeMs: 120000 }).includes('deck-2'));
  assert.ok(earnedMilestones({ total: 52, correct: 52, assisted: false, encodeMs: 119999 }).includes('deck-2'));
});

// ── arena session: timing and deck consistency ───────────────────
test('the arena keeps one deck from memorisation through scoring', () => {
  let now = 1000;
  const s = createArenaSession({ n: 52, clock: () => now });
  s.start();
  const seen = [];
  for (let i = 0; i < 52; i++) { seen.push(...s.view()); s.next(); }
  assert.ok(isValidSequence(seen));
  now += 95000;
  s.beginRecall();
  now += 60000;
  const res = s.submit(seen);
  assert.equal(res.correct, 52);
  assert.equal(res.encodeMs, 95000);
  assert.equal(res.recallMs, 60000);
  assert.deepEqual(res.original, seen);
  assert.deepEqual(earnedMilestones(res), ['deck-perfect', 'deck-15', 'deck-10', 'deck-5', 'deck-3', 'deck-2']);
});

test('the deck cannot be viewed once recall begins, and results only exist after submitting', () => {
  let now = 0;
  const s = createArenaSession({ n: 10, clock: () => now });
  assert.throws(() => s.view(), /not started/);
  s.start();
  assert.equal(s.view().length, 1);
  now = 5000;
  s.beginRecall();
  assert.throws(() => s.view(), /recall/);
  assert.throws(() => s.prev());
  assert.equal(s.result, null);
  assert.equal(s.phase, 'recall');
});

test('letting the timer run and submitting nothing scores zero and earns nothing', () => {
  let now = 0;
  const s = createArenaSession({ n: 52, clock: () => now });
  s.start();
  now = 60000;
  s.beginRecall();
  const res = s.submit([]);
  assert.equal(res.correct, 0);
  assert.deepEqual(earnedMilestones(res), []);
});

test('duplicates in a submission are rejected; hints mark the attempt assisted', () => {
  const s = createArenaSession({ n: 5, clock: () => 0, perView: 3 });
  s.start();
  assert.equal(s.view().length, 3);
  s.useHint();
  s.next();
  assert.equal(s.view().length, 2);
  s.beginRecall();
  assert.throws(() => s.submit(['AS', 'AS', null, null, null]), /twice/);
  const res = s.submit(['AS', null, null, null, null]);
  assert.equal(res.assisted, true);
  assert.throws(() => s.submit([]), /already/);
});

// ── recognition drills and scheduling ────────────────────────────
test('a correct fast answer lengthens the interval; a wrong one resets it to ten minutes', () => {
  const now = 1e12;
  let s = recordAttempt(emptyStat(), { correct: true, ms: 1200, now });
  assert.equal(s.ivl, 1);
  s = recordAttempt(s, { correct: true, ms: 1200, now });
  assert.ok(s.ivl > 2.3);
  assert.ok(!isDue(s, now));
  const slow = recordAttempt(recordAttempt(emptyStat(), { correct: true, ms: 1000, now }), { correct: true, ms: 5000, now });
  assert.ok(slow.ivl < s.ivl);
  const bad = recordAttempt(s, { correct: false, ms: 900, now, confusedWith: '6D' });
  assert.equal(bad.ivl, 0);
  assert.equal(bad.due, now + 600000);
  assert.equal(bad.conf['6D'], 1);
  assert.ok(isDue(bad, now + 600001));
});

test('levels move from new to automatic only with accuracy and speed', () => {
  assert.equal(level(undefined), 'new');
  let s = emptyStat();
  for (let i = 0; i < 6; i++) s = recordAttempt(s, { correct: true, ms: 1000 });
  assert.equal(level(s), 'automatic');
  let slow = emptyStat();
  for (let i = 0; i < 6; i++) slow = recordAttempt(slow, { correct: true, ms: 4000 });
  assert.equal(level(slow), 'solid');
  let weak = emptyStat();
  for (let i = 0; i < 6; i++) weak = recordAttempt(weak, { correct: i % 2 === 0, ms: 1000 });
  assert.equal(level(weak), 'shaky');
  assert.ok(mastery(s) > mastery(slow) && mastery(slow) > mastery(weak));
});

test('drill scoring reports accuracy, median time of correct answers, and missed cards', () => {
  const r = scoreDrill([
    { id: 'AS', correct: true, ms: 1000 }, { id: 'KS', correct: true, ms: 3000 },
    { id: 'QS', correct: false, ms: 9000 }, { id: 'JS', correct: true, ms: 2000 },
  ]);
  assert.equal(r.total, 4);
  assert.equal(r.correct, 3);
  assert.equal(r.accuracy, 0.75);
  assert.equal(r.medianMs, 2000);
  assert.deepEqual(r.missed, ['QS']);
  assert.equal(r.slowest[0], 'KS');
});

test('weak cards are chosen more often than strong ones', () => {
  let strong = emptyStat();
  for (let i = 0; i < 8; i++) strong = recordAttempt(strong, { correct: true, ms: 900 });
  let weak = emptyStat();
  for (let i = 0; i < 8; i++) weak = recordAttempt(weak, { correct: false, ms: 900 });
  const stats = { A: strong, B: weak };
  let b = 0;
  for (let i = 0; i < 2000; i++) if (pickNext(['A', 'B'], stats) === 'B') b++;
  assert.ok(b > 1500);
  assert.equal(pickNext(['A', 'B'], stats, Math.random, 'B'), 'A');
});

// ── PAO ──────────────────────────────────────────────────────────
test('example systems are complete and unambiguous', () => {
  for (const id of DECK) {
    assert.ok(EXAMPLE_IMAGES[id].image, id);
    assert.ok(EXAMPLE_PAO[id].p && EXAMPLE_PAO[id].a && EXAMPLE_PAO[id].o, id);
  }
  assert.equal(new Set(DECK.map((id) => EXAMPLE_IMAGES[id].image.toLowerCase())).size, 52);
  assert.equal(EXAMPLE_PEGS.length, 100);
  assert.equal(new Set(EXAMPLE_PEGS).size, 100);
  assert.deepEqual(findConflicts(effectivePao({})), []);
});

test('card 1 gives the person, card 2 the action, card 3 the object', () => {
  const sys = effectivePao({});
  const scene = encodeTriple(['KH', '7S', 'AC'], sys);
  assert.equal(scene.person, 'Superman');
  assert.equal(scene.action, 'stirring');
  assert.equal(scene.object, 'a golf ball');
  assert.equal(scene.text, 'Superman is stirring a golf ball');
  assert.notEqual(encodeTriple(['AC', 'KH', '7S'], sys).text, scene.text);
});

test('every triple decodes back to its three cards, in order', () => {
  const sys = effectivePao({});
  for (let i = 0; i < 300; i++) {
    const cards = newDeck(3);
    assert.deepEqual(decodeScene(encodeTriple(cards, sys), sys), cards);
  }
});

test('a full deck is 17 scenes plus one card, and round-trips', () => {
  const sys = effectivePao({});
  for (let i = 0; i < 20; i++) {
    const deck = newDeck();
    const scenes = encodeDeck(deck, sys);
    assert.equal(scenes.length, 18);
    assert.equal(scenes[17].cards.length, 1);
    assert.equal(scenes[17].action, null);
    assert.deepEqual(decodeDeck(scenes, sys), deck);
  }
});

test('saved PAO entries override examples per field, and duplicates are caught', () => {
  const sys = effectivePao({ KH: { p: 'My brother', a: '', o: '' }, QH: { p: '', a: 'stirring', o: '' } });
  assert.equal(sys.KH.p, 'My brother');
  assert.equal(sys.KH.a, 'flying off with');
  assert.deepEqual(sys.KH.own, { p: true, a: false, o: false });
  const conflicts = findConflicts(sys);
  assert.ok(conflicts.some((c) => c.type === 'duplicate' && c.field === 'a' && c.cards.includes('QH') && c.cards.includes('7S')));
  // An ambiguous action cannot be decoded.
  assert.deepEqual(decodeScene(encodeTriple(['AS', '7S', '2S'], sys), sys), ['AS', null, '2S']);
  assert.equal(paoCompletion({ KH: { p: 'x', a: 'y', o: '' } }).filled, 2);
});

// ── persistence ──────────────────────────────────────────────────
test('state survives a reload', () => {
  const storage = memoryStorage();
  const a = createStore(storage);
  a.update((s) => {
    s.cardImages.AS = { image: 'Suit', cue: 'pinstripe' };
    s.pao.KH = { p: 'Superman', a: '', o: '' };
    s.palaces.push({ id: 'p1', name: 'Home', areas: [{ id: 'a1', name: 'Hall', loci: [{ id: 'l1', name: 'Door', note: '', img: '' }] }] });
  });
  a.log({ kind: 'seq', total: 5, correct: 5 });
  const b = createStore(storage);
  assert.deepEqual(b.state.cardImages.AS, { image: 'Suit', cue: 'pinstripe' });
  assert.equal(b.state.palaces[0].areas[0].loci[0].name, 'Door');
  assert.equal(b.state.history.length, 1);
  assert.equal(b.state.version, VERSION);
});

test('export then import restores everything; a bad import changes nothing', () => {
  const a = createStore(memoryStorage());
  a.update((s) => { s.cardImages['7C'] = { image: 'Cake', cue: '' }; s.pegs['42'] = 'rain'; });
  const file = a.exportJSON();
  const b = createStore(memoryStorage());
  b.importJSON(file);
  assert.deepEqual(b.state.cardImages, a.state.cardImages);
  assert.equal(b.state.pegs['42'], 'rain');
  b.update((s) => { s.pegs['01'] = 'seed'; });
  assert.throws(() => b.importJSON('{"version": 999}'));
  assert.throws(() => b.importJSON('not json'));
  assert.throws(() => b.importJSON('[1,2]'));
  assert.equal(b.state.pegs['01'], 'seed');
});

test('migration fills missing sections and drops malformed or unknown entries', () => {
  const s = migrate({
    cardImages: { AS: { image: 'Suit' }, ZZ: { image: 'nope' }, KH: 'string', QH: { image: '' } },
    pao: { KH: { p: 'A' }, XX: { p: 'B' } },
    pegs: { '07': 'Bond', seven: 'x' },
    stats: { 'img:AS': { n: 3, c: 2 }, 'evil:AS': { n: 1 } },
    history: [{ t: 1, kind: 'seq' }, { kind: 'no-time' }, 'junk'],
    palaces: [{ name: 'Home', areas: [{ loci: [{ name: 'Door', img: 'javascript:alert(1)' }] }] }],
  });
  assert.deepEqual(Object.keys(s.cardImages), ['AS']);
  assert.deepEqual(Object.keys(s.pao), ['KH']);
  assert.deepEqual(s.pao.KH, { p: 'A', a: '', o: '' });
  assert.deepEqual(s.pegs, { '07': 'Bond' });
  assert.deepEqual(Object.keys(s.stats), ['img:AS']);
  assert.deepEqual(s.stats['img:AS'].rts, []);
  assert.equal(s.history.length, 1);
  assert.equal(s.palaces[0].areas[0].loci[0].img, '');
  assert.deepEqual(s.settings, defaults().settings);
  assert.equal(s.version, VERSION);
});

test('unreadable stored data is set aside, not destroyed', () => {
  const storage = memoryStorage({ [KEY]: '{broken' });
  const st = createStore(storage);
  assert.ok(st.loadError);
  assert.equal(storage.getItem(`${KEY}-unreadable`), '{broken');
  assert.deepEqual(st.state.cardImages, {});
});

test('suggestions never overwrite a saved image', () => {
  const st = createStore(memoryStorage());
  assert.equal(effectiveImage(st.state, '7C').own, false);
  assert.equal(effectiveImage(st.state, '7C').image, 'Cake');
  st.update((s) => { s.cardImages['7C'] = { image: 'Cookie', cue: '' }; });
  assert.deepEqual(effectiveImage(createStore(memoryStorage({ [KEY]: st.exportJSON() })).state, '7C'), { image: 'Cookie', cue: '', own: true });
});

// ── lesson progression ───────────────────────────────────────────
test('the course is well formed', () => {
  assert.equal(new Set(LESSONS.map((l) => l.id)).size, LESSONS.length);
  for (const l of LESSONS) {
    assert.ok(STAGES.some((s) => s.id === l.stage), l.id);
    for (const k of ['objective', 'body', 'demo', 'worked']) assert.ok(l.title && l[k] && l[k].length > 20, `${l.id}.${k}`);
    assert.ok(l.exercise?.type, l.id);
    assert.ok(l.recap.length >= 2, l.id);
  }
  for (const s of STAGES) assert.ok(lessonsIn(s.id).length >= 2, s.id);
});

test('lessons complete at their pass mark and stay complete', () => {
  const s = defaults();
  assert.equal(nextLesson(s).id, LESSONS[0].id);
  assert.equal(recordLesson(s, 'vivid-images', 0.5), false);
  assert.ok(!isDone(s, 'vivid-images'));
  assert.equal(recordLesson(s, 'vivid-images', 0.9, 123), true);
  assert.equal(s.lessons['vivid-images'].done, 123);
  recordLesson(s, 'vivid-images', 0.1, 456);
  assert.equal(s.lessons['vivid-images'].done, 123);
  assert.equal(s.lessons['vivid-images'].best, 0.9);
  assert.equal(s.lessons['vivid-images'].tries, 3);
  assert.equal(nextLesson(s).id, LESSONS[0].id);
  assert.ok(skipped(s, 'link-stories').some((l) => l.id === 'why-techniques'));
});

test('finishing every lesson finishes the course', () => {
  const s = defaults();
  for (const l of LESSONS) recordLesson(s, l.id, 1);
  assert.equal(nextLesson(s), null);
  assert.equal(overallProgress(s).fraction, 1);
});

// ── adaptive selection ───────────────────────────────────────────
const practised = (state, id, results, prefix = 'img') => {
  let st = state.stats[`${prefix}:${id}`] || emptyStat();
  for (const r of results) st = recordAttempt(st, { now: Date.now() - 1000, ...r });
  state.stats[`${prefix}:${id}`] = st;
};

test('a new learner is sent to the first lesson', () => {
  const recs = recommend(defaults());
  assert.equal(recs[0].id, `lesson-${LESSONS[0].id}`);
  const plan = dailyPlan(defaults());
  assert.ok(plan.items.length >= 1 && plan.minutes <= 20);
});

test('two cards confused repeatedly come first', () => {
  const s = defaults();
  practised(s, '6H', [{ correct: false, ms: 1000, confusedWith: '6D' }, { correct: false, ms: 1000, confusedWith: '6D' }]);
  const top = recommend(s)[0];
  assert.match(top.id, /^confuse-/);
  assert.match(top.href, /6H/);
  assert.match(top.href, /6D/);
});

test('accurate but slow recognition leads to speed work; inaccurate leads to slow accurate work', () => {
  const slow = defaults();
  for (const id of DECK) practised(slow, id, Array(6).fill({ correct: true, ms: 4000 }));
  const a = recommend(slow, Date.now()).map((r) => r.id);
  assert.ok(a.includes('rapid'));
  assert.ok(!a.includes('accuracy'));

  const sloppy = defaults();
  for (const id of DECK) practised(sloppy, id, [{ correct: true, ms: 900 }, { correct: false, ms: 900 }, { correct: false, ms: 900 }, { correct: true, ms: 900 }]);
  const b = recommend(sloppy).map((r) => r.id);
  assert.ok(b.includes('accuracy'));
  assert.ok(!b.includes('rapid'));
});

test('fast but inaccurate sequences are told to slow down', () => {
  const s = defaults();
  s.history.push({ t: 1, kind: 'seq', total: 10, correct: 6, encodeMs: 20000 }, { t: 2, kind: 'seq', total: 10, correct: 7, encodeMs: 22000 });
  assert.ok(recommend(s).some((r) => r.id === 'slow-seq'));
});

test('short sequences mastered but longer failing points at the palace', () => {
  const s = defaults();
  const ok = (n) => ({ t: 1, kind: 'seq', total: n, correct: n, encodeMs: n * 8000, assisted: false });
  s.history.push(ok(3), ok(3), ok(5), ok(5));
  for (let i = 0; i < 3; i++) s.history.push({ t: 2, kind: 'seq', total: 10, correct: 6, encodeMs: 90000, assisted: false });
  assert.equal(seqProgress(s).next, 10);
  assert.ok(recommend(s).some((r) => r.id === 'palace-fluency'));
});

test('assisted attempts never clear a rung of the ladder', () => {
  const s = defaults();
  s.history.push({ t: 1, kind: 'seq', total: 3, correct: 3, encodeMs: 9000, assisted: true }, { t: 2, kind: 'seq', total: 3, correct: 3, encodeMs: 9000, assisted: true });
  assert.equal(seqProgress(s).next, 3);
  s.history.push({ t: 3, kind: 'seq', total: 3, correct: 3, encodeMs: 9000 }, { t: 4, kind: 'seq', total: 3, correct: 3, encodeMs: 9000 });
  assert.equal(seqProgress(s).next, 5);
});

test('deck summary and milestones use only perfect unassisted decks', () => {
  const s = defaults();
  const fast = { t: 1, kind: 'seq', total: 52, correct: 49, encodeMs: 100000, assisted: false };
  s.history.push(fast);
  assert.deepEqual(awardMilestones(s, fast), []);
  assert.equal(deckSummary(s).bestMs, null);
  const good = { t: 2, kind: 'seq', total: 52, correct: 52, encodeMs: 400000, assisted: false };
  s.history.push(good);
  assert.deepEqual(awardMilestones(s, good, 99), ['deck-perfect', 'deck-15', 'deck-10']);
  assert.deepEqual(awardMilestones(s, good), []);
  assert.equal(deckSummary(s).bestMs, 400000);
  assert.ok(goals(s).find((g) => g.id === 'deck-10').done);
  assert.ok(!goals(s).find((g) => g.id === 'deck-5').done);
});

test('the 20-digit goals need a perfect unassisted recall within the time', () => {
  const s = defaults();
  s.history.push({ t: 1, kind: 'digits', total: 20, correct: 19, encodeMs: 20000 }, { t: 2, kind: 'digits', total: 20, correct: 20, encodeMs: 20000, assisted: true });
  assert.ok(!goals(s).find((g) => g.id === 'digits-120').done);
  s.history.push({ t: 3, kind: 'digits', total: 20, correct: 20, encodeMs: 45000 });
  const g = Object.fromEntries(goals(s).map((x) => [x.id, x.done]));
  assert.deepEqual([g['digits-120'], g['digits-60'], g['digits-30'], g['digits-5']], [true, true, false, false]);
});

test('card summary counts mastery levels and due reviews', () => {
  const s = defaults();
  practised(s, 'AS', Array(6).fill({ correct: true, ms: 900 }));
  practised(s, 'KS', [{ correct: false, ms: 900 }]);
  const sum = cardSummary(s, 'img', Date.now() + 3600000);
  assert.equal(sum.levels.automatic, 1);
  assert.equal(sum.levels.new, 50);
  assert.deepEqual(sum.due, ['KS']);
});

// ── idea finder ──────────────────────────────────────────────────
test('the Major encoder reads common spellings by sound', () => {
  const cases = { knife: '28', comb: '73', chalk: '67', cage: '76', giant: '621', tiger: '174', bomb: '93', phone: '82', ship: '69', duck: '17', mummy: '33', box: '970', castle: '705', lion: '52' };
  for (const [w, code] of Object.entries(cases)) assert.equal(majorCode(w), code, w);
});

test('every example peg spells its own number', () => {
  EXAMPLE_PEGS.forEach((w, i) => assert.equal(majorCode(w), String(i).padStart(2, '0'), w));
});

test('Major word suggestions all match the digits asked for', () => {
  for (const d of ['7', '42', '91', '741']) {
    const ws = majorWords(d);
    assert.ok(ws.length > 0, d);
  }
  assert.ok(majorWords('42').includes('rain'));
});

test('the idea finder recognises numbers, days, months, letters, cards and words', () => {
  const st = defaults();
  assert.equal(findIdeas('47', st).kind, 'number');
  assert.equal(findIdeas('47', st).peg, '47');
  assert.equal(findIdeas('tue', st).label, 'Tuesday');
  assert.equal(findIdeas('Sept', st).label, 'September');
  assert.equal(findIdeas('q', st).kind, 'letter');
  assert.equal(findIdeas('7 of hearts', st).kind, 'card');
  assert.equal(findIdeas('justice', st).kind, 'word');
  assert.equal(findIdeas('   ', st), null);
  const long = findIdeas('314159', st);
  assert.match(long.groups.find((x) => x.title === 'In pairs').items[0], /31 → mat · 41 → rat · 59 → lip/);
});

test('the idea finder prefers the learner\'s own number image', () => {
  const st = defaults();
  st.pegs['47'] = 'rocket';
  const r = findIdeas('47', st);
  assert.equal(r.groups[0].title, 'Your image');
  assert.deepEqual(r.groups[0].items, ['rocket']);
  assert.match(findIdeas('Tuesday', st).groups.at(-1).items[0], /^the example image for 02/);
});
