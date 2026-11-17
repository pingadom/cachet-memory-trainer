// Dashboard and Progress. Both answer: what am I learning, how good am I at it, what next?

import { cardLabel, cardName } from '../core/cards.js';
import { fmtTime } from '../core/scoring.js';
import { LEVEL_LABEL, recentAccuracy, recentSpeed, mastery, median, level as levelOf } from '../core/srs.js';
import { currentStage, overallProgress, nextLesson, stageProgress, STAGES } from '../core/curriculum.js';
import { cardSummary, deckSummary, dailyPlan, journey, goals, seqProgress, consistency, streak, dayKey, paoCompletion } from '../core/adapt.js';
import { effectiveImage, savedImageCount } from '../core/systems.js';
import { effectivePao, FIELD_NAME } from '../core/pao.js';
import { allLoci } from '../core/store.js';
import { esc, $, $$, cardHTML, cardInline, lineChart, distBar, heatStrip, progressBar, pct, secs, shortDate } from '../ui/dom.js';

export function describe(h) {
  const frac = h.total ? `${h.correct}/${h.total}` : '';
  switch (h.kind) {
    case 'lesson': return { what: `Lesson completed: ${h.title || h.id}`, score: '' };
    case 'words': return { what: `${h.total} words${h.reverse ? ', reversed' : ''}${h.method === 'rote' ? ' (repetition)' : ''}`, score: frac };
    case 'pairs': return { what: `${h.total} paired associations`, score: frac };
    case 'digits': return { what: `${h.total} digits · ${fmtTime(h.encodeMs)}`, score: frac };
    case 'palace': return { what: `Palace walk: ${h.palace || ''}`, score: frac };
    case 'drill': return { what: `${{ c2i: 'Card recognition', i2c: 'Image → card', rapid: 'Rapid recognition', weak: 'Weak cards', due: 'Due reviews' }[h.mode] || 'Drill'}${h.field && h.field !== 'img' ? ` (${h.field === 'peg' ? 'numbers' : FIELD_NAME[h.field].toLowerCase()})` : ''}${h.medianMs ? ` · ${secs(h.medianMs)} median` : ''}`, score: frac };
    case 'seq': return { what: `${h.total === 52 ? 'Full deck' : `${h.total}-card sequence`} · ${fmtTime(h.encodeMs)}${h.assisted ? ' · assisted' : ''}`, score: frac };
    case 'pao': return { what: `PAO scenes (${h.mode})${h.medianMs ? ` · ${secs(h.medianMs)} median` : ''}`, score: frac };
    case 'flash': return { what: `Deck run-through · ${fmtTime(h.ms)}`, score: '' };
    case 'quiz': return { what: 'Lesson check', score: frac };
    case 'imagine': return { what: 'Image-making practice', score: '' };
    default: return { what: h.kind, score: frac };
  }
}

const tile = (label, value, sub = '', href = '') => `<${href ? `a href="${href}"` : 'div'} class="tile"><span class="tile-l">${label}</span><b class="tile-v mono">${value}</b><span class="tile-s">${sub}</span></${href ? 'a' : 'div'}>`;

function journeyHTML(state) {
  const steps = journey(state);
  const current = steps.findIndex((s) => !s.done);
  return `<ol class="journey" aria-label="Journey to the two-minute deck">${steps.map((s, i) => `<li class="${s.done ? 'done' : i === current ? 'current' : ''}"><a href="${s.href}" title="${esc(s.label)}"><span class="node" aria-hidden="true">${s.done ? '✓' : ''}</span><span class="jl">${esc(s.short)}</span></a></li>`).join('')}</ol>`;
}

const byDay = (entries, value) => {
  const m = new Map();
  for (const h of entries) { const k = dayKey(h.t); m.set(k, [...(m.get(k) || []), value(h)]); }
  return [...m].map(([k, v]) => ({ label: shortDate(new Date(k + 'T12:00:00').getTime()), y: median(v) }));
};

