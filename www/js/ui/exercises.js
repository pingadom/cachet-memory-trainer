// Reusable exercises. Each one renders into `el`, runs to a result, records it in the history,
// and calls opts.onDone({ score, correct, total, feedback }) so a lesson or the trainer can react.
// All of them require the learner to produce the answer; none is a recognition test in disguise.

import { DECK, RANKS, shuffle, randInt, cardName, cardLabel, newDeck } from '../core/cards.js';
import { compareWords, compareDigits, diagnose, fmtTime, norm } from '../core/scoring.js';
import { recordAttempt, pickNext, scoreDrill, median } from '../core/srs.js';
import { effectiveImage, effectivePeg, pegId } from '../core/systems.js';
import { effectivePao, encodeTriple, FIELD_NAME } from '../core/pao.js';
import { cardSummary } from '../core/adapt.js';
import { allLoci } from '../core/store.js';
import { WORDS, EXAMPLE_ROUTE } from '../content/words.js';
import { esc, $, $$, cardHTML, cardInline, pickerHTML, cardKeys, pct, secs, progressBar } from './dom.js';

const now = () => performance.now();

function clock(node, ctx, { countdown = 0, onZero = null } = {}) {
  const t0 = now();
  const stop = ctx.every(100, () => {
    const el = now() - t0;
    if (countdown) {
      const left = Math.max(0, countdown * 1000 - el);
      node.textContent = fmtTime(left);
      if (left <= 0) { stop(); onZero && onZero(); }
    } else node.textContent = fmtTime(el);
  });
  return { stop, elapsed: () => now() - t0 };
}

const resultHead = (correct, total, extra = '') => `
  <div class="result-head"><div class="big-score mono">${correct}<span>/${total}</span></div><div class="result-meta">${extra}</div></div>`;

const feedbackList = (items) => (items.length ? `<ul class="feedback">${items.map((f) => `<li>${f}</li>`).join('')}</ul>` : '');

const compareTable = (cmp, show = (x) => esc(x)) => `
  <div class="cmp-wrap"><table class="cmp"><thead><tr><th>#</th><th>Original</th><th>You</th><th></th></tr></thead><tbody>
  ${cmp.positions.map((p) => `<tr class="${p.ok ? '' : 'miss'}"><td class="mono">${p.i + 1}</td><td>${show(p.expected)}</td><td>${p.got == null ? '<span class="muted">—</span>' : show(p.got)}</td><td>${p.ok ? '<span class="ok">✓</span>' : `<span class="bad">${{ blank: 'blank', swap: 'swapped', misplaced: 'wrong place', wrong: 'not in list' }[p.kind]}</span>`}</td></tr>`).join('')}
  </tbody></table></div>`;

function ownRoute(state, need) {
  const best = state.palaces.map((p) => ({ p, loci: allLoci(p) })).sort((a, b) => b.loci.length - a.loci.length)[0];
  if (!best || best.loci.length < Math.min(need, 5)) return null;
  return { name: best.p.name, loci: best.loci.map((l) => l.name) };
}

// ── words in order ───────────────────────────────────────────────
export function words(el, opts, ctx) {
  const { n = 10, reverse = false, method = 'free', palace = null, seconds = 0, label = '', log = true } = opts;
  const state = ctx.store.state;
  const list = shuffle(WORDS).slice(0, n);
  let route = null;
  if (palace === 'example') route = { name: 'Example route', loci: EXAMPLE_ROUTE };
  if (palace === 'own') route = ownRoute(state, Math.ceil(n / 2));
  const perLocus = route ? Math.ceil(n / route.loci.length) : 1;
  const how = {
    rote: 'Repeat the words to yourself, over and over, in order. Do not make images or stories: this round measures plain repetition.',
    link: 'Chain the words: make the first act on the second, then the second on the third, and so on. One vivid scene per link.',
    loci: route ? `Walk the route and leave ${perLocus > 1 ? `${perLocus} images` : 'one image'} at each location, acting on it.` : 'You have no palace with enough locations yet, so use the link method for this attempt. <a href="#/systems/palaces">Build a palace</a> to use it here.',
    free: 'Use any technique you have learned.',
  }[method];

  el.innerHTML = `<div class="ex">
    <h3>${esc(label || `${n} words in order${reverse ? ', recalled in reverse' : ''}`)}</h3>
    <p>${how}</p>
    <p class="small">${seconds ? `You will have ${seconds} seconds.` : 'Take as long as you need; the time is recorded.'} Then the list is hidden and you type it back${reverse ? ' <b>from last to first</b>' : ''}.</p>
    <button class="btn primary" data-go>Show the words</button></div>`;
  $('[data-go]', el).onclick = study;

  function study() {
    el.innerHTML = `<div class="ex">
      <div class="ex-bar"><span class="small">Memorise${route ? ` · ${esc(route.name)}` : ''}</span><span class="timer mono" data-t>0.0s</span></div>
      <ol class="wordlist ${route ? 'with-loci' : ''}">${list.map((w, i) => `<li>${route ? `<span class="locus">${perLocus > 1 && i % perLocus ? '' : esc(route.loci[Math.floor(i / perLocus)] || '')}</span>` : ''}<b>${esc(w)}</b></li>`).join('')}</ol>
      <button class="btn primary" data-ready>Hide the list and recall</button></div>`;
    const c = clock($('[data-t]', el), ctx, { countdown: seconds, onZero: () => recall(c.elapsed()) });
    $('[data-ready]', el).onclick = () => { c.stop(); recall(c.elapsed()); };
  }

  function recall(encodeMs) {
    const order = list.map((_, i) => (reverse ? n - 1 - i : i));
    el.innerHTML = `<form class="ex" autocomplete="off">
      <div class="ex-bar"><span class="small">Recall${reverse ? ' · last word first' : ''}</span><span class="timer mono" data-t>0.0s</span></div>
      <div class="recall-inputs">${order.map((pos, k) => `<label><span class="mono">${pos + 1}</span><input type="text" name="w${k}" autocapitalize="off" spellcheck="false" ${k === 0 ? 'autofocus' : ''}></label>`).join('')}</div>
      <button class="btn primary">Check</button></form>`;
    const c = clock($('[data-t]', el), ctx);
    const inputs = $$('input', el);
    inputs[0].focus();
    inputs.forEach((inp, k) => inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && k < inputs.length - 1) { e.preventDefault(); inputs[k + 1].focus(); }
    }));
    $('form', el).onsubmit = (e) => {
      e.preventDefault();
      c.stop();
      const expected = reverse ? list.slice().reverse() : list;
      finish(compareWords(expected, inputs.map((i) => i.value)), encodeMs, c.elapsed());
    };
  }

  function finish(cmp, encodeMs, recallMs) {
    const score = cmp.correct / cmp.total;
    const fb = diagnose(cmp);
    if (!cmp.perfect && method === 'link' && cmp.firstError >= 0 && cmp.positions.slice(cmp.firstError).every((p) => !p.ok)) fb.push(`Everything after word ${cmp.firstError + 1} was lost. That is the link method's weakness: one broken link and the chain ends. The link from “${esc(cmp.positions[Math.max(0, cmp.firstError - 1)].expected)}” needed a stronger action.`);
    if (cmp.perfect && n >= 10) fb.push(`Perfect. ${n} words took ${fmtTime(encodeMs)} to memorise; the next step is the same result in less time, or a longer list.`);
    if (log) ctx.store.log({ kind: 'words', total: n, correct: cmp.correct, encodeMs, recallMs, method, reverse });
    el.innerHTML = `<div class="ex">${resultHead(cmp.correct, cmp.total, `<span>memorised in <b class="mono">${fmtTime(encodeMs)}</b></span><span>recalled in <b class="mono">${fmtTime(recallMs)}</b></span>`)}
      ${feedbackList(fb)}${compareTable(cmp)}
      <div class="row"><button class="btn" data-again>New list</button></div></div>`;
    $('[data-again]', el).onclick = () => words(el, opts, ctx);
    opts.onDone?.({ score, correct: cmp.correct, total: cmp.total, feedback: fb, encodeMs });
  }
}

