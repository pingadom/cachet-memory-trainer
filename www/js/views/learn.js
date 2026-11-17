// Learn (the course) and Train (the same exercises, on demand, with options).

import { DECK, SUITS, SUIT_NAME, SUIT_SYM, cardName, newDeck } from '../core/cards.js';
import { LESSONS, STAGES, lessonById, lessonsIn, isDone, nextLesson, followingLesson, skipped, recordLesson, stageProgress } from '../core/curriculum.js';
import { MAJOR, EXAMPLE_IMAGES, effectivePeg, effectiveImage, savedImageCount } from '../core/systems.js';
import { effectivePao, encodeTriple } from '../core/pao.js';
import { recommend, cardSummary, seqProgress, SEQ_LADDER } from '../core/adapt.js';
import { allLoci } from '../core/store.js';
import * as ex from '../ui/exercises.js';
import { arena } from '../ui/arena.js';
import { esc, $, $$, cardHTML, cardInline, pickerHTML, pct, progressBar } from '../ui/dom.js';

// ── course index ─────────────────────────────────────────────────
export function learn(main, route, ctx) {
  if (route.parts[1]) return lessonPage(main, route.parts[1], ctx);
  const state = ctx.store.state;
  const next = nextLesson(state);
  main.innerHTML = `
    <header class="page-head"><h1 tabindex="-1">Learn</h1>
      <p class="lede">Ten stages, from how memory works to a full deck against the clock. Each lesson explains one idea, shows it, and then makes you use it. Lessons are in a recommended order, and none is locked.</p></header>
    ${stageProgress(state).map((s) => `
      <section class="panel stage ${s.complete ? 'complete' : ''}">
        <div class="stage-h"><span class="stage-n mono">${s.n}</span><div><h2>${esc(s.title)}</h2><p class="small">${esc(s.blurb)}</p></div><span class="small mono">${s.done}/${s.total}</span></div>
        <ol class="lessons">${lessonsIn(s.id).map((l) => {
          const rec = state.lessons[l.id];
          return `<li class="${isDone(state, l.id) ? 'done' : ''} ${next && next.id === l.id ? 'next' : ''}"><a href="#/learn/${l.id}">
            <span class="lmark" aria-hidden="true">${isDone(state, l.id) ? '✓' : ''}</span><span class="ltitle">${esc(l.title)}</span>
            <span class="small">${next && next.id === l.id ? '<span class="tag">next</span> ' : ''}${rec?.tries && !rec.done ? `best ${pct(rec.best)} · ` : ''}${l.minutes} min</span></a></li>`;
        }).join('')}</ol>
      </section>`).join('')}`;
}