function charts(state) {
  const decks = state.history.filter((h) => h.kind === 'seq' && h.total === 52);
  const seqs = state.history.filter((h) => h.kind === 'seq');
  const drills = state.history.filter((h) => h.kind === 'drill' && h.field === 'img' && h.medianMs);
  return {
    deckTime: lineChart(decks.map((h) => ({ label: `${shortDate(h.t)} · ${h.correct}/52`, y: h.encodeMs / 1000, cls: h.correct === 52 && !h.assisted ? 'good' : 'miss' })), { fmt: (v) => fmtTime(v * 1000), goal: 120, goalLabel: '2:00 goal', log: true }),
    accuracy: lineChart(byDay(seqs, (h) => h.correct / h.total), { fmt: pct, min: 0, max: 1 }),
    speed: lineChart(byDay(drills, (h) => h.medianMs / 1000), { fmt: (v) => `${v.toFixed(1)}s`, goal: 1.5, goalLabel: '1.5s' }),
  };
}

export function dashboard(main, route, ctx) {
  const state = ctx.store.state;
  const stage = currentStage(state);
  const prog = overallProgress(state);
  const lesson = nextLesson(state);
  const plan = dailyPlan(state);
  const img = cardSummary(state, 'img');
  const deck = deckSummary(state);
  const paoC = paoCompletion(state.pao);
  const loci = state.palaces.reduce((a, p) => a + allLoci(p).length, 0);
  const ch = charts(state);
  const recent = state.history.slice(-7).reverse();
  const fresh = state.history.length === 0;
  const st = streak(state);

  main.innerHTML = `
    <header class="page-head"><h1 tabindex="-1">Dashboard</h1>
      <p class="lede">${fresh ? 'Cachet teaches memory techniques from the beginning, up to memorising a shuffled deck of cards in under two minutes. Start with the first lesson: it takes seven minutes and includes an experiment on your own memory.' : `Stage ${stage.n} of ${STAGES.length} · ${esc(stage.title)}${st > 1 ? ` · practised ${st} days running` : ''}`}</p></header>

    <section class="panel"><div class="panel-h"><h2>The road to a two-minute deck</h2><a class="small" href="#/progress">All goals</a></div>${journeyHTML(state)}</section>

    <div class="grid2">
      <section class="panel"><div class="panel-h"><h2>Today</h2><span class="small mono">about ${plan.minutes} min</span></div>
        <ol class="plan">${plan.items.map((it) => `<li class="${it.done ? 'done' : ''}"><a href="${it.href}"><span class="plan-t">${it.done ? '<span class="ok">✓</span> ' : ''}${esc(it.title)}</span><span class="small mono">${it.minutes} min</span><span class="plan-w small">${it.why}</span></a></li>`).join('')}</ol>
        <p class="small">Chosen from your results by fixed rules. The reason for each is shown; the rules are in the <a href="#/handbook?q=adaptive">handbook</a>.</p>
      </section>
      <section class="panel"><div class="panel-h"><h2>Course</h2><span class="small mono">${prog.done}/${prog.total} lessons</span></div>
        ${progressBar(prog.fraction, 'Course progress')}
        ${lesson ? `<a class="next-lesson" href="#/learn/${lesson.id}"><span class="small">Next lesson · ${lesson.minutes} min</span><b>${esc(lesson.title)}</b><span class="small">${esc(lesson.objective)}</span></a>` : '<p>Every lesson is complete. What remains is practice: the plan on the left chooses it for you.</p>'}
        <ul class="stages-mini">${stageProgress(state).map((s) => `<li class="${s.complete ? 'done' : s.id === stage.id ? 'current' : ''}" title="${esc(s.title)}: ${s.done}/${s.total}"><span>${s.n}</span></li>`).join('')}</ul>
      </section>
    </div>

    <section class="tiles">
      ${tile('Card associations mastered', `${img.mastered}<span>/52</span>`, img.seen ? `${img.automatic} automatic · ${img.due.length} due` : 'not started', '#/progress')}
      ${tile('Memory palaces', `${state.palaces.length}`, `${loci} location${loci === 1 ? '' : 's'}`, '#/systems/palaces')}
      ${tile('Own card images', `${savedImageCount(state)}<span>/52</span>`, 'saved by you', '#/systems/cards')}
      ${tile('PAO system', pct(paoC.fraction), `${paoC.filled} of 156 entries your own`, '#/systems/pao')}
      ${tile('Best perfect deck', deck.bestMs ? fmtTime(deck.bestMs) : '—', deck.perfect ? `${deck.perfect} perfect deck${deck.perfect === 1 ? '' : 's'}` : 'no perfect deck yet', '#/speed')}
      ${tile('Recent deck accuracy', deck.recentAccuracy == null ? '—' : pct(deck.recentAccuracy), deck.attempts.length ? `last ${Math.min(5, deck.attempts.length)} attempt${deck.attempts.length === 1 ? '' : 's'}` : 'no attempts yet', '#/speed')}
    </section>

    <section class="panel goalbar"><div class="panel-h"><h2>Towards 2:00</h2><span class="small mono">${deck.bestMs ? `${fmtTime(deck.bestMs)} → 2:00` : 'needs a first perfect deck'}</span></div>
      <div class="goal-track">${progressBar(deck.toGoal, 'Progress to the two-minute deck')}<div class="goal-marks mono small"><span>20:00</span><span>10:00</span><span>5:00</span><span>3:00</span><span>2:00</span></div></div></section>

    <div class="grid2">
      <section class="panel"><h2>Full-deck memorisation time</h2>${ch.deckTime}<p class="small">Filled points are perfect, unassisted decks. Hollow points had errors or hints.</p></section>
      <section class="panel"><h2>Recognition speed</h2>${ch.speed}<p class="small">Median time per card in recognition drills, by day.</p></section>
    </div>

    <section class="panel"><div class="panel-h"><h2>Recent activity</h2><a class="small" href="#/progress">History</a></div>
      ${recent.length ? `<ul class="activity">${recent.map((h) => { const d = describe(h); return `<li><span class="small mono">${shortDate(h.t)}</span><span>${esc(d.what)}</span><b class="mono">${d.score}</b></li>`; }).join('')}</ul>` : '<p class="small">Nothing yet. Finished exercises appear here.</p>'}
    </section>`;
}

