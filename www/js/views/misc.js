// Speed Cards (the full-deck arena with its history) and the Handbook.

import { fmtTime, DECK_MILESTONES } from '../core/scoring.js';
import { deckSummary, cardSummary, seqProgress } from '../core/adapt.js';
import { arena } from '../ui/arena.js';
import { HANDBOOK } from '../content/handbook.js';
import { esc, $, $$, lineChart, shortDate, pct } from '../ui/dom.js';

export function speed(main, route, ctx) {
  const state = ctx.store.state;
  const paintSide = () => {
    const deck = deckSummary(state);
    const img = cardSummary(state);
    const seq = seqProgress(state);
    const ready = img.mastered >= 40;
    $('[data-side]', main).innerHTML = `
      <section class="panel"><h2>Milestones</h2>
        <ol class="milestones">${DECK_MILESTONES.map((m) => `<li class="${state.milestones[m.id] ? 'done' : ''}"><span class="gmark">${state.milestones[m.id] ? '✓' : ''}</span><span>${m.label}</span><span class="small mono">${state.milestones[m.id] ? shortDate(state.milestones[m.id]) : ''}</span></li>`).join('')}</ol>
        <p class="small">Each needs 52 of 52 in the right position, with no hints. Time is memorisation time. An attempt with any error earns nothing, however fast.</p></section>
      <section class="panel"><h2>Readiness</h2>
        <ul class="ready">
          <li class="${ready ? 'done' : ''}"><span class="gmark">${ready ? '✓' : ''}</span>Card images solid: <b class="mono">${img.mastered}/52</b></li>
          <li class="${seq.rungs[4].perfect ? 'done' : ''}"><span class="gmark">${seq.rungs[4].perfect ? '✓' : ''}</span>A perfect half deck</li>
          <li class="${state.palaces.some((p) => p.areas.reduce((a, x) => a + x.loci.length, 0) >= 18) ? 'done' : ''}"><span class="gmark">${state.palaces.some((p) => p.areas.reduce((a, x) => a + x.loci.length, 0) >= 18) ? '✓' : ''}</span>A palace of 18+ locations</li>
        </ul>
        <p class="small">${ready ? 'Your associations can carry a full deck.' : 'You can attempt a deck at any time, and an early baseline is worth having. Timed attempts will go better once most card images are solid.'}</p>
        <div class="row"><a class="btn quiet" href="#/train/seq?n=10&timed=1">Timed 10</a><a class="btn quiet" href="#/train/seq?n=26&timed=1">Half deck</a><a class="btn quiet" href="#/train/flash">Run-through</a></div></section>
      <section class="panel wide"><div class="panel-h"><h2>Attempt history</h2><span class="small mono">best perfect: ${deck.bestMs ? fmtTime(deck.bestMs) : '—'}</span></div>
        ${deck.attempts.length ? `${lineChart(deck.attempts.map((h) => ({ label: `${shortDate(h.t)} · ${h.correct}/52`, y: h.encodeMs / 1000, cls: h.correct === 52 && !h.assisted ? 'good' : 'miss' })), { fmt: (v) => fmtTime(v * 1000), goal: 120, goalLabel: '2:00 goal', log: true })}
        <div class="cmp-wrap"><table class="cmp"><thead><tr><th>Date</th><th>Correct</th><th>Memorised</th><th>Recalled</th><th>Per view</th><th></th></tr></thead><tbody>${deck.attempts.slice().reverse().map((h) => `<tr class="${h.correct === 52 && !h.assisted ? '' : 'miss'}"><td class="mono small">${shortDate(h.t)}</td><td class="mono">${h.correct}/52 <span class="small">${pct(h.correct / 52)}</span></td><td class="mono">${fmtTime(h.encodeMs)}</td><td class="mono">${fmtTime(h.recallMs)}</td><td class="mono">${h.perView || 1}</td><td>${h.assisted ? '<span class="tag">assisted</span>' : h.correct === 52 ? '<span class="tag ok">perfect</span>' : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="small">No full-deck attempts yet.</p>'}</section>`;
  };
  main.innerHTML = `
    <header class="page-head"><h1 tabindex="-1">Speed Cards</h1><p class="lede">One shuffled deck. Memorise it, rebuild it from memory, and see exactly where it held. The goal is 52 of 52 in under two minutes.</p></header>
    <div data-arena></div><div class="grid2 side" data-side></div>`;
  arena($('[data-arena]', main), { n: 52, allowHints: true, title: 'Full deck attempt', onDone: () => { paintSide(); ctx.refreshNav?.(); } }, ctx);
  paintSide();
}

export function handbook(main, route, ctx) {
  const plain = (html) => html.replace(/<[^>]+>/g, ' ');
  main.innerHTML = `
    <header class="page-head"><h1 tabindex="-1">Handbook</h1><p class="lede">A reference for every technique in the course. The lessons teach them in order; this is for looking things up.</p></header>
    <div class="hb-search"><input type="search" placeholder="Search the handbook" aria-label="Search the handbook" value="${esc(route.query.q || '')}"><span class="small" data-n></span></div>
    <div class="hb"><nav class="hb-toc" aria-label="Handbook sections"></nav><div class="hb-body"></div></div>`;
  const input = $('input', main);
  const paint = () => {
    const q = input.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const hits = HANDBOOK.filter((s) => { const text = `${s.title} ${s.tags} ${plain(s.html)}`.toLowerCase(); return terms.every((t) => text.includes(t)); });
    $('[data-n]', main).textContent = q ? `${hits.length} of ${HANDBOOK.length} sections` : '';
    $('.hb-toc', main).innerHTML = hits.map((s) => `<a href="#/handbook" data-jump="${s.id}">${esc(s.title)}</a>`).join('');
    $('.hb-body', main).innerHTML = hits.length ? hits.map((s) => `<section class="panel prose" id="hb-${s.id}"><h2>${esc(s.title)}</h2>${s.html}</section>`).join('') : '<p>Nothing matches. Try a single word, such as “palace”, “PAO” or “review”.</p>';
    $$('[data-jump]', main).forEach((a) => { a.onclick = (e) => { e.preventDefault(); $(`#hb-${a.dataset.jump}`, main)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
  };
  input.oninput = paint;
  paint();
  ctx.keys((e) => { if (e.key === '/') { input.focus(); return true; } return false; });
}