// ── interactive pieces embedded in lesson text ───────────────────
const WIDGETS = {
  majorTable(el) {
    el.innerHTML = `<div class="cmp-wrap"><table class="cmp major"><thead><tr><th>Digit</th><th>Sounds</th><th>How to remember it</th></tr></thead><tbody>${MAJOR.map((m) => `<tr><td class="mono big">${m.d}</td><td><b>${m.sounds}</b></td><td class="small">${m.hint}</td></tr>`).join('')}</tbody></table></div>`;
  },
  majorDemo(el, ctx) {
    el.innerHTML = `<div class="widget"><label>Type any number <input class="answer mono" type="text" inputmode="numeric" value="314159265358" maxlength="24" aria-label="A number"></label><div data-out></div><p class="small">Each pair becomes its sounds, then an image from the number list (yours where you have saved one).</p></div>`;
    const input = $('input', el);
    const paint = () => {
      const groups = input.value.replace(/\D/g, '').match(/.{1,2}/g) || [];
      $('[data-out]', el).innerHTML = `<div class="digits mono">${groups.map((g) => `<span><b>${g}</b><i>${g.split('').map((d) => MAJOR[d].sounds.split(',')[0]).join('–')}</i><i>${g.length === 2 ? esc(effectivePeg(ctx.store.state, g).image) : '…'}</i></span>`).join('')}</div>`;
    };
    input.oninput = paint;
    paint();
  },
  cardCode(el, ctx) {
    el.innerHTML = `<div class="widget"><p class="small">Pick any card to see how its example image is derived.</p>${pickerHTML(new Set(), 'Pick a card')}<div data-out class="code-out"></div></div>`;
    $('.picker-help', el)?.remove();
    const show = (id) => {
      const e = EXAMPLE_IMAGES[id];
      const own = effectiveImage(ctx.store.state, id);
      $('[data-out]', el).innerHTML = `${cardHTML(id)}<div><b class="assoc-sm">${esc(e.image)}</b><p class="small">${esc(e.cue)}</p>${own.own ? `<p class="small">Your saved image for this card: <b>${esc(own.image)}</b></p>` : ''}</div>`;
    };
    $$('[data-pick]', el).forEach((b) => { b.onclick = () => show(b.dataset.pick); });
    show('7C');
  },
  paoDemo(el, ctx) {
    let cards = ['KH', '7S', 'AC'];
    let slot = 0;
    const paint = () => {
      const sys = effectivePao(ctx.store.state.pao);
      const scene = encodeTriple(cards, sys);
      const part = ['p', 'a', 'o'];
      const name = ['Person', 'Action', 'Object'];
      el.innerHTML = `<div class="widget pao-demo">
        <div class="pao-grid">${cards.map((c, j) => `<button class="pao-col ${j === slot ? 'active' : ''}" data-slot="${j}" aria-label="Change card ${j + 1}">
          ${cardHTML(c)}<span class="small">Card ${j + 1} gives the <b>${name[j].toLowerCase()}</b></span>
          <span class="pao-rows">${part.map((f, k) => `<span class="${k === j ? 'used' : 'unused'}">${esc(sys[c][f])}</span>`).join('')}</span></button>`).join('')}</div>
        <p class="scene-line">${esc(scene.text)}.</p>
        <p class="small">Decoding: <b>${esc(scene.person)}</b> is the person of ${cardInline(cards[0])}; <b>${esc(scene.action)}</b> is the action of ${cardInline(cards[1])}; <b>${esc(scene.object)}</b> is the object of ${cardInline(cards[2])}.</p>
        <div class="row"><button class="btn" data-deal>Deal three new cards</button><button class="btn quiet" data-rot>Same cards, different order</button></div>
        <details><summary class="small">Choose the highlighted card yourself</summary>${pickerHTML(new Set(cards))}</details></div>`;
      $('.picker-help', el)?.remove();
      $('[data-deal]', el).onclick = () => { cards = newDeck(3); paint(); };
      $('[data-rot]', el).onclick = () => { cards = [cards[2], cards[0], cards[1]]; paint(); };
      $$('[data-slot]', el).forEach((b) => { b.onclick = () => { slot = Number(b.dataset.slot); paint(); $('details', el).open = true; }; });
      $$('[data-pick]', el).forEach((b) => { b.onclick = () => { cards[slot] = b.dataset.pick; paint(); $('details', el).open = true; }; });
    };
    paint();
  },
};

const TASKS = {
  palace10: (s) => ({ ok: s.palaces.some((p) => allLoci(p).length >= 10), status: `Largest palace: ${Math.max(0, ...s.palaces.map((p) => allLoci(p).length))} locations` }),
  images13: (s) => ({ ok: savedImageCount(s) >= 13, status: `${savedImageCount(s)} of 52 images saved` }),
  deckAttempt: (s) => ({ ok: s.history.some((h) => h.kind === 'seq' && h.total === 52), status: `${s.history.filter((h) => h.kind === 'seq' && h.total === 52).length} full-deck attempts` }),
  deckPerfect: (s) => ({ ok: !!s.milestones['deck-perfect'], status: s.milestones['deck-perfect'] ? 'First perfect deck recorded' : 'No perfect deck yet' }),
};