// ── per-card detail, shared with the editors ─────────────────────
export function cardStatHTML(state, id, field = 'img') {
  const s = state.stats[`${field}:${id}`];
  if (!s || !s.n) return '<p class="small">Not practised yet.</p>';
  const conf = Object.entries(s.conf || {}).sort((a, b) => b[1] - a[1]);
  const due = s.due <= Date.now() ? 'now' : s.due - Date.now() < 86400000 ? 'within a day' : `in ${Math.round((s.due - Date.now()) / 86400000)} days`;
  return `<dl class="stat-dl">
    <div><dt>Level</dt><dd><span class="lv lv-${levelOf(s)}"></span>${LEVEL_LABEL[levelOf(s)]}</dd></div>
    <div><dt>Strength</dt><dd class="mono">${pct(mastery(s))}</dd></div>
    <div><dt>Accuracy</dt><dd class="mono">${pct(s.c / s.n)} all-time · ${pct(recentAccuracy(s))} last ${s.recent.length}</dd></div>
    <div><dt>Response time</dt><dd class="mono">${secs(median(s.rts))} average · ${secs(recentSpeed(s))} recent</dd></div>
    <div><dt>Attempts</dt><dd class="mono">${s.n}</dd></div>
    <div><dt>Next review</dt><dd>${due}</dd></div>
    <div><dt>Recent answers</dt><dd class="dots">${s.recent.map((r) => `<i class="${r ? 'ok' : 'bad'}"></i>`).join('')}</dd></div>
    ${conf.length ? `<div><dt>Mistaken for</dt><dd>${conf.map(([c, n]) => `${cardInline(c)} ×${n}`).join(', ')}</dd></div>` : ''}
  </dl>`;
}