// ── repetition against linking ───────────────────────────────────
export function compare(el, opts, ctx) {
  const { n = 8, seconds = 40 } = opts;
  el.innerHTML = '<div data-a></div>';
  words($('[data-a]', el), {
    n, seconds, method: 'rote', label: `Round 1 of 2 · ${n} words by repetition`,
    onDone: (a) => {
      const host = document.createElement('div');
      host.innerHTML = '<p class="divider"><span>Now the second round</span></p><div data-b></div>';
      $('[data-again]', el)?.closest('.row')?.remove();
      el.append(host);
      words($('[data-b]', host), {
        n, seconds, method: 'link', label: `Round 2 of 2 · ${n} new words by linking`,
        onDone: (b) => {
          $$('[data-again]', el).forEach((x) => x.closest('.row')?.remove());
          const diff = b.correct - a.correct;
          const text = diff > 0
            ? `Same time, same number of words, ${diff} more recalled by linking. That gap, on a first try with a technique you learned a minute ago, is the reason the rest of this course exists.`
            : diff === 0
              ? 'The two rounds came out level. One trial each is a noisy measurement, and repetition is a method you have practised for years while linking is brand new. Try once more: the difference usually appears as lists get longer than short-term memory can hold.'
              : 'Repetition won this round. That happens: eight words is close to what rehearsal can hold for a few seconds, and making images under a time limit is unfamiliar. The picture changes with longer lists and with any delay before recall. Run it again, and make each link an action.';
          const box = document.createElement('div');
          box.className = 'ex compare-result';
          box.innerHTML = `<h3>Your result</h3>
            <div class="two-bars"><div><span>Repetition</span>${progressBar(a.correct / n)}<b class="mono">${a.correct}/${n}</b></div><div><span>Linking</span>${progressBar(b.correct / n)}<b class="mono">${b.correct}/${n}</b></div></div>
            <p>${text}</p><div class="row"><button class="btn" data-rerun>Run the experiment again</button></div>`;
          el.append(box);
          $('[data-rerun]', box).onclick = () => compare(el, opts, ctx);
          opts.onDone?.({ score: 1, correct: b.correct, total: n, feedback: [text] });
        },
      }, ctx);
    },
  }, ctx);
}