/** Mount an exercise described by a spec ({ type, ...options }). Used by lessons and by Train. */
export function mountExercise(el, spec, ctx, onDone) {
  const opts = { ...spec, onDone };
  switch (spec.type) {
    case 'words': return ex.words(el, opts, ctx);
    case 'compare': return ex.compare(el, opts, ctx);
    case 'pairs': return ex.pairs(el, opts, ctx);
    case 'imagine': return ex.imagine(el, opts, ctx);
    case 'quiz': return ex.quiz(el, opts, ctx);
    case 'typed': return ex.typed(el, opts, ctx);
    case 'digits': return ex.digits(el, opts, ctx);
    case 'walk': return ex.walk(el, opts, ctx);
    case 'drill': return ex.drill(el, opts, ctx);
    case 'pao': return ex.pao(el, opts, ctx);
    case 'flash': return ex.flash(el, opts, ctx);
    case 'seq': return arena(el, { n: spec.n, allowHints: !!spec.hints, timed: !!spec.timed, onDone }, ctx);
    case 'task': {
      const t = TASKS[spec.check](ctx.store.state);
      el.innerHTML = `<div class="ex task ${t.ok ? 'done' : ''}"><h3>${t.ok ? '✓ ' : ''}${esc(spec.label)}</h3><p class="small">${esc(t.status)}</p>
        <div class="row"><a class="btn ${t.ok ? '' : 'primary'}" href="${spec.href}">${esc(spec.cta)}</a></div></div>`;
      if (t.ok) onDone?.({ score: 1, correct: 1, total: 1, feedback: ['Done. This lesson is complete.'], auto: true });
      return undefined;
    }
    default: el.textContent = 'Unknown exercise.'; return undefined;
  }
}

function lessonPage(main, id, ctx) {
  const lesson = lessonById(id);
  if (!lesson) { main.innerHTML = '<h1 tabindex="-1">Lesson not found</h1><p><a href="#/learn">Back to the course</a></p>'; return; }
  const state = ctx.store.state;
  const stage = STAGES.find((s) => s.id === lesson.stage);
  const idx = lessonsIn(stage.id).findIndex((l) => l.id === id);
  const missing = skipped(state, id);
  const following = followingLesson(id);
  const passMark = lesson.pass ?? 0.8;

  main.innerHTML = `
    <article class="lesson">
      <p class="crumbs small"><a href="#/learn">Learn</a> › Stage ${stage.n} · ${esc(stage.title)} › Lesson ${idx + 1} of ${lessonsIn(stage.id).length}</p>
      <h1 tabindex="-1">${esc(lesson.title)}</h1>
      <p class="objective"><b>Objective</b> ${esc(lesson.objective)} <span class="small mono">· ${lesson.minutes} min</span>${isDone(state, id) ? ' <span class="tag ok">completed</span>' : ''}</p>
      ${missing.length ? `<p class="claim coach"><b>Note</b>This lesson builds on ${missing.length === 1 ? 'one you have not finished' : `${missing.length} you have not finished`}: ${missing.slice(-3).map((l) => `<a href="#/learn/${l.id}">${esc(l.title)}</a>`).join(', ')}. You can carry on regardless.</p>` : ''}
      <div class="prose">${lesson.body}</div>
      <section class="lsec"><h2>Demonstration</h2><div class="prose">${lesson.demo}</div></section>
      <section class="lsec"><h2>Worked example</h2><div class="prose">${lesson.worked}</div></section>
      <section class="lsec"><h2>Exercise</h2>${passMark > 0 && lesson.exercise.type !== 'task' ? `<p class="small">Pass mark: ${pct(passMark)}. You can repeat it as often as you like.</p>` : ''}<div data-ex></div><div data-outcome></div></section>
      <section class="lsec recap"><h2>Recap</h2><ul>${lesson.recap.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></section>
      <nav class="lesson-nav" data-lesson-nav></nav>
    </article>`;

  $$('[data-widget]', main).forEach((w) => WIDGETS[w.dataset.widget]?.(w, ctx));

  const nextHTML = () => {
    const rec = recommend(ctx.store.state).find((r) => !r.id.startsWith('lesson-'));
    return `${following ? `<a class="btn ${isDone(ctx.store.state, id) ? 'primary' : ''}" href="#/learn/${following.id}">Next lesson: ${esc(following.title)} →</a>` : '<a class="btn primary" href="#/speed">To the Speed Cards arena →</a>'}
      ${rec ? `<a class="btn quiet" href="${rec.href}">Or practise: ${esc(rec.title)}</a>` : ''}`;
  };
  $('[data-lesson-nav]', main).innerHTML = nextHTML();

  mountExercise($('[data-ex]', main), lesson.exercise, ctx, (res) => {
    const was = isDone(ctx.store.state, id);
    const passed = recordLesson(ctx.store.state, id, res.score);
    if (passed && !was) ctx.store.log({ kind: 'lesson', id, title: lesson.title }); else ctx.store.save();
    if (res.auto && was) return;
    const out = $('[data-outcome]', main);
    out.innerHTML = passed
      ? `<div class="outcome pass"><b>${was ? 'Lesson already complete' : 'Lesson complete'}</b>${passMark > 0 && res.total > 1 ? ` · ${pct(res.score)}` : ''}<p class="small">${res.score === 1 ? 'Clean result.' : 'Passed.'} ${following ? `Next: <a href="#/learn/${following.id}">${esc(following.title)}</a>.` : ''}</p></div>`
      : `<div class="outcome retry"><b>${pct(res.score)}</b> · the pass mark is ${pct(passMark)}<p class="small">Read the notes on your result above, look again at the worked example, and repeat the exercise with a new set. Falling short on a first attempt is normal: it shows the exercise was hard enough to be worth doing.</p></div>`;
    $('[data-lesson-nav]', main).innerHTML = nextHTML();
    ctx.refreshNav?.();
  });
}

