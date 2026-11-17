// The card sequence trainer and Speed Cards arena: memorise → recall → results.
// The deck is held by the session object (core/session.js). Once recall begins, nothing in this
// file can read it, and no part of it is in the page, until the attempt has been submitted.

import { createArenaSession } from '../core/session.js';
import { diagnose, fmtTime, DECK_MILESTONES, milestoneEligible } from '../core/scoring.js';
import { effectiveImage } from '../core/systems.js';
import { effectivePao } from '../core/pao.js';
import { awardMilestones } from '../core/adapt.js';
import { esc, $, $$, cardHTML, cardInline, pickerHTML, cardKeys, progressBar } from './dom.js';

const PACES = [0, 1.5, 2, 2.5, 3, 5];

export function arena(el, opts, ctx) {
  const { n = 52, allowHints = false, timed = false, title = '' } = opts;
  const store = ctx.store;
  const settings = store.state.settings;
  let perView = Math.min(settings.perView || 1, n);
  let pace = settings.autoAdvance || 0;
  let hints = false;

  const prior = store.state.history.filter((h) => h.kind === 'seq' && h.total === n && h.correct === n && !h.assisted);
  const best = prior.length ? Math.min(...prior.map((h) => h.encodeMs)) : null;
  const target = best ? best * 0.9 : null;

  setup();

  function setup() {
    el.innerHTML = `<div class="ex arena-setup">
      <h3>${esc(title || (n === 52 ? 'Full deck' : `${n} cards`))}</h3>
      <p>${n === 52 ? 'A freshly shuffled deck of 52.' : `${n} cards drawn from a freshly shuffled deck.`} The clock starts with the first card and stops when you begin recall. Once recall begins the cards are not shown again.</p>
      ${best ? `<p class="small">Best perfect time at this length: <b class="mono">${fmtTime(best)}</b>.${timed || n >= 10 ? ` Target: <b class="mono">${fmtTime(target)}</b>.` : ''}</p>` : timed ? '<p class="small">No perfect attempt at this length yet. Make this one accurate; the target will be set from it.</p>' : ''}
      <div class="opts">
        <fieldset><legend>Cards per view</legend><div class="seg" data-seg="perView">${[1, 2, 3].filter((v) => v <= n).map((v) => `<button type="button" data-v="${v}" class="${v === perView ? 'on' : ''}">${v}</button>`).join('')}</div><p class="small">Use 3 with PAO, 2 for pairs at one location.</p></fieldset>
        <fieldset><legend>Auto-advance</legend><div class="seg" data-seg="pace">${PACES.map((v) => `<button type="button" data-v="${v}" class="${v === pace ? 'on' : ''}">${v ? `${v}s` : 'Off'}</button>`).join('')}</div><p class="small">${pace ? `${fmtTime(Math.ceil(n / perView) * pace * 1000)} for one pass.` : 'You turn the cards yourself.'}</p></fieldset>
      </div>
      ${allowHints ? `<label class="check"><input type="checkbox" data-hints ${hints ? 'checked' : ''}> Show my ${perView === 3 ? 'PAO parts' : 'images'} under each card <span class="small">(recorded as an assisted attempt; never counts for milestones)</span></label>` : ''}
      <div class="row"><button class="btn primary" data-start>Shuffle and start <kbd>Enter</kbd></button></div></div>`;
    $$('[data-seg] button', el).forEach((b) => {
      b.onclick = () => {
        const v = Number(b.dataset.v);
        if (b.parentElement.dataset.seg === 'perView') perView = v; else pace = v;
        store.update((s) => { s.settings.perView = perView; s.settings.autoAdvance = pace; });
        setup();
      };
    });
    const h = $('[data-hints]', el);
    if (h) h.onchange = () => { hints = h.checked; };
    $('[data-start]', el).onclick = memorise;
    ctx.keys((e) => { if (e.key === 'Enter') { memorise(); return true; } return false; });
  }

  function memorise() {
    const session = createArenaSession({ n, perView });
    session.start();
    if (hints) session.useHint();
    const sys = hints ? effectivePao(store.state.pao) : null;
    const hintFor = (id, j) => {
      if (!hints) return '';
      const text = perView === 3 ? sys[id]['pao'[j]] : effectiveImage(store.state, id).image;
      return `<span class="hint">${esc(text)}</span>`;
    };
    el.innerHTML = `<div class="ex arena">
      <div class="ex-bar"><span class="small" data-pos></span><span class="timer mono big" data-t>0.0s</span></div>
      <div data-bar></div>
      <div class="deck-stage" data-stage tabindex="0" aria-live="off"></div>
      <div class="row center"><button class="btn" data-prev aria-label="Previous">← Back</button><button class="btn" data-next aria-label="Next">Next →</button><button class="btn primary" data-recall>Start recall <kbd>Enter</kbd></button></div>
      <p class="small center">${hints ? '<span class="tag">assisted</span> ' : ''}<kbd>→</kbd>/<kbd>Space</kbd> next · <kbd>←</kbd> back · tap the right or left half of the card area</p></div>`;
    const stage = $('[data-stage]', el);
    const paint = () => {
      const { index, total } = session.position;
      const cards = session.view();
      stage.innerHTML = cards.map((c, j) => `<div class="stage-card">${cardHTML(c, 'lg')}${hintFor(c, j)}</div>`).join('');
      $('[data-pos]', el).textContent = cards.length > 1 ? `Cards ${index + 1}–${index + cards.length} of ${total}` : `Card ${index + 1} of ${total}`;
      $('[data-bar]', el).innerHTML = progressBar((index + cards.length) / total);
    };
    const tick = ctx.every(100, () => { const t = $('[data-t]', el); if (t) t.textContent = fmtTime(session.elapsed()); });
    let auto = null;
    const stopAuto = () => { if (auto) { auto(); auto = null; } };
    if (pace) auto = ctx.every(pace * 1000, () => { if (session.position.last) stopAuto(); else { session.next(); paint(); } });
    const next = () => { session.next(); paint(); };
    const prev = () => { stopAuto(); session.prev(); paint(); };
    const begin = () => { tick(); stopAuto(); session.beginRecall(); recall(session); };
    // A mouse click leaves focus on the button, and Enter would then press it again instead of
    // starting recall. Drop focus after pointer clicks; keyboard users keep theirs (detail === 0).
    const pointer = (fn) => (e) => { fn(); if (e.detail > 0) e.currentTarget.blur(); };
    $('[data-next]', el).onclick = pointer(next);
    $('[data-prev]', el).onclick = pointer(prev);
    $('[data-recall]', el).onclick = begin;
    stage.onclick = (e) => { const r = stage.getBoundingClientRect(); (e.clientX - r.left < r.width * 0.3 ? prev : next)(); };
    let touchX = null;
    stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) { e.preventDefault(); (dx < 0 ? next : prev)(); }
    });
    ctx.keys((e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { next(); return true; }
      if (e.key === 'ArrowLeft') { prev(); return true; }
      if (e.key === 'Enter') { begin(); return true; }
      return false;
    });
    paint();
  }

  function recall(session) {
    const slots = new Array(n).fill(null);
    let active = 0;
    let confirm = false;
    el.innerHTML = `<div class="ex arena">
      <div class="ex-bar"><span class="small">Recall · <span data-filled>0</span>/${n} placed · memorised in <b class="mono">${fmtTime(session.encodeMs)}</b></span><span class="timer mono" data-t>0.0s</span></div>
      <div class="slots" data-slots role="listbox" aria-label="Your order"></div>
      <div class="picker-dock">${pickerHTML()}</div>
      <div class="row"><button class="btn quiet" data-clear>Clear slot <kbd>Backspace</kbd></button><span class="grow"></span><span class="small" data-warn></span><button class="btn primary" data-submit>Submit</button></div>
      <p class="small">Click a slot to select it; pick a card to fill it. Drag one slot onto another to swap. <kbd>←</kbd> <kbd>→</kbd> move between slots.</p></div>`;
    const tick = ctx.every(100, () => { const t = $('[data-t]', el); if (t) t.textContent = fmtTime(session.elapsed()); });
    const slotsEl = $('[data-slots]', el);

    const paint = () => {
      slotsEl.innerHTML = slots.map((c, i) => `<button type="button" class="slot ${i === active ? 'active' : ''} ${c ? 'filled' : ''}" data-i="${i}" draggable="${c ? 'true' : 'false'}" role="option" aria-selected="${i === active}" aria-label="Position ${i + 1}${c ? '' : ', empty'}"><span class="slot-n mono">${i + 1}</span>${cardHTML(c, 'sm')}</button>`).join('');
      const used = new Set(slots.filter(Boolean));
      $$('[data-pick]', el).forEach((b) => { b.disabled = used.has(b.dataset.pick); });
      $('[data-filled]', el).textContent = used.size;
      if (confirm) { confirm = false; $('[data-submit]', el).textContent = 'Submit'; $('[data-warn]', el).textContent = ''; }
      $(`.slot[data-i="${active}"]`, el)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    const place = (card) => {
      if (slots.includes(card)) return; // a card can be used once
      slots[active] = card;
      const nextEmpty = slots.findIndex((c, i) => i > active && !c);
      active = nextEmpty >= 0 ? nextEmpty : slots.findIndex((c) => !c) >= 0 ? slots.findIndex((c) => !c) : active;
      paint();
    };
    const clear = () => {
      if (!slots[active] && active > 0) active--;
      slots[active] = null;
      paint();
    };
    slotsEl.onclick = (e) => { const b = e.target.closest('.slot'); if (b) { active = Number(b.dataset.i); paint(); } };
    let dragFrom = null;
    slotsEl.addEventListener('dragstart', (e) => { const b = e.target.closest('.slot'); if (b) { dragFrom = Number(b.dataset.i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(dragFrom)); } });
    slotsEl.addEventListener('dragover', (e) => { if (e.target.closest('.slot')) e.preventDefault(); });
    slotsEl.addEventListener('drop', (e) => {
      const b = e.target.closest('.slot');
      if (!b || dragFrom == null) return;
      e.preventDefault();
      const to = Number(b.dataset.i);
      [slots[dragFrom], slots[to]] = [slots[to], slots[dragFrom]];
      active = to;
      dragFrom = null;
      paint();
    });
    $$('[data-pick]', el).forEach((b) => { b.onclick = () => place(b.dataset.pick); });
    $('[data-clear]', el).onclick = clear;
    const submit = () => {
      const empty = slots.filter((c) => !c).length;
      if (empty && !confirm) {
        confirm = true;
        $('[data-warn]', el).textContent = `${empty} slot${empty === 1 ? ' is' : 's are'} empty.`;
        $('[data-submit]', el).textContent = 'Submit anyway';
        return;
      }
      tick();
      results(session.submit(slots));
    };
    $('[data-submit]', el).onclick = submit;
    const typedKeys = cardKeys(place);
    ctx.keys((e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') { clear(); return true; }
      if (e.key === 'ArrowRight') { active = Math.min(n - 1, active + 1); paint(); return true; }
      if (e.key === 'ArrowLeft') { active = Math.max(0, active - 1); paint(); return true; }
      return typedKeys(e);
    });
    paint();
  }

  function results(res) {
    ctx.keys(null);
    const attempt = { kind: 'seq', total: n, correct: res.correct, encodeMs: Math.round(res.encodeMs), recallMs: Math.round(res.recallMs), assisted: res.assisted, perView: res.perView, errors: res.positions.filter((p) => !p.ok).map((p) => p.expected) };
    const fresh = awardMilestones(store.state, attempt);
    store.log(attempt);
    const wrongCards = [...new Set(res.positions.filter((p) => !p.ok).flatMap((p) => [p.expected, p.got]).filter(Boolean))];
    const fb = diagnose(res);
    if (res.perfect && res.assisted) fb.push('Perfect, with hints on. It is recorded as an assisted attempt: repeat it without hints for it to count.');
    if (res.perfect && !res.assisted && target && res.encodeMs < target) fb.push(`Target beaten: ${fmtTime(res.encodeMs)} against ${fmtTime(target)}.`);
    if (res.perfect && !res.assisted && best && res.encodeMs >= best) fb.push(`Perfect, at ${fmtTime(res.encodeMs)}. Your best is ${fmtTime(best)}.`);
    if (!res.perfect && res.encodeMs / n < 3000 && res.correct / n < 0.9) fb.push(`You memorised at ${(res.encodeMs / n / 1000).toFixed(1)}s per card and lost ${n - res.correct}. Take the next attempt noticeably slower: accuracy first.`);

    let mile = '';
    if (n === 52) {
      if (fresh.length) mile = `<div class="milestone"><b>Milestone${fresh.length > 1 ? 's' : ''} reached</b> ${fresh.map((id) => `<span class="tag ok">${DECK_MILESTONES.find((m) => m.id === id).label}</span>`).join(' ')}</div>`;
      else if (!milestoneEligible(attempt)) mile = `<p class="small">Not a milestone attempt: ${res.assisted ? 'hints were used' : `${n - res.correct} of 52 positions were wrong`}. Milestones need all 52 correct, unassisted, whatever the time.</p>`;
    }
    el.innerHTML = `<div class="ex arena">
      <div class="result-head"><div class="big-score mono">${res.correct}<span>/${n}</span></div>
        <div class="result-meta"><span>memorised in <b class="mono">${fmtTime(res.encodeMs)}</b></span><span>recalled in <b class="mono">${fmtTime(res.recallMs)}</b></span><span><b class="mono">${(res.encodeMs / n / 1000).toFixed(2)}s</b> per card</span>${res.assisted ? '<span class="tag">assisted</span>' : ''}</div></div>
      ${mile}${fb.length ? `<ul class="feedback">${fb.map((f) => `<li>${f}</li>`).join('')}</ul>` : ''}
      <h4>Position by position</h4>
      <p class="small">Top card: the original. Bottom card: yours, where it differed.</p>
      <div class="cmp-grid">${res.positions.map((p) => `<div class="cmp-cell ${p.ok ? '' : 'miss'}" title="${p.ok ? 'correct' : p.kind}"><span class="mono">${p.i + 1}</span>${cardHTML(p.expected, 'sm')}${p.ok ? '<span class="ok tick">✓</span>' : cardHTML(p.got, 'sm', 'yours')}</div>`).join('')}</div>
      ${wrongCards.length ? `<p>Cards involved in errors: ${wrongCards.map((c) => `${cardInline(c)} <span class="muted">${esc(effectiveImage(store.state, c).image)}</span>`).join(' · ')}</p>` : ''}
      <div class="row"><button class="btn primary" data-again>New attempt</button>
        ${wrongCards.length >= 2 ? `<a class="btn" href="#/train/i2c?pool=cards:${wrongCards.join(',')}">Drill these ${wrongCards.length} cards</a>` : ''}
        ${res.kinds.blank + res.kinds.swap + res.kinds.misplaced > 0 ? '<a class="btn" href="#/train/walk">Palace walk</a>' : ''}</div></div>`;
    $('[data-again]', el).onclick = () => arena(el, opts, ctx);
    opts.onDone?.({ score: res.correct / n, correct: res.correct, total: n, feedback: fb, assisted: res.assisted, encodeMs: res.encodeMs });
  }
}