// ── paired associations, tested in both directions ───────────────
export function pairs(el, opts, ctx) {
  const { n = 6 } = opts;
  const w = shuffle(WORDS).slice(0, n * 2);
  const list = Array.from({ length: n }, (_, i) => [w[2 * i], w[2 * i + 1]]);
  el.innerHTML = `<div class="ex"><h3>${n} pairs</h3>
    <p>For each pair, picture the two things <em>interacting</em>. Writing the scene down is optional but helps at first. You will then be given one word of each pair and asked for the other, in either direction.</p>
    <div class="pairs">${list.map(([a, b]) => `<div class="pair"><b>${esc(a)}</b><span>—</span><b>${esc(b)}</b><input type="text" placeholder="your scene (optional)" aria-label="Scene for ${esc(a)} and ${esc(b)}"></div>`).join('')}</div>
    <button class="btn primary" data-ready>Hide and test me</button></div>`;
  const t0 = now();
  $('[data-ready]', el).onclick = () => {
    const encodeMs = now() - t0;
    const scenes = $$('.pair input', el).map((i) => i.value.trim());
    const qs = shuffle(list.map((p, i) => ({ i, back: randInt(2) === 1 }))).map(({ i, back }) => ({ cue: list[i][back ? 1 : 0], ans: list[i][back ? 0 : 1], scene: scenes[i], back }));
    el.innerHTML = `<form class="ex" autocomplete="off"><h3>What went with…</h3>
      <div class="recall-inputs wide">${qs.map((q, k) => `<label><span>${esc(q.cue)}</span><input type="text" name="p${k}" autocapitalize="off" spellcheck="false"></label>`).join('')}</div>
      <button class="btn primary">Check</button></form>`;
    const inputs = $$('input', el);
    inputs[0].focus();
    inputs.forEach((inp, k) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && k < inputs.length - 1) { e.preventDefault(); inputs[k + 1].focus(); } }));
    $('form', el).onsubmit = (e) => {
      e.preventDefault();
      const rows = qs.map((q, k) => ({ ...q, got: inputs[k].value.trim(), ok: norm(inputs[k].value) === norm(q.ans) }));
      const correct = rows.filter((r) => r.ok).length;
      const missed = rows.filter((r) => !r.ok);
      const fb = [];
      if (!missed.length) fb.push('All pairs held in both directions. These are real two-way associations.');
      const passive = missed.filter((m) => m.scene && !/\w+(ing|s|ed)\b/.test(m.scene));
      if (missed.some((m) => !m.scene)) fb.push('Some of the pairs you missed had no scene written. Try putting the action into words: naming the verb forces the two images to interact.');
      if (passive.length) fb.push(`Look at the scene for “${esc(passive[0].cue)}”: is anything happening in it? If the two things are only near each other, there is nothing to pull one from the other.`);
      if (missed.filter((m) => m.back).length > missed.filter((m) => !m.back).length) fb.push('You missed more in the backward direction. The second item was acted upon but was not doing anything itself; give both parts of the scene a role.');
      ctx.store.log({ kind: 'pairs', total: n, correct, encodeMs });
      el.innerHTML = `<div class="ex">${resultHead(correct, n, `<span>studied for <b class="mono">${fmtTime(encodeMs)}</b></span>`)}${feedbackList(fb)}
        <div class="cmp-wrap"><table class="cmp"><thead><tr><th>Cue</th><th>Answer</th><th>You</th><th></th></tr></thead><tbody>${rows.map((r) => `<tr class="${r.ok ? '' : 'miss'}"><td>${esc(r.cue)}</td><td>${esc(r.ans)}</td><td>${esc(r.got) || '<span class="muted">—</span>'}</td><td>${r.ok ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'}</td></tr>`).join('')}</tbody></table></div>
        <div class="row"><button class="btn" data-again>New pairs</button></div></div>`;
      $('[data-again]', el).onclick = () => pairs(el, opts, ctx);
      opts.onDone?.({ score: correct / n, correct, total: n, feedback: fb });
    };
  };
}

// ── abstract → concrete ──────────────────────────────────────────
export function imagine(el, opts, ctx) {
  const { prompts } = opts;
  el.innerHTML = `<form class="ex" autocomplete="off"><h3>Make it concrete</h3>
    <p>For each item, describe the image you would use: what it is, and what it is doing. There are no right answers, only clear and unclear pictures.</p>
    <div class="imagine">${prompts.map((p, i) => `<label><span>${esc(p)}</span><textarea name="i${i}" rows="2" placeholder="I picture…"></textarea><p class="small" data-fb="${i}"></p></label>`).join('')}</div>
    <button class="btn primary">Review my images</button></form>`;
  $('form', el).onsubmit = (e) => {
    e.preventDefault();
    let good = 0;
    const areas = $$('textarea', el);
    areas.forEach((a, i) => {
      const text = a.value.trim();
      const wordsN = text.split(/\s+/).filter(Boolean).length;
      const key = norm(prompts[i].replace(/^the number /, ''));
      let msg;
      if (!text) msg = 'Empty. Even a rough first image is better than none.';
      else if (wordsN < 3) msg = 'That is a label more than a picture. What does it look like, and what is it doing?';
      else if (norm(text).includes(key) && wordsN < 6) msg = 'The original word is still doing the work here. Replace it with a thing you could photograph.';
      else if (!/\w+(ing|s|ed)\b/.test(text)) { msg = 'Concrete. Now give it some action: images that move are easier to find again.'; good += 0.75; } else { msg = 'A specific picture with something happening in it. That will hold.'; good += 1; }
      const fb = $(`[data-fb="${i}"]`, el);
      fb.textContent = msg;
      fb.className = `small ${msg.startsWith('A specific') ? 'ok' : ''}`;
    });
    const filled = areas.filter((a) => a.value.trim()).length;
    ctx.store.log({ kind: 'imagine', total: prompts.length, correct: Math.round(good) });
    if (filled === prompts.length) opts.onDone?.({ score: 1, correct: Math.round(good), total: prompts.length, feedback: [good >= prompts.length - 0.5 ? 'Every image is concrete and active.' : 'Read the notes under each image and sharpen the ones flagged. Then move on: this skill improves with use, not with polishing.'] });
  };
}

// ── short checks ─────────────────────────────────────────────────
export function quiz(el, opts, ctx) {
  const { items } = opts;
  let i = 0;
  let correct = 0;
  const missed = [];
  const show = () => {
    const it = items[i];
    el.innerHTML = `<div class="ex"><div class="ex-bar"><span class="small">Question ${i + 1} of ${items.length}</span></div>
      <p class="q">${it.q}</p><div class="options">${it.options.map((o, k) => `<button class="btn opt" data-k="${k}"><kbd>${k + 1}</kbd> ${esc(o)}</button>`).join('')}</div><div data-why></div></div>`;
    const answer = (k) => {
      if ($('[data-why]', el).innerHTML) return;
      const ok = k === it.answer;
      if (ok) correct++; else missed.push(it);
      $$('.opt', el).forEach((b, j) => { b.disabled = true; if (j === it.answer) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
      $('[data-why]', el).innerHTML = `<p class="why ${ok ? 'ok' : 'bad'}">${ok ? 'Correct.' : 'Not quite.'} ${esc(it.why)}</p><button class="btn primary" data-next>${i + 1 < items.length ? 'Next' : 'Finish'}</button>`;
      $('[data-next]', el).focus();
      $('[data-next]', el).onclick = () => { i++; i < items.length ? show() : done(); };
    };
    $$('.opt', el).forEach((b) => { b.onclick = () => answer(Number(b.dataset.k)); });
    ctx.keys((e) => { const k = Number(e.key) - 1; if (k >= 0 && k < it.options.length) { answer(k); return true; } return false; });
  };
  const done = () => {
    ctx.keys(null);
    const fb = missed.length ? [`Worth rereading: ${missed.map((m) => `“${esc(m.why)}”`).join(' ')}`] : ['All correct.'];
    ctx.store.log({ kind: 'quiz', total: items.length, correct });
    el.innerHTML = `<div class="ex">${resultHead(correct, items.length)}${feedbackList(fb)}<div class="row"><button class="btn" data-again>Try again</button></div></div>`;
    $('[data-again]', el).onclick = () => quiz(el, opts, ctx);
    opts.onDone?.({ score: correct / items.length, correct, total: items.length, feedback: fb });
  };
  show();
}

export function typed(el, opts, ctx) {
  const items = shuffle(opts.items);
  let i = 0;
  let correct = 0;
  const show = () => {
    const it = items[i];
    el.innerHTML = `<form class="ex" autocomplete="off"><div class="ex-bar"><span class="small">${i + 1} of ${items.length}</span></div>
      <p class="small">${esc(opts.prompt)}</p><p class="q big mono">${esc(it.q)}</p>
      <input class="answer mono" type="text" inputmode="numeric" aria-label="Your answer"><div data-why></div>
      <button class="btn primary">Check</button></form>`;
    const input = $('input', el);
    input.focus();
    let answered = false;
    $('form', el).onsubmit = (e) => {
      e.preventDefault();
      if (answered) { i++; return i < items.length ? show() : done(); }
      answered = true;
      const ok = norm(input.value) === norm(it.a);
      if (ok) correct++;
      input.readOnly = true;
      $('[data-why]', el).innerHTML = `<p class="why ${ok ? 'ok' : 'bad'}">${ok ? 'Correct' : `It is <b class="mono">${esc(it.a)}</b>`}: ${esc(it.why)}.</p>`;
      $('button', el).textContent = i + 1 < items.length ? 'Next' : 'Finish';
    };
  };
  const done = () => {
    const fb = [correct === items.length ? 'Every conversion right. The code is in place; speed comes from using it.' : 'Check the table again for the sounds you missed, then repeat. The ten pairs are worth knowing cold.'];
    ctx.store.log({ kind: 'quiz', total: items.length, correct });
    el.innerHTML = `<div class="ex">${resultHead(correct, items.length)}${feedbackList(fb)}<div class="row"><button class="btn" data-again>Try again</button></div></div>`;
    $('[data-again]', el).onclick = () => typed(el, opts, ctx);
    opts.onDone?.({ score: correct / items.length, correct, total: items.length, feedback: fb });
  };
  show();
}

// ── digits ───────────────────────────────────────────────────────
export function digits(el, opts, ctx) {
  const { n = 20, plain = false } = opts;
  const state = ctx.store.state;
  const number = Array.from({ length: n }, () => randInt(10)).join('');
  const groups = number.match(/.{1,2}/g);
  let assisted = false;
  el.innerHTML = `<div class="ex"><h3>${n} digits</h3>
    <p>${plain ? 'No technique yet: read the number, then type back as much as you can. This is your baseline digit span.' : 'Read the digits in pairs, turn each pair into its image, and place the images along a route. The clock starts when the number appears.'}</p>
    <button class="btn primary" data-go>Show the number</button></div>`;
  $('[data-go]', el).onclick = () => {
    el.innerHTML = `<div class="ex"><div class="ex-bar"><span class="small">Memorise</span><span class="timer mono" data-t>0.0s</span></div>
      <div class="digits mono">${groups.map((g) => `<span><b>${g}</b><i data-peg hidden>${g.length === 2 ? esc(effectivePeg(state, g).image) : ''}</i></span>`).join('')}</div>
      <div class="row"><button class="btn primary" data-ready>Hide and recall</button>${plain ? '' : '<button class="btn quiet" data-hint>Show my images <span class="small">(marks the attempt assisted)</span></button>'}</div></div>`;
    const c = clock($('[data-t]', el), ctx);
    const hint = $('[data-hint]', el);
    if (hint) hint.onclick = () => { assisted = true; $$('[data-peg]', el).forEach((x) => { x.hidden = false; }); hint.disabled = true; };
    $('[data-ready]', el).onclick = () => {
      c.stop();
      const encodeMs = c.elapsed();
      el.innerHTML = `<form class="ex" autocomplete="off"><div class="ex-bar"><span class="small">Recall · <span data-count>0</span>/${n} digits</span><span class="timer mono" data-t>0.0s</span></div>
        <input class="answer mono wide" type="text" inputmode="numeric" aria-label="The number" spellcheck="false">
        <p class="small">Spaces are ignored. Type as far as you can.</p><button class="btn primary">Check</button></form>`;
      const c2 = clock($('[data-t]', el), ctx);
      const input = $('input', el);
      input.focus();
      input.oninput = () => { $('[data-count]', el).textContent = input.value.replace(/\D/g, '').length; };
      $('form', el).onsubmit = (e) => {
        e.preventDefault();
        c2.stop();
        const cmp = compareDigits(number, input.value);
        const fb = [];
        if (cmp.perfect) fb.push(`All ${n} digits, memorised in ${fmtTime(encodeMs)}${assisted ? ' (assisted)' : ''}.`);
        else if (plain) fb.push(`You held ${cmp.firstError < 0 ? n : cmp.firstError} digits before the first error. Around seven is typical without a technique; that ceiling is what a code and a palace remove.`);
        else {
          const badPairs = [...new Set(cmp.positions.filter((p) => !p.ok).map((p) => Math.floor(p.i / 2)))];
          fb.push(`Errors fall in pair${badPairs.length > 1 ? 's' : ''} ${badPairs.map((b) => `<b class="mono">${groups[b]}</b> (${esc(effectivePeg(state, groups[b]).image)})`).join(', ')}. Either the image did not stick at its location, or it decoded to the wrong number. Drill those pegs.`);
        }
        ctx.store.log({ kind: 'digits', total: n, correct: cmp.correct, encodeMs, recallMs: c2.elapsed(), assisted, plain });
        el.innerHTML = `<div class="ex">${resultHead(cmp.correct, n, `<span>memorised in <b class="mono">${fmtTime(encodeMs)}</b></span>${assisted ? '<span class="tag">assisted</span>' : ''}`)}${feedbackList(fb)}
          <div class="digits mono result">${groups.map((g, gi) => `<span>${g.split('').map((d, k) => { const p = cmp.positions[gi * 2 + k]; return `<b class="${p.ok ? '' : 'bad'}">${d}</b>`; }).join('')}<i>${cmp.positions.slice(gi * 2, gi * 2 + 2).map((p) => p.got ?? '·').join('')}</i></span>`).join('')}</div>
          <p class="small">Top: the number. Below: what you typed.</p>
          <div class="row"><button class="btn" data-again>New number</button></div></div>`;
        $('[data-again]', el).onclick = () => digits(el, opts, ctx);
        opts.onDone?.({ score: cmp.correct / n, correct: cmp.correct, total: n, feedback: fb, encodeMs });
      };
    };
  };
}

// ── palace walk ──────────────────────────────────────────────────
export function walk(el, opts, ctx) {
  const state = ctx.store.state;
  const palaces = state.palaces.filter((p) => allLoci(p).length >= 3);
  const chosen = palaces.find((p) => p.id === opts.palaceId) || palaces[0];
  const loci = chosen ? allLoci(chosen).map((l) => l.name) : EXAMPLE_ROUTE;
  const name = chosen ? chosen.name : 'Example route';
  el.innerHTML = `<div class="ex"><h3>Walk: ${esc(name)}</h3>
    ${chosen ? '' : '<p class="small">You have not built a palace yet, so this uses the example route from the lesson. <a href="#/systems/palaces">Build your own</a> and it will be used here.</p>'}
    ${palaces.length > 1 ? `<label class="small">Palace <select data-pal>${palaces.map((p) => `<option value="${p.id}" ${p === chosen ? 'selected' : ''}>${esc(p.name)} (${allLoci(p).length})</option>`).join('')}</select></label>` : ''}
    <p>${loci.length} locations, forwards and then backwards. For each number, bring the location to mind, reveal it, and mark yourself. A hesitation counts as a miss.</p>
    <button class="btn primary" data-go>Start the walk</button></div>`;
  const sel = $('[data-pal]', el);
  if (sel) sel.onchange = () => walk(el, { ...opts, palaceId: sel.value }, ctx);
  $('[data-go]', el).onclick = () => {
    const steps = [...loci.map((_, i) => i), ...loci.map((_, i) => loci.length - 1 - i)];
    const results = [];
    let k = 0;
    const t0 = now();
    const show = () => {
      const i = steps[k];
      let revealed = false;
      el.innerHTML = `<div class="ex drill"><div class="ex-bar"><span class="small">${k < loci.length ? 'Forwards' : 'Backwards'} · ${k + 1} of ${steps.length}</span></div>${progressBar(k / steps.length)}
        <div class="prompt"><div class="locus-n mono">${i + 1}</div><div class="answer-line" data-ans>&nbsp;</div></div>
        <div class="row center" data-actions><button class="btn primary" data-reveal>Reveal <kbd>Space</kbd></button></div></div>`;
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        $('[data-ans]', el).textContent = loci[i];
        $('[data-actions]', el).innerHTML = '<button class="btn" data-no>Hesitated or wrong <kbd>F</kbd></button><button class="btn primary" data-yes>Knew it instantly <kbd>J</kbd></button>';
        $('[data-yes]', el).onclick = () => mark(true);
        $('[data-no]', el).onclick = () => mark(false);
      };
      const mark = (ok) => { results.push({ i, ok, back: k >= loci.length }); k++; k < steps.length ? show() : done(); };
      $('[data-reveal]', el).onclick = reveal;
      ctx.keys((e) => {
        if (!revealed && (e.key === ' ' || e.key === 'Enter')) { reveal(); return true; }
        if (revealed && e.key.toLowerCase() === 'j') { mark(true); return true; }
        if (revealed && e.key.toLowerCase() === 'f') { mark(false); return true; }
        return false;
      });
    };
    const done = () => {
      ctx.keys(null);
      const ms = now() - t0;
      const correct = results.filter((r) => r.ok).length;
      const weak = [...new Set(results.filter((r) => !r.ok).map((r) => r.i))].sort((a, b) => a - b);
      const fb = [];
      if (!weak.length) fb.push(`A clean walk in ${fmtTime(ms)}: about ${secs(ms / steps.length)} per location. The route is ready to carry images.`);
      else fb.push(`Hesitations at ${weak.map((i) => `<b>${i + 1}. ${esc(loci[i])}</b>`).join(', ')}. If the same locations keep catching you, they are too similar to a neighbour or too vague: change them in the builder.`);
      if (results.filter((r) => !r.ok && r.back).length > results.filter((r) => !r.ok && !r.back).length + 1) fb.push('Backwards was noticeably weaker. You know the route as a recital, each stop cued by the last. Practise jumping to a number directly.');
      ctx.store.log({ kind: 'palace', total: steps.length, correct, ms, palace: name });
      el.innerHTML = `<div class="ex">${resultHead(correct, steps.length, `<span>walked in <b class="mono">${fmtTime(ms)}</b></span>`)}${feedbackList(fb)}<div class="row"><button class="btn" data-again>Walk again</button></div></div>`;
      $('[data-again]', el).onclick = () => walk(el, opts, ctx);
      opts.onDone?.({ score: correct / steps.length, correct, total: steps.length, feedback: fb });
    };
    show();
  };
}

// ── association drills (cards and number pegs) ───────────────────
const FIELD_KEY = { img: 'img', p: 'p', a: 'a', o: 'o' };

function resolvePool(pool, kind, field, state) {
  const [type, arg = ''] = String(pool || 'all').split(':');
  if (kind === 'peg') {
    if (type === 'range') { const [a, b] = arg.split('-').map(Number); return { ids: Array.from({ length: b - a + 1 }, (_, i) => pegId(a + i)), note: '' }; }
    return { ids: Array.from({ length: 100 }, (_, i) => pegId(i)), note: '' };
  }
  if (type === 'suit') return { ids: DECK.filter((id) => arg.includes(id[1])), note: '' };
  if (type === 'ranks') return { ids: DECK.filter((id) => arg.includes(id[0])), note: '' };
  if (type === 'cards') return { ids: arg.split(',').filter((id) => DECK.includes(id)), note: '' };
  const sum = cardSummary(state, field);
  if (type === 'weak') return sum.weak.length >= 4 ? { ids: sum.weak, note: '' } : { ids: DECK.slice(), note: sum.seen ? 'Fewer than four cards are currently weak, so this session draws from the whole deck, weighted towards the weakest.' : 'No history yet, so this session draws from the whole deck. Weak cards will be picked out as you practise.' };
  if (type === 'due') return sum.due.length ? { ids: sum.due, note: '' } : { ids: DECK.slice(), note: 'Nothing is due for review right now. This session draws from the whole deck, weighted towards weaker cards.' };
  return { ids: DECK.slice(), note: '' };
}

export function drill(el, opts, ctx) {
  const { kind = 'card', mode = 'c2i', field = 'img', pool = 'all', order = false } = opts;
  const state = ctx.store.state;
  const { ids, note } = resolvePool(pool, kind, field, state);
  if (!ids.length) { el.innerHTML = '<div class="ex"><p>No cards match that selection.</p></div>'; return; }
  const count = order ? ids.length : Math.min(opts.count || 20, Math.max(ids.length, opts.count || 20));
  const pao = effectivePao(state.pao);
  const key = (id) => (kind === 'peg' ? `peg:${id}` : `${FIELD_KEY[field]}:${id}`);
  const answer = (id) => {
    if (kind === 'peg') return { text: effectivePeg(state, id).image, cue: '' };
    if (field === 'img') { const e = effectiveImage(state, id); return { text: e.image, cue: e.cue }; }
    return { text: pao[id][field], cue: '' };
  };
  const promptHTML = (id) => (kind === 'peg' ? `<div class="peg-num mono">${id}</div>` : cardHTML(id, 'lg'));
  const what = kind === 'peg' ? 'image' : field === 'img' ? 'image' : FIELD_NAME[field].toLowerCase();
  const modeName = { c2i: kind === 'peg' ? 'Number → image' : `Card → ${what}`, i2c: `${what[0].toUpperCase() + what.slice(1)} → card`, rapid: 'Rapid recognition' }[mode];
  const how = {
    c2i: `Bring the ${what} to mind, then reveal it and mark yourself honestly. Time to reveal is recorded.`,
    i2c: `You are shown the ${what}. Pick its card from the full deck.`,
    rapid: `Press <kbd>Space</kbd> (or tap the card) the moment you have the ${what}. Press <kbd>X</kbd> if it will not come. After five seconds it counts as a miss.`,
  }[mode];

  el.innerHTML = `<div class="ex"><h3>${esc(opts.label || modeName)}</h3><p>${how}</p>${note ? `<p class="small">${note}</p>` : ''}
    <p class="small">${count} ${kind === 'peg' ? 'numbers' : 'cards'}${order ? ', in order' : ''}.</p><button class="btn primary" data-go>Start <kbd>Enter</kbd></button></div>`;
  const start = () => run();
  $('[data-go]', el).onclick = start;
  ctx.keys((e) => { if (e.key === 'Enter') { start(); return true; } return false; });

  function run() {
    const results = [];
    let k = 0;
    let last = null;
    let lastNote = '';
    const record = (id, correct, ms, confusedWith = null) => {
      results.push({ id, correct, ms });
      ctx.store.state.stats[key(id)] = recordAttempt(ctx.store.state.stats[key(id)], { correct, ms, confusedWith });
      last = id;
      k++;
      k < count ? show() : done();
    };
    const head = () => `<div class="ex-bar"><span class="small">${esc(modeName)} · ${k + 1} of ${count}</span><span class="small last">${lastNote}</span></div>${progressBar(k / count)}`;

    function show() {
      const id = order ? ids[k] : pickNext(ids, Object.fromEntries(ids.map((x) => [x, ctx.store.state.stats[key(x)]])), Math.random, last);
      const ans = answer(id);
      const t0 = now();
      if (mode === 'i2c') {
        el.innerHTML = `<div class="ex drill">${head()}<div class="prompt"><div class="assoc">${esc(ans.text)}</div><div class="answer-line" data-ans>&nbsp;</div></div>${pickerHTML()}</div>`;
        let locked = false;
        const choose = (card) => {
          if (locked) return;
          locked = true;
          const ms = now() - t0;
          const ok = card === id;
          const btn = $(`[data-pick="${card}"]`, el);
          btn?.classList.add(ok ? 'right' : 'wrong');
          if (!ok) $(`[data-pick="${id}"]`, el)?.classList.add('right');
          $('[data-ans]', el).innerHTML = ok ? `<span class="ok">${cardInline(id)} correct · ${secs(ms)}</span>` : `<span class="bad">You chose ${cardInline(card)} (${esc(answer(card).text)}). It is ${cardInline(id)}. <kbd>Space</kbd> to continue</span>`;
          lastNote = '';
          const go = () => record(id, ok, ms, ok ? null : card);
          if (ok) ctx.after(450, go);
          else ctx.keys((e) => { if (e.key === ' ' || e.key === 'Enter') { go(); return true; } return false; });
          if (!ok) $('[data-ans]', el).onclick = go;
        };
        $$('[data-pick]', el).forEach((b) => { b.onclick = () => choose(b.dataset.pick); });
        const typedKeys = cardKeys(choose, (r) => { if (!locked) $('[data-ans]', el).innerHTML = r ? `<span class="muted mono">${r === 'T' ? '10' : r}…</span>` : '&nbsp;'; });
        ctx.keys((e) => typedKeys(e));
        return;
      }
      if (mode === 'rapid') {
        el.innerHTML = `<div class="ex drill">${head()}<button class="prompt tap" data-tap aria-label="I have it">${promptHTML(id)}<div class="answer-line" data-ans>&nbsp;</div></button>
          <div class="row center"><button class="btn" data-blank>Blank <kbd>X</kbd></button><button class="btn primary" data-got>Got it <kbd>Space</kbd></button></div></div>`;
        let over = false;
        const got = () => { if (over) return; over = true; stop(); const ms = now() - t0; lastNote = `${kind === 'peg' ? id : cardInline(id)} = ${esc(ans.text)} · ${secs(ms)}`; record(id, true, ms); };
        const blank = (why) => {
          if (over) return;
          over = true; stop();
          $('[data-ans]', el).innerHTML = `<span class="bad">${why}</span> <b>${esc(ans.text)}</b> · <kbd>Space</kbd>`;
          lastNote = '';
          const go = () => record(id, false, now() - t0);
          $('[data-tap]', el).onclick = go;
          ctx.keys((e) => { if (e.key === ' ' || e.key === 'Enter') { go(); return true; } return false; });
        };
        const stop = ctx.after(5000, () => blank('Too slow:'));
        $('[data-tap]', el).onclick = got;
        $('[data-got]', el).onclick = got;
        $('[data-blank]', el).onclick = () => blank('It is');
        ctx.keys((e) => { if (e.key === ' ') { got(); return true; } if (e.key.toLowerCase() === 'x') { blank('It is'); return true; } return false; });
        return;
      }
      // c2i
      el.innerHTML = `<div class="ex drill">${head()}<div class="prompt">${promptHTML(id)}<div class="answer-line" data-ans>&nbsp;</div><div class="small cue" data-cue>&nbsp;</div></div>
        <div class="row center" data-actions><button class="btn primary" data-reveal>Reveal <kbd>Space</kbd></button></div></div>`;
      let ms = null;
      const reveal = () => {
        if (ms != null) return;
        ms = now() - t0;
        $('[data-ans]', el).textContent = ans.text;
        $('[data-cue]', el).textContent = ans.cue || ' ';
        $('[data-actions]', el).innerHTML = '<button class="btn" data-no>Missed <kbd>F</kbd></button><button class="btn primary" data-yes>Knew it <kbd>J</kbd></button>';
        $('[data-yes]', el).onclick = () => record(id, true, ms);
        $('[data-no]', el).onclick = () => record(id, false, ms);
      };
      lastNote = '';
      $('[data-reveal]', el).onclick = reveal;
      ctx.keys((e) => {
        if (ms == null && (e.key === ' ' || e.key === 'Enter')) { reveal(); return true; }
        if (ms != null && e.key.toLowerCase() === 'j') { record(id, true, ms); return true; }
        if (ms != null && e.key.toLowerCase() === 'f') { record(id, false, ms); return true; }
        return false;
      });
    }

    function done() {
      ctx.keys(null);
      const s = scoreDrill(results);
      const name = (id) => (kind === 'peg' ? `<b class="mono">${id}</b>` : cardInline(id));
      const fb = [];
      if (s.missed.length) fb.push(`Missed: ${s.missed.map((id) => `${name(id)} <span class="muted">${esc(answer(id).text)}</span>`).join(' · ')}. These will come back within ten minutes of practice time.`);
      if (s.accuracy >= 0.9 && s.medianMs > 2500) fb.push(`Accurate (${pct(s.accuracy)}) but ${secs(s.medianMs)} per item. You know them; now make them quick. Rapid recognition is the drill for this.`);
      else if (s.accuracy < 0.75) fb.push(`${pct(s.accuracy)} is below the level where speed work helps. Stay with untimed practice, and consider changing the image for any card missed in several sessions.`);
      else if (s.accuracy >= 0.9 && s.medianMs <= 1500) fb.push(`${pct(s.accuracy)} at ${secs(s.medianMs)} median: these are becoming automatic.`);
      if (s.slowest.length && s.correct > 5) fb.push(`Slowest correct answers: ${s.slowest.slice(0, 3).map((id) => `${name(id)} (${secs(results.find((r) => r.id === id && r.correct).ms)})`).join(', ')}.`);
      const poolName = String(pool).split(':')[0];
      ctx.store.log({ kind: 'drill', mode: poolName === 'weak' || poolName === 'due' ? poolName : mode, field: kind === 'peg' ? 'peg' : field, total: s.total, correct: s.correct, medianMs: Math.round(s.medianMs) || null });
      el.innerHTML = `<div class="ex">${resultHead(s.correct, s.total, `<span>median <b class="mono">${secs(s.medianMs)}</b></span><span><b class="mono">${s.perMinute.toFixed(0)}</b> correct per minute</span>`)}${feedbackList(fb)}
        <div class="row"><button class="btn" data-again>Again</button>${s.missed.length >= 2 && kind === 'card' ? `<a class="btn" href="#/train/${mode === 'i2c' ? 'i2c' : 'c2i'}?field=${field}&pool=cards:${s.missed.join(',')}">Drill only the missed cards</a>` : ''}</div></div>`;
      $('[data-again]', el).onclick = () => drill(el, opts, ctx);
      opts.onDone?.({ score: s.accuracy, correct: s.correct, total: s.total, feedback: fb });
    }
    show();
  }
}

// ── PAO scenes ───────────────────────────────────────────────────
export function pao(el, opts, ctx) {
  const { dir = 'encode', count = 6 } = opts;
  const sys = effectivePao(ctx.store.state.pao);
  const PARTS = [['p', 'person', 'Person'], ['a', 'action', 'Action'], ['o', 'object', 'Object']];
  el.innerHTML = `<div class="ex"><h3>${dir === 'encode' ? 'Three cards → one scene' : 'Scene → three cards'}</h3>
    <p>${dir === 'encode' ? 'Three cards appear. Build the scene: first card\'s person, second card\'s action, third card\'s object. Reveal to check, then mark each part.' : 'Read the scene and pick the three cards in order: whose person, whose action, whose object.'}</p>
    <p class="small">${count} scenes.</p><button class="btn primary" data-go>Start <kbd>Enter</kbd></button></div>`;
  $('[data-go]', el).onclick = run;
  ctx.keys((e) => { if (e.key === 'Enter') { run(); return true; } return false; });

  function run() {
    const results = [];
    const times = [];
    let k = 0;
    const save = (cards, oks, ms, picks = []) => {
      cards.forEach((id, j) => {
        const key = `${PARTS[j][0]}:${id}`;
        ctx.store.state.stats[key] = recordAttempt(ctx.store.state.stats[key], { correct: oks[j], ms: ms / 3, confusedWith: !oks[j] && picks[j] ? picks[j] : null });
        results.push({ id, part: PARTS[j][0], correct: oks[j], ms: ms / 3 });
      });
      times.push(ms);
      k++;
      k < count ? show() : done();
    };
    const head = () => `<div class="ex-bar"><span class="small">Scene ${k + 1} of ${count}</span></div>${progressBar(k / count)}`;
    const breakdown = (cards, oks = [true, true, true]) => `<div class="pao-parts">${cards.map((id, j) => `<div class="${oks[j] ? '' : 'miss'}">${cardHTML(id, 'sm')}<span class="small">${PARTS[j][2]}</span><b>${esc(sys[id][PARTS[j][0]])}</b></div>`).join('')}</div>`;

    function show() {
      const cards = newDeck(3);
      const scene = encodeTriple(cards, sys);
      const t0 = now();
      if (dir === 'encode') {
        el.innerHTML = `<div class="ex drill">${head()}<div class="prompt"><div class="triple">${cards.map((c) => cardHTML(c)).join('')}</div><div class="answer-line" data-ans>&nbsp;</div></div>
          <div data-parts></div><div class="row center" data-actions><button class="btn primary" data-reveal>Reveal <kbd>Space</kbd></button></div></div>`;
        let ms = null;
        const oks = [true, true, true];
        const paint = () => {
          $('[data-parts]', el).innerHTML = `<div class="pao-mark">${PARTS.map((p, j) => `<button class="btn chip ${oks[j] ? 'on' : 'off'}" data-j="${j}"><kbd>${j + 1}</kbd> ${p[2]}: <b>${esc(sys[cards[j]][p[0]])}</b> ${oks[j] ? '✓' : '✗'}</button>`).join('')}</div>`;
          $$('[data-j]', el).forEach((b) => { b.onclick = () => { oks[b.dataset.j] = !oks[b.dataset.j]; paint(); }; });
        };
        const reveal = () => {
          if (ms != null) return;
          ms = now() - t0;
          $('[data-ans]', el).textContent = scene.text;
          paint();
          $('[data-actions]', el).innerHTML = '<span class="small">Untick any part you got wrong or had to work out.</span><button class="btn primary" data-next>Next <kbd>Enter</kbd></button>';
          $('[data-next]', el).onclick = () => save(cards, oks, ms);
        };
        $('[data-reveal]', el).onclick = reveal;
        ctx.keys((e) => {
          if (ms == null && (e.key === ' ' || e.key === 'Enter')) { reveal(); return true; }
          if (ms != null && ['1', '2', '3'].includes(e.key)) { oks[e.key - 1] = !oks[e.key - 1]; paint(); return true; }
          if (ms != null && (e.key === 'Enter' || e.key === ' ')) { save(cards, oks, ms); return true; }
          return false;
        });
        return;
      }
      const picks = [];
      const paint = () => {
        $('[data-slots]', el).innerHTML = PARTS.map((p, j) => `<div class="slot3 ${j === picks.length ? 'active' : ''}"><span class="small">${p[2]}</span>${cardHTML(picks[j] || null, 'sm')}</div>`).join('');
        $$('[data-pick]', el).forEach((b) => { b.disabled = picks.includes(b.dataset.pick); });
      };
      el.innerHTML = `<div class="ex drill">${head()}<div class="prompt"><div class="assoc scene">${esc(scene.text)}</div><div class="slots3" data-slots></div><div class="answer-line" data-ans>&nbsp;</div></div>${pickerHTML()}
        <div class="row center"><button class="btn quiet" data-undo>Undo <kbd>Backspace</kbd></button></div></div>`;
      paint();
      let locked = false;
      const choose = (card) => {
        if (locked || picks.includes(card)) return;
        picks.push(card);
        paint();
        if (picks.length < 3) return;
        locked = true;
        const ms = now() - t0;
        const oks = cards.map((c, j) => picks[j] === c);
        $('[data-ans]', el).innerHTML = oks.every(Boolean) ? `<span class="ok">Correct · ${secs(ms)}</span>` : '<span class="bad">Not quite. The scene decodes as:</span>';
        const next = () => save(cards, oks, ms, picks);
        if (oks.every(Boolean)) ctx.after(600, next);
        else {
          $('[data-slots]', el).outerHTML = breakdown(cards, oks);
          $('.picker', el).outerHTML = '<div class="row center"><button class="btn primary" data-next>Next <kbd>Space</kbd></button></div>';
          $('[data-next]', el).onclick = next;
          ctx.keys((e) => { if (e.key === ' ' || e.key === 'Enter') { next(); return true; } return false; });
        }
      };
      const undo = () => { if (!locked && picks.length) { picks.pop(); paint(); } };
      $$('[data-pick]', el).forEach((b) => { b.onclick = () => choose(b.dataset.pick); });
      $('[data-undo]', el).onclick = undo;
      const typedKeys = cardKeys(choose);
      ctx.keys((e) => { if (e.key === 'Backspace') { undo(); return true; } return typedKeys(e); });
    }

    function done() {
      ctx.keys(null);
      const correct = results.filter((r) => r.correct).length;
      const by = PARTS.map(([f, , nameP]) => ({ name: nameP, n: results.filter((r) => r.part === f && !r.correct).length }));
      const worst = by.slice().sort((a, b) => b.n - a.n)[0];
      const med = median(times);
      const fb = [];
      if (correct === results.length) fb.push(`Every part of every scene correct. Median ${secs(med)} per scene${dir === 'encode' ? (med > 5000 ? '; the first target is under 5 seconds.' : med > 3000 ? '; next target, under 3 seconds.' : ', which is deck-ready pace.') : '.'}`);
      else fb.push(`Errors by part: ${by.map((b) => `${b.name.toLowerCase()} ${b.n}`).join(', ')}. ${worst.n ? `The ${worst.name.toLowerCase()} column is the weakest: drill it by itself before more scenes.` : ''}`);
      if (dir === 'decode' && by[1].n > by[0].n) fb.push('Actions are being decoded as their owner in the wrong slot, or not at all. Ask "whose move is that?" as a separate question for every scene.');
      ctx.store.log({ kind: 'pao', mode: dir, total: results.length, correct, medianMs: Math.round(med) });
      el.innerHTML = `<div class="ex">${resultHead(correct, results.length, `<span>median <b class="mono">${secs(med)}</b> per scene</span>`)}${feedbackList(fb)}
        <div class="row"><button class="btn" data-again>Again</button>${worst.n ? `<a class="btn" href="#/train/pao-${worst.name[0].toLowerCase()}">Drill ${worst.name.toLowerCase()}s</a>` : ''}</div></div>`;
      $('[data-again]', el).onclick = () => pao(el, opts, ctx);
      opts.onDone?.({ score: correct / results.length, correct, total: results.length, feedback: fb });
    }
    show();
  }
}

// ── deck run-through: pure recognition speed, no recall ──────────
export function flash(el, opts, ctx) {
  const { n = 52 } = opts;
  const best = Math.min(...ctx.store.state.history.filter((h) => h.kind === 'flash' && h.total === n).map((h) => h.ms), Infinity);
  el.innerHTML = `<div class="ex"><h3>Deck run-through · ${n} cards</h3>
    <p>Page through a shuffled deck, seeing each card's image before you move on. No palace and no recall: this measures recognition speed alone.</p>
    <p class="small">${Number.isFinite(best) ? `Your best: <b class="mono">${fmtTime(best)}</b>. Target: <b class="mono">${fmtTime(best * 0.9)}</b>.` : 'First targets: under 60 seconds, then under 40.'}</p>
    <button class="btn primary" data-go>Start <kbd>Enter</kbd></button></div>`;
  const run = () => {
    const deck = newDeck(n);
    let i = 0;
    const t0 = now();
    const paint = () => {
      el.innerHTML = `<div class="ex drill"><div class="ex-bar"><span class="small">${i + 1} of ${n}</span><span class="timer mono" data-t></span></div>${progressBar(i / n)}
        <button class="prompt tap" data-tap aria-label="Next card">${cardHTML(deck[i], 'lg')}</button><p class="small center">Tap the card or press <kbd>Space</kbd> / <kbd>→</kbd></p></div>`;
      $('[data-tap]', el).onclick = next;
      $('[data-t]', el).textContent = fmtTime(now() - t0);
    };
    const tick = ctx.every(100, () => { const t = $('[data-t]', el); if (t) t.textContent = fmtTime(now() - t0); });
    const next = () => {
      i++;
      if (i < n) return paint();
      tick();
      ctx.keys(null);
      const ms = now() - t0;
      const fb = [`${(n / (ms / 1000)).toFixed(2)} cards per second, ${secs(ms / n, 2)} per card. ${ms / n < 1000 ? 'Recognition is no longer what limits your deck.' : ms / n < 1500 ? 'Close to automatic. The remaining time is in a handful of slow cards: weak-card training will find them.' : 'At this pace, recognition alone takes most of a two-minute budget. Keep up the rapid-recognition drill.'}`];
      if (Number.isFinite(best)) fb.push(ms < best ? `A new best, by ${secs(best - ms)}.` : `Your best is ${fmtTime(best)}.`);
      ctx.store.log({ kind: 'flash', total: n, correct: n, ms });
      el.innerHTML = `<div class="ex"><div class="result-head"><div class="big-score mono">${fmtTime(ms)}</div><div class="result-meta"><span>${n} cards</span></div></div>${feedbackList(fb)}<div class="row"><button class="btn" data-again>Again</button></div></div>`;
      $('[data-again]', el).onclick = () => flash(el, opts, ctx);
      opts.onDone?.({ score: 1, correct: n, total: n, feedback: fb });
    };
    ctx.keys((e) => { if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { next(); return true; } return false; });
    paint();
  };
  $('[data-go]', el).onclick = run;
  ctx.keys((e) => { if (e.key === 'Enter') { run(); return true; } return false; });
}

export { RANKS, cardName, cardLabel };