// ── Train ────────────────────────────────────────────────────────
const MODES = {
  words: { group: 'Foundations', title: 'Words in order', blurb: 'Memorise a list and type it back. Link method or palace.', spec: (q) => ({ type: 'words', n: num(q.n, 10), reverse: q.reverse === '1', method: q.palace === '1' ? 'loci' : 'free', palace: q.palace === '1' ? 'own' : null }), opts: [['n', 'Length', [5, 10, 20, 30]], ['reverse', 'Recall', [['0', 'Forwards'], ['1', 'Reversed']]], ['palace', 'Show my palace', [['0', 'No'], ['1', 'Yes']]]] },
  pairs: { group: 'Foundations', title: 'Paired associations', blurb: 'Two images, one scene, tested in both directions.', spec: (q) => ({ type: 'pairs', n: num(q.n, 6) }), opts: [['n', 'Pairs', [6, 10, 15]]] },
  digits: { group: 'Numbers', title: 'Digits', blurb: 'A random number, memorised and typed back exactly. The 20-digit goals are measured here.', spec: (q) => ({ type: 'digits', n: num(q.n, 20) }), opts: [['n', 'Digits', [10, 20, 40, 80]]] },
  pegs: { group: 'Numbers', title: 'Number images', blurb: 'See a pair of digits, recall its image. Ten at a time or all hundred.', spec: (q) => ({ type: 'drill', kind: 'peg', mode: q.mode === 'rapid' ? 'rapid' : 'c2i', pool: q.range && q.range !== 'all' ? `range:${q.range}` : 'all', count: 20 }), opts: [['range', 'Range', [['all', 'All'], ...Array.from({ length: 10 }, (_, i) => [`${i * 10}-${i * 10 + 9}`, `${i}0s`])]], ['mode', 'Mode', [['c2i', 'Untimed'], ['rapid', 'Rapid']]]] },
  walk: { group: 'Palace', title: 'Palace walk', blurb: 'Recall your locations by number, forwards then backwards.', spec: (q) => ({ type: 'walk', palaceId: q.palace }) },
  c2i: { group: 'Cards', title: 'Card → image', blurb: 'See a card, retrieve its image, reveal, mark yourself. Untimed learning mode.', spec: (q) => ({ type: 'drill', mode: 'c2i', field: fld(q), pool: q.pool || 'all', count: num(q.count, 20) }), opts: [['count', 'Cards', [13, 20, 52]]] },
  i2c: { group: 'Cards', title: 'Image → card', blurb: 'See an image, pick its card from the full deck. Trains decoding and records confusions.', spec: (q) => ({ type: 'drill', mode: 'i2c', field: fld(q), pool: q.pool || 'all', count: num(q.count, 20) }), opts: [['count', 'Cards', [13, 20, 52]]] },
  rapid: { group: 'Cards', title: 'Rapid recognition', blurb: 'Cards flash one at a time. Press the moment the image arrives. Measures response time.', spec: (q) => ({ type: 'drill', mode: 'rapid', field: fld(q), pool: q.pool || 'all', count: num(q.count, 26) }), opts: [['count', 'Cards', [26, 52]]] },
  weak: { group: 'Cards', title: 'Weak cards', blurb: 'Draws the cards you answer slowly or wrongly, in proportion to how weak they are.', spec: (q) => ({ type: 'drill', mode: 'c2i', field: fld(q), pool: 'weak', count: 20 }) },
  due: { group: 'Cards', title: 'Due reviews', blurb: 'The cards whose spaced-repetition interval has run out today.', spec: (q) => ({ type: 'drill', mode: 'c2i', field: fld(q), pool: 'due', count: 20 }) },
  suit: { group: 'Cards', title: 'Suit and rank training', blurb: 'One suit, the court cards, or the numbers only.', spec: (q) => ({ type: 'drill', mode: q.mode || 'c2i', field: fld(q), pool: q.set && q.set.length > 1 ? `ranks:${q.set}` : `suit:${q.set || 'S'}`, count: 20 }), opts: [['set', 'Set', [...SUITS.map((s) => [s, `${SUIT_SYM[s]} ${SUIT_NAME[s]}`]), ['JQK', 'Court cards'], ['A23456789T', 'Number cards']]], ['mode', 'Direction', [['c2i', 'Card → image'], ['i2c', 'Image → card'], ['rapid', 'Rapid']]]] },
  seq: { group: 'Sequences', title: 'Card sequence', blurb: 'Memorise, recall, compare. The ladder runs 3, 5, 10, 15, 26, then the full deck in the arena.', spec: (q) => ({ type: 'seq', n: num(q.n, 5), hints: true, timed: q.timed === '1' }), opts: [['n', 'Cards', [3, 5, 10, 15, 26]]] },
  'pao-p': { group: 'PAO', title: 'People', blurb: 'Card → person.', spec: (q) => ({ type: 'drill', mode: q.mode || 'c2i', field: 'p', pool: q.pool || 'all', count: 20, label: 'PAO people' }), opts: [['mode', 'Mode', [['c2i', 'Untimed'], ['i2c', 'Person → card'], ['rapid', 'Rapid']]]] },
  'pao-a': { group: 'PAO', title: 'Actions', blurb: 'Card → action, without thinking of the person first.', spec: (q) => ({ type: 'drill', mode: q.mode || 'c2i', field: 'a', pool: q.pool || 'all', count: 20, label: 'PAO actions' }), opts: [['mode', 'Mode', [['c2i', 'Untimed'], ['i2c', 'Action → card'], ['rapid', 'Rapid']]]] },
  'pao-o': { group: 'PAO', title: 'Objects', blurb: 'Card → object.', spec: (q) => ({ type: 'drill', mode: q.mode || 'c2i', field: 'o', pool: q.pool || 'all', count: 20, label: 'PAO objects' }), opts: [['mode', 'Mode', [['c2i', 'Untimed'], ['i2c', 'Object → card'], ['rapid', 'Rapid']]]] },
  'pao-encode': { group: 'PAO', title: 'Scene building', blurb: 'Three cards → one scene. Measures scene-generation time; each part is marked separately.', spec: (q) => ({ type: 'pao', dir: 'encode', count: num(q.count, 6) }), opts: [['count', 'Scenes', [6, 10, 17]]] },
  'pao-decode': { group: 'PAO', title: 'Scene decoding', blurb: 'One scene → three cards, in order, picked from the full deck.', spec: (q) => ({ type: 'pao', dir: 'decode', count: num(q.count, 5) }), opts: [['count', 'Scenes', [5, 10]]] },
  flash: { group: 'Speed', title: 'Deck run-through', blurb: 'Every card once, as fast as you can see its image. Cards per second, with no recall.', spec: (q) => ({ type: 'flash', n: num(q.n, 52) }), opts: [['n', 'Cards', [26, 52]]] },
};
const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);
const fld = (q) => (['img', 'p', 'a', 'o'].includes(q.field) ? q.field : 'img');