export function masteryGrid(state, field = 'img', selected = null) {
  const sum = cardSummary(state, field);
  return `<div class="mgrid" role="grid" aria-label="Mastery of all 52 cards">${['S', 'H', 'D', 'C'].map((suit) => `<div class="mrow" role="row">${sum.rows.filter((r) => r.id[1] === suit).map((r) => `<button class="mcell lv-${r.level} ${r.id === selected ? 'sel' : ''}" data-card="${r.id}" role="gridcell" aria-label="${cardName(r.id)}: ${LEVEL_LABEL[r.level]}" title="${cardName(r.id)}: ${LEVEL_LABEL[r.level]}">${cardLabel(r.id)}</button>`).join('')}</div>`).join('')}</div>
  <div class="legend">${Object.entries(LEVEL_LABEL).map(([k, v]) => `<span><i class="sw lv-${k}"></i>${v} <b class="mono">${sum.levels[k]}</b></span>`).join('')}</div>`;
}

export function progress(main, route, ctx) {
  const state = ctx.store.state;
  let field = ['img', 'p', 'a', 'o'].includes(route.query.field) ? route.query.field : 'img';
  let selected = null;
  const deck = deckSummary(state);
  const ch = charts(state);
  const gs = goals(state);
  const groups = [...new Set(gs.map((g) => g.group))];
  const seq = seqProgress(state);
  const days = consistency(state);
  const pao = effectivePao(state.pao);
  const assoc = (id) => (field === 'img' ? effectiveImage(state, id).image : pao[id][field]);

  main.innerHTML = `
    <header class="page-head"><h1 tabindex="-1">Progress</h1><p class="lede">Every number here comes from exercises you have finished on this device.</p></header>

    <section class="panel"><div class="panel-h"><h2>Card mastery</h2>
      <div class="seg" data-field>${[['img', 'Images'], ['p', 'People'], ['a', 'Actions'], ['o', 'Objects']].map(([k, v]) => `<button data-v="${k}" class="${k === field ? 'on' : ''}">${v}</button>`).join('')}</div></div>
      <div data-grid></div><div class="card-detail" data-detail></div></section>

    <div class="grid2">
      <section class="panel"><h2>Weakest associations</h2><div data-weak></div></section>
      <section class="panel"><h2>Cards mistaken for each other</h2><div data-conf></div></section>
    </div>

    <section class="panel"><h2>Goals</h2>
      <div class="goals">${groups.map((gr) => `<div><h3>${gr}</h3><ul>${gs.filter((g) => g.group === gr).map((g) => `<li class="${g.done ? 'done' : ''}"><span class="gmark">${g.done ? '✓' : ''}</span><a href="${g.href}">${esc(g.label)}</a><span class="small">${esc(g.detail)}</span></li>`).join('')}</ul></div>`).join('')}</div>
      <p class="small">Timed goals count only perfect, unassisted attempts. Times are memorisation time. The 5-second, 20-digit goal is world-class pace and is there as a horizon.</p></section>

    <section class="panel"><h2>Sequence ladder</h2>
      <ol class="ladder">${seq.rungs.map((r) => `<li class="${r.cleared ? 'done' : r.n === seq.next ? 'current' : ''}"><a href="${r.n === 52 ? '#/speed' : `#/train/seq?n=${r.n}`}"><b class="mono">${r.n}</b><span class="small">${r.cleared ? `cleared · best ${fmtTime(r.best)}` : `${r.perfect}/${r.n === 52 ? 1 : 2} perfect`}</span><span class="small muted">${r.attempts} attempt${r.attempts === 1 ? '' : 's'}</span></a></li>`).join('')}</ol>
      <p class="small">A rung is cleared by two perfect, unassisted attempts (one for the full deck).</p></section>

    <div class="grid2">
      <section class="panel"><h2>Full-deck memorisation time</h2>${ch.deckTime}<p class="small">Best perfect deck: <b class="mono">${deck.bestMs ? fmtTime(deck.bestMs) : '—'}</b>. Hollow points had errors or hints.</p></section>
      <section class="panel"><h2>Sequence accuracy</h2>${ch.accuracy}<p class="small">Share of positions correct across card sequences, by day.</p></section>
      <section class="panel"><h2>Recognition speed</h2>${ch.speed}<p class="small">Median seconds per card in recognition drills, by day.</p></section>
      <section class="panel"><h2>Practice consistency</h2>${heatStrip(days)}<p class="small">${days.filter((d) => d.n).length} of the last ${days.length} days · current run ${streak(state)} day${streak(state) === 1 ? '' : 's'}. Each column is a week.</p></section>
    </div>

    <section class="panel"><h2>History</h2>
      ${state.history.length ? `<div class="cmp-wrap"><table class="cmp"><thead><tr><th>Date</th><th>Exercise</th><th>Score</th></tr></thead><tbody>${state.history.slice(-60).reverse().map((h) => { const d = describe(h); return `<tr><td class="mono small">${shortDate(h.t)}</td><td>${esc(d.what)}</td><td class="mono">${d.score}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="small">No exercises finished yet.</p>'}</section>`;

  const paint = () => {
    const sum = cardSummary(state, field);
    $('[data-grid]', main).innerHTML = masteryGrid(state, field, selected);
    $('[data-detail]', main).innerHTML = selected ? `<div class="detail-in">${cardHTML(selected)}<div><h3>${cardName(selected)} · <span class="muted">${esc(assoc(selected))}</span></h3>${cardStatHTML(state, selected, field)}<div class="row"><a class="btn" href="#/train/c2i?field=${field}&pool=cards:${[selected, ...sum.weak.filter((c) => c !== selected).slice(0, 5)].join(',')}">Drill this card</a><a class="btn quiet" href="#/systems/${field === 'img' ? 'cards' : 'pao'}?card=${selected}">Edit association</a></div></div></div>` : '<p class="small">Select a card to see its record: accuracy, response times, attempts, recent errors and next review.</p>';
    $('[data-weak]', main).innerHTML = sum.weak.length
      ? `<ul class="weak">${sum.weak.slice(0, 8).map((id) => { const s = state.stats[`${field}:${id}`]; return `<li>${cardInline(id)}<span>${esc(assoc(id))}</span><span class="small mono">${pct(recentAccuracy(s))} · ${secs(recentSpeed(s))}</span></li>`; }).join('')}</ul><div class="row"><a class="btn" href="#/train/weak${field === 'img' ? '' : `?field=${field}`}">Train weak cards</a></div>`
      : `<p class="small">${sum.seen ? 'Nothing is currently weak.' : 'No drill results yet for this set.'}</p>`;
    $('[data-conf]', main).innerHTML = sum.confusions.length
      ? `<ul class="weak">${sum.confusions.slice(0, 6).map((c) => `<li>${cardInline(c.cards[0])} ↔ ${cardInline(c.cards[1])}<span>${esc(assoc(c.cards[0]))} / ${esc(assoc(c.cards[1]))}</span><span class="small mono">×${c.n}</span><a class="small" href="#/train/i2c?field=${field}&pool=cards:${c.cards.join(',')},${sum.weak.slice(0, 4).join(',')}">separate</a></li>`).join('')}</ul>`
      : '<p class="small">No confusions recorded. They are logged when you pick the wrong card in an image → card drill.</p>';
    $$('[data-grid] [data-card]', main).forEach((b) => { b.onclick = () => { selected = b.dataset.card === selected ? null : b.dataset.card; paint(); }; });
  };
  $$('[data-field] button', main).forEach((b) => { b.onclick = () => { field = b.dataset.v; selected = null; $$('[data-field] button', main).forEach((x) => x.classList.toggle('on', x === b)); paint(); }; });
  paint();
}