export function train(main, route, ctx) {
  const mode = route.parts[1];
  if (mode && MODES[mode]) return trainMode(main, mode, route.query, ctx);
  const state = ctx.store.state;
  const recs = recommend(state).slice(0, 3);
  const img = cardSummary(state);
  const seq = seqProgress(state);
  const groups = [...new Set(Object.values(MODES).map((m) => m.group)), 'Speed'];
  const extra = {
    Sequences: `<li><a href="#/speed"><b>Full deck</b><span class="small">All 52 cards in the Speed Cards arena.</span></a></li>`,
    Speed: `<li><a href="#/train/seq?n=10&timed=1"><b>Timed 10 cards</b><span class="small">A full memorise–recall cycle against a target set from your best.</span></a></li>
      <li><a href="#/train/seq?n=26&timed=1"><b>Timed half deck</b><span class="small">26 cards. First target: one minute, perfect.</span></a></li>
      <li><a href="#/train/pao-encode?count=17"><b>17 scenes</b><span class="small">A deck's worth of PAO scene generation, timed.</span></a></li>`,
  };
  const note = { Cards: img.seen ? `${img.mastered}/52 solid or better · ${img.due.length} due · ${img.weak.length} weak` : '', Sequences: `next rung: ${seq.next} cards` };
  main.innerHTML = `
    <header class="page-head"><h1 tabindex="-1">Train</h1><p class="lede">Every exercise in the course, available on demand. Results feed your card records, the spaced-repetition schedule and the recommendations.</p></header>
    <section class="panel"><h2>Recommended now</h2><ul class="recs">${recs.map((r) => `<li><a href="${r.href}"><b>${esc(r.title)}</b><span class="small mono">${r.minutes} min</span><span class="small">${r.why}</span></a></li>`).join('')}</ul></section>
    ${[...new Set(groups)].map((g) => `<section class="panel"><div class="panel-h"><h2>${g}</h2><span class="small">${note[g] || ''}</span></div>
      <ul class="modes">${Object.entries(MODES).filter(([, m]) => m.group === g).map(([k, m]) => `<li><a href="#/train/${k}"><b>${m.title}</b><span class="small">${m.blurb}</span></a></li>`).join('')}${extra[g] || ''}</ul></section>`).join('')}`;
}

function trainMode(main, mode, query, ctx) {
  const m = MODES[mode];
  const spec = m.spec(query);
  const href = (k, v) => `#/train/${mode}?${new URLSearchParams({ ...query, [k]: v })}`;
  const current = (k, values) => query[k] ?? String(Array.isArray(values[0]) ? values[0][0] : spec[k] ?? values[0]);
  const poolNote = query.pool?.startsWith('cards:') ? `<p class="small">Limited to: ${query.pool.slice(6).split(',').filter((c) => DECK.includes(c)).map(cardInline).join(' ')} · <a href="#/train/${mode}">use the whole deck</a></p>` : '';
  main.innerHTML = `
    <header class="page-head"><p class="crumbs small"><a href="#/train">Train</a> › ${m.group}</p><h1 tabindex="-1">${m.title}</h1><p class="lede">${m.blurb}</p></header>
    ${(m.opts || []).length ? `<div class="mode-opts">${m.opts.map(([k, label, values]) => `<div><span class="small">${label}</span><div class="seg">${values.map((v) => { const [val, text] = Array.isArray(v) ? v : [String(v), String(v)]; return `<a href="${href(k, val)}" class="${String(current(k, values)) === String(val) ? 'on' : ''}">${text}</a>`; }).join('')}</div></div>`).join('')}</div>` : ''}
    ${poolNote}<div data-ex></div>`;
  mountExercise($('[data-ex]', main), spec, ctx, () => ctx.refreshNav?.());
}

export { LESSONS, cardName, progressBar };
