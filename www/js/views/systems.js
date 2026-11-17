// My Systems: memory palaces, card images, the PAO system, number images, and data.
// Suggestions are always drawn differently from saved entries and never replace them.

import { DECK, SUITS, RANKS, SUIT_NAME, SUIT_SYM, cardName, newDeck, isCard } from '../core/cards.js';
import { EXAMPLE_IMAGES, EXAMPLE_PAO, EXAMPLE_PEGS, MAJOR, pegId, savedImageCount } from '../core/systems.js';
import { effectivePao, encodeTriple, findConflicts, paoCompletion, FIELDS, FIELD_NAME } from '../core/pao.js';
import { allLoci, uid } from '../core/store.js';
import { findIdeas } from '../core/ideas.js';
import { cardStatHTML } from './home.js';
import { esc, $, $$, cardHTML, cardInline, progressBar, shrinkImage, download, keepFocus } from '../ui/dom.js';

const TABS = [['palaces', 'Memory palaces'], ['cards', 'Card images'], ['pao', 'PAO system'], ['numbers', 'Numbers'], ['ideas', 'Idea finder'], ['data', 'Data']];

export function systems(main, route, ctx) {
  const tab = TABS.some(([k]) => k === route.parts[1]) ? route.parts[1] : 'palaces';
  main.innerHTML = `
    <header class="page-head"><h1 tabindex="-1">My Systems</h1><p class="lede">The reusable parts of your memory: the places you store things, and the fixed images you store. Everything here is saved on this device as you type.</p></header>
    <nav class="tabs" aria-label="Systems">${TABS.map(([k, v]) => `<a href="#/systems/${k}" class="${k === tab ? 'on' : ''}" ${k === tab ? 'aria-current="page"' : ''}>${v}</a>`).join('')}</nav>
    <div data-tab></div>`;
  ({ palaces, cards, pao, numbers, ideas, data })[tab]($('[data-tab]', main), route, ctx);
}

// ── palaces ──────────────────────────────────────────────────────
const TEMPLATE = () => ({
  id: uid(), name: 'Home (template: rename everything)',
  areas: [['Hall', ['Doormat', 'Coat hooks', 'Mirror', 'Shoe rack', 'Radiator']], ['Kitchen', ['Fridge', 'Sink', 'Hob', 'Kettle', 'Bin']], ['Living room', ['Armchair', 'Bookshelf', 'Window', 'Television', 'Sofa']]]
    .map(([name, loci]) => ({ id: uid(), name, loci: loci.map((l) => ({ id: uid(), name: l, note: '', img: '' })) })),
});

function palaces(el, route, ctx) {
  const store = ctx.store;
  let currentId = route.query.id || store.state.palaces[0]?.id || null;
  let confirmDelete = false;
  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };

  const paint = (focusSel = null) => {
    const list = store.state.palaces;
    const p = list.find((x) => x.id === currentId) || list[0] || null;
    currentId = p?.id || null;
    const loci = p ? allLoci(p) : [];
    let n = 0;
    el.innerHTML = `
      <section class="panel"><div class="panel-h"><h2>Your palaces</h2><span class="small mono">${list.reduce((a, x) => a + allLoci(x).length, 0)} locations in total</span></div>
        <div class="chips">${list.map((x) => `<button class="chip ${x.id === currentId ? 'on' : ''}" data-open="${x.id}">${esc(x.name)} <span class="mono small">${allLoci(x).length}</span></button>`).join('')}
          <button class="chip add" data-new>+ New palace</button><button class="chip add" data-template>+ Start from a template</button></div>
        ${list.length ? '' : '<p>A palace is a route through a place you know, with fixed stopping points. Start with your home: one area per room, about five locations in each. <a href="#/learn/build-palace">The lesson</a> explains how to choose them.</p>'}
      </section>
      ${p ? `
      <section class="panel"><div class="panel-h"><h2>Route</h2><span class="small mono">${loci.length} locations · ${p.areas.length} area${p.areas.length === 1 ? '' : 's'}</span></div>
        ${loci.length ? `<ol class="route">${p.areas.map((a) => (a.loci.length ? `<li class="route-area"><span class="small">${esc(a.name)}</span><ol>${a.loci.map((l) => `<li><span class="mono">${++n}</span>${l.img ? `<img src="${l.img}" alt="">` : ''}${esc(l.name)}</li>`).join('')}</ol></li>` : '')).join('')}</ol>` : '<p class="small">No locations yet. Add an area below, then type locations into it.</p>'}
        <p class="small">Holds ${loci.length} single images, ${loci.length * 2} cards in pairs, or ${loci.length * 3} cards with PAO. ${loci.length >= 18 ? 'Enough for a full deck with PAO.' : `A full deck needs 18 with PAO, 26 in pairs.`}</p>
        <div class="row"><a class="btn ${loci.length >= 3 ? 'primary' : ''}" href="#/train/walk?palace=${p.id}">Practise the walk</a><a class="btn" href="#/train/words?n=${Math.min(20, Math.max(5, loci.length))}&palace=1">Memorise words here</a></div>
      </section>
      <section class="panel palace-edit"><div class="panel-h"><h2>Edit</h2>
        <div class="row tight"><button class="btn quiet" data-dup>Duplicate</button><button class="btn quiet danger" data-del>${confirmDelete ? 'Really delete?' : 'Delete palace'}</button></div></div>
        <label class="field"><span>Palace name</span><input type="text" data-pname value="${esc(p.name)}" maxlength="80"></label>
        ${p.areas.map((a, ai) => `
          <div class="area" data-area="${ai}">
            <div class="area-h"><input type="text" data-aname="${ai}" value="${esc(a.name)}" aria-label="Area name" maxlength="80">
              <button class="icon" data-aup="${ai}" aria-label="Move area up" ${ai === 0 ? 'disabled' : ''}>↑</button><button class="icon" data-adown="${ai}" aria-label="Move area down" ${ai === p.areas.length - 1 ? 'disabled' : ''}>↓</button><button class="icon danger" data-adel="${ai}" aria-label="Delete area ${esc(a.name)}">×</button></div>
            <ol class="loci">${a.loci.map((l, li) => `<li>
              <input type="text" data-lname="${ai}:${li}" value="${esc(l.name)}" aria-label="Location name" maxlength="80">
              <input type="text" class="note" data-lnote="${ai}:${li}" value="${esc(l.note)}" placeholder="what it looks like (optional)" aria-label="Description" maxlength="300">
              ${l.img ? `<button class="thumb" data-limgx="${ai}:${li}" title="Remove image"><img src="${l.img}" alt="Location image; click to remove"></button>` : `<label class="icon" title="Add an image"><input type="file" accept="image/*" data-limg="${ai}:${li}" hidden>▣<span class="sr">Add an image</span></label>`}
              <button class="icon" data-lup="${ai}:${li}" aria-label="Move up" ${ai === 0 && li === 0 ? 'disabled' : ''}>↑</button><button class="icon" data-ldown="${ai}:${li}" aria-label="Move down" ${ai === p.areas.length - 1 && li === a.loci.length - 1 ? 'disabled' : ''}>↓</button><button class="icon danger" data-ldel="${ai}:${li}" aria-label="Delete ${esc(l.name)}">×</button></li>`).join('')}</ol>
            <form class="add-locus" data-ladd="${ai}"><input type="text" data-newin="${ai}" placeholder="Add a location to ${esc(a.name)} and press Enter" aria-label="New location in ${esc(a.name)}" maxlength="80"><button class="btn">Add</button></form>
          </div>`).join('')}
        <form class="add-locus add-area" data-aadd><input type="text" placeholder="Add an area (a room, a stretch of street…)" aria-label="New area" maxlength="80"><button class="btn">Add area</button></form>
        <p class="small">Moving a location past the end of its area carries it into the next one. Numbers follow the order shown.</p>
      </section>` : ''}`;

    const save = (focus) => { store.save(); if (focus) paint(focus); else keepFocus(el, paint); };
    $$('[data-open]', el).forEach((b) => { b.onclick = () => { currentId = b.dataset.open; confirmDelete = false; paint(); }; });
    $('[data-new]', el).onclick = () => { const np = { id: uid(), name: 'New palace', areas: [{ id: uid(), name: 'First area', loci: [] }] }; store.state.palaces.push(np); currentId = np.id; save('[data-pname]'); };
    $('[data-template]', el).onclick = () => { const np = TEMPLATE(); store.state.palaces.push(np); currentId = np.id; save('[data-pname]'); };
    if (!p) return;
    $('[data-pname]', el).onchange = (e) => { p.name = e.target.value.trim() || 'Untitled palace'; save(); };
    $('[data-dup]', el).onclick = () => {
      const copy = { id: uid(), name: `${p.name} (copy)`, areas: p.areas.map((a) => ({ id: uid(), name: a.name, loci: a.loci.map((l) => ({ ...l, id: uid() })) })) };
      store.state.palaces.push(copy); currentId = copy.id; save('[data-pname]');
    };
    $('[data-del]', el).onclick = () => {
      if (!confirmDelete) { confirmDelete = true; return paint('[data-del]'); }
      store.state.palaces = store.state.palaces.filter((x) => x.id !== p.id); currentId = null; confirmDelete = false; save();
    };
    const at = (s) => s.split(':').map(Number);
    $$('[data-aname]', el).forEach((i) => { i.onchange = () => { p.areas[i.dataset.aname].name = i.value.trim() || 'Area'; save(); }; });
    $$('[data-aup]', el).forEach((b) => { b.onclick = () => { move(p.areas, Number(b.dataset.aup), -1); save(); }; });
    $$('[data-adown]', el).forEach((b) => { b.onclick = () => { move(p.areas, Number(b.dataset.adown), 1); save(); }; });
    $$('[data-adel]', el).forEach((b) => { b.onclick = () => { const a = p.areas[b.dataset.adel]; if (a.loci.length && b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = `delete ${a.loci.length}?`; return; } p.areas.splice(Number(b.dataset.adel), 1); save(); }; });
    $$('[data-lname]', el).forEach((i) => { i.onchange = () => { const [a, l] = at(i.dataset.lname); p.areas[a].loci[l].name = i.value.trim() || 'Location'; save(); }; });
    $$('[data-lnote]', el).forEach((i) => { i.onchange = () => { const [a, l] = at(i.dataset.lnote); p.areas[a].loci[l].note = i.value.trim(); store.save(); }; });
    $$('[data-ldel]', el).forEach((b) => { b.onclick = () => { const [a, l] = at(b.dataset.ldel); p.areas[a].loci.splice(l, 1); save(); }; });
    const shift = (a, l, d) => {
      const loc = p.areas[a].loci;
      if (l + d >= 0 && l + d < loc.length) { move(loc, l, d); return `[data-l${d < 0 ? 'up' : 'down'}="${a}:${l + d}"]`; }
      const to = a + d;
      if (to < 0 || to >= p.areas.length) return null;
      const [item] = loc.splice(l, 1);
      if (d < 0) p.areas[to].loci.push(item); else p.areas[to].loci.unshift(item);
      return `[data-lname="${to}:${d < 0 ? p.areas[to].loci.length - 1 : 0}"]`;
    };
    $$('[data-lup]', el).forEach((b) => { b.onclick = () => { const [a, l] = at(b.dataset.lup); save(shift(a, l, -1)); }; });
    $$('[data-ldown]', el).forEach((b) => { b.onclick = () => { const [a, l] = at(b.dataset.ldown); save(shift(a, l, 1)); }; });
    $$('[data-limg]', el).forEach((i) => { i.onchange = async () => { const [a, l] = at(i.dataset.limg); try { p.areas[a].loci[l].img = await shrinkImage(i.files[0]); save(); } catch (e) { ctx.toast(e.message); } }; });
    $$('[data-limgx]', el).forEach((b) => { b.onclick = () => { const [a, l] = at(b.dataset.limgx); p.areas[a].loci[l].img = ''; save(); }; });
    $$('[data-ladd]', el).forEach((f) => { f.onsubmit = (e) => { e.preventDefault(); const v = $('input', f).value.trim(); if (!v) return; p.areas[f.dataset.ladd].loci.push({ id: uid(), name: v, note: '', img: '' }); save(`[data-ladd="${f.dataset.ladd}"] input`); }; });
    $('[data-aadd]', el).onsubmit = (e) => { e.preventDefault(); const v = $('input', e.target).value.trim(); if (!v) return; p.areas.push({ id: uid(), name: v, loci: [] }); save(`[data-ladd="${p.areas.length - 1}"] input`); };
    if (focusSel) $(focusSel, el)?.focus();
  };
  paint();
}

// ── card images ──────────────────────────────────────────────────
function cards(el, route, ctx) {
  const store = ctx.store;
  let sel = isCard(route.query.card) ? route.query.card : 'AS';
  const paint = (focus = false) => {
    const st = store.state;
    const mine = st.cardImages[sel];
    const ex = EXAMPLE_IMAGES[sel];
    el.innerHTML = `
      <section class="panel"><div class="panel-h"><h2>All 52 cards</h2><span class="small mono">${savedImageCount(st)}/52 your own</span></div>
        ${progressBar(savedImageCount(st) / 52, 'Images saved')}
        <div class="img-grid">${SUITS.map((s) => `<div class="img-row">${RANKS.map((r) => { const id = r + s; const own = st.cardImages[id]?.image; return `<button class="img-cell ${id === sel ? 'sel' : ''} ${own ? 'own' : 'sugg'}" data-card="${id}" aria-label="${cardName(id)}: ${own ? esc(own) : `suggested ${esc(EXAMPLE_IMAGES[id].image)}`}">${cardInline(id)}<span>${esc(own || EXAMPLE_IMAGES[id].image)}</span></button>`; }).join('')}</div>`).join('')}</div>
        <p class="small"><span class="key own">Your saved image</span> <span class="key sugg">Suggestion (not saved)</span> Practice uses your image where you have one and the suggestion elsewhere.</p>
        <div class="row"><button class="btn" data-adopt ${savedImageCount(st) === 52 ? 'hidden' : ''}>Save the suggestions for the ${52 - savedImageCount(st)} cards I have not set</button></div>
      </section>
      <section class="panel card-edit">
        <div class="edit-card">${cardHTML(sel, 'lg')}<div class="row tight"><button class="btn quiet" data-prev aria-label="Previous card">←</button><button class="btn quiet" data-next aria-label="Next card">→</button></div></div>
        <form class="edit-form" autocomplete="off"><h2>${cardName(sel)}</h2>
          <label class="field"><span>Your image</span><input type="text" name="image" value="${esc(mine?.image || '')}" placeholder="not set" maxlength="80"></label>
          <label class="field"><span>Cue: the specific version you picture</span><input type="text" name="cue" value="${esc(mine?.cue || '')}" placeholder="e.g. the red Fiesta I learned to drive in" maxlength="300"></label>
          <div class="suggestion"><span class="small">Suggestion</span><b>${esc(ex.image)}</b><span class="small">${esc(ex.cue)}</span><button type="button" class="btn quiet" data-use>Use this</button></div>
          <div class="row"><button class="btn primary">Save and go to next <kbd>Enter</kbd></button>${mine ? '<button type="button" class="btn quiet danger" data-clear>Remove my entry</button>' : ''}<span class="small" data-saved></span></div>
          <h3>Record</h3>${cardStatHTML(st, sel, 'img')}
          <div class="row"><a class="btn quiet" href="#/train/suit?set=${sel[1]}">Drill ${SUIT_NAME[sel[1]].toLowerCase()}</a><a class="btn quiet" href="#/train/i2c">Image → card drill</a></div>
        </form>
      </section>`;
    const form = $('form', el);
    const step = (d) => { sel = DECK[(DECK.indexOf(sel) + d + 52) % 52]; paint(true); };
    const persist = () => {
      const image = form.image.value.trim();
      if (image) st.cardImages[sel] = { image, cue: form.cue.value.trim() };
      else if (st.cardImages[sel]) delete st.cardImages[sel];
      store.save();
    };
    $$('[data-card]', el).forEach((b) => { b.onclick = () => { sel = b.dataset.card; paint(true); }; });
    $('[data-prev]', el).onclick = () => step(-1);
    $('[data-next]', el).onclick = () => step(1);
    $('[data-use]', el).onclick = () => { form.image.value = ex.image; if (!form.cue.value) form.cue.value = ex.cue; form.image.focus(); };
    form.onsubmit = (e) => { e.preventDefault(); persist(); step(1); };
    form.image.onchange = () => { persist(); $('[data-saved]', el).textContent = 'Saved'; };
    form.cue.onchange = form.image.onchange;
    const clr = $('[data-clear]', el);
    if (clr) clr.onclick = () => { delete st.cardImages[sel]; store.save(); paint(true); };
    $('[data-adopt]', el).onclick = () => {
      // Only fills cards with no saved entry; existing entries are left exactly as they are.
      for (const id of DECK) if (!st.cardImages[id]?.image) st.cardImages[id] = { ...EXAMPLE_IMAGES[id] };
      store.save(); paint();
    };
    if (focus) form.image.focus();
  };
  paint();
}

// ── PAO ──────────────────────────────────────────────────────────
function pao(el, route, ctx) {
  const store = ctx.store;
  let suit = isCard(route.query.card) ? route.query.card[1] : 'H';
  let triple = ['KH', '7S', 'AC'];
  const paint = () => {
    const st = store.state;
    const sys = effectivePao(st.pao);
    const comp = paoCompletion(st.pao);
    const conflicts = findConflicts(sys);
    const scene = encodeTriple(triple, sys);
    el.innerHTML = `
      <section class="panel"><div class="panel-h"><h2>Person · Action · Object</h2><span class="small mono">${comp.filled}/156 your own</span></div>
        ${progressBar(comp.fraction, 'PAO entries saved')}
        <p class="small">Grey text is the example system, shown as a placeholder. Type over it to save your own; clear a box to return to the example. Card 1 of a triple uses the person, card 2 the action, card 3 the object.</p>
        <div class="seg" data-suit>${SUITS.map((s) => `<button data-v="${s}" class="${s === suit ? 'on' : ''} ${s === 'H' || s === 'D' ? 'red' : ''}">${SUIT_SYM[s]} ${SUIT_NAME[s]} <span class="mono small">${RANKS.reduce((a, r) => a + FIELDS.filter((f) => st.pao[r + s]?.[f]).length, 0)}/39</span></button>`).join('')}</div>
        <div class="cmp-wrap"><table class="pao-table"><thead><tr><th>Card</th><th>Person</th><th>Action</th><th>Object</th></tr></thead><tbody>
          ${RANKS.map((r) => { const id = r + suit; return `<tr><th scope="row">${cardHTML(id, 'sm')}</th>${FIELDS.map((f) => `<td><input type="text" data-pao="${id}:${f}" value="${esc(st.pao[id]?.[f] || '')}" placeholder="${esc(EXAMPLE_PAO[id][f])}" aria-label="${cardName(id)} ${FIELD_NAME[f]}" maxlength="80"></td>`).join('')}</tr>`; }).join('')}
        </tbody></table></div>
        <div class="row"><button class="btn" data-fill>Save the examples into my ${156 - comp.filled} empty boxes</button><button class="btn quiet" data-export>Export PAO</button><label class="btn quiet">Import PAO<input type="file" accept="application/json,.json" data-import hidden></label></div>
      </section>
      <section class="panel"><div class="panel-h"><h2>Checks</h2><span class="small mono">${conflicts.length} to look at</span></div>
        ${conflicts.length ? `<ul class="conflicts">${conflicts.map((c) => `<li><span class="tag ${c.type === 'duplicate' ? 'bad' : ''}">${c.type === 'duplicate' ? `duplicate ${FIELD_NAME[c.field].toLowerCase()}` : 'shared word'}</span> “${esc(c.value)}” on ${c.cards.map((id) => `<a href="#/systems/pao?card=${id}">${cardInline(id)}</a>`).join(', ')}<span class="small">${c.type === 'duplicate' ? 'A scene using it cannot be decoded to one card.' : 'Likely to blur at speed. Make one of them more specific.'}</span></li>`).join('')}</ul>` : '<p class="small">No duplicate actions, objects or people, and no shared key words. Every scene decodes to exactly three cards.</p>'}
      </section>
      <section class="panel"><div class="panel-h"><h2>Scene generator</h2><button class="btn" data-deal>Deal three cards</button></div>
        <div class="pao-parts big">${triple.map((id, j) => `<div>${cardHTML(id)}<span class="small">${FIELD_NAME[FIELDS[j]]}</span><b>${esc(sys[id][FIELDS[j]])}</b></div>`).join('')}</div>
        <p class="scene-line">${esc(scene.text)}.</p>
        <div class="row"><a class="btn" href="#/train/pao-encode">Scene-building drill</a><a class="btn" href="#/train/pao-decode">Decoding drill</a><a class="btn quiet" href="#/train/pao-p">People</a><a class="btn quiet" href="#/train/pao-a">Actions</a><a class="btn quiet" href="#/train/pao-o">Objects</a></div>
      </section>`;
    $$('[data-suit] button', el).forEach((b) => { b.onclick = () => { suit = b.dataset.v; paint(); }; });
    $$('[data-pao]', el).forEach((i) => {
      i.onchange = () => {
        const [id, f] = i.dataset.pao.split(':');
        const entry = { p: '', a: '', o: '', ...(st.pao[id] || {}) };
        entry[f] = i.value.trim();
        if (entry.p || entry.a || entry.o) st.pao[id] = entry; else delete st.pao[id];
        store.save();
        keepFocus(el, paint);
      };
    });
    $('[data-fill]', el).onclick = () => {
      for (const id of DECK) { const e = { p: '', a: '', o: '', ...(st.pao[id] || {}) }; for (const f of FIELDS) if (!e[f]) e[f] = EXAMPLE_PAO[id][f]; st.pao[id] = e; }
      store.save(); paint();
    };
    $('[data-export]', el).onclick = () => download('cachet-pao.json', JSON.stringify({ app: 'cachet', type: 'pao', pao: sys && Object.fromEntries(DECK.map((id) => [id, { p: sys[id].p, a: sys[id].a, o: sys[id].o }])) }, null, 2));
    $('[data-import]', el).onchange = async (e) => {
      try {
        const doc = JSON.parse(await e.target.files[0].text());
        const src = doc.pao;
        if (!src || typeof src !== 'object') throw new Error('That file has no PAO system in it.');
        let n = 0;
        for (const id of DECK) if (src[id] && typeof src[id] === 'object') { st.pao[id] = { p: String(src[id].p || '').slice(0, 80), a: String(src[id].a || '').slice(0, 80), o: String(src[id].o || '').slice(0, 80) }; n++; }
        if (!n) throw new Error('No cards found in that file.');
        store.save(); paint(); ctx.toast(`Imported PAO entries for ${n} cards.`);
      } catch (err) { ctx.toast(err.message || 'That file could not be read.'); }
    };
    $('[data-deal]', el).onclick = () => { triple = newDeck(3); paint(); };
  };
  paint();
}

// ── numbers ──────────────────────────────────────────────────────
function numbers(el, route, ctx) {
  const store = ctx.store;
  const st = store.state;
  const count = () => Object.keys(st.pegs).length;
  el.innerHTML = `
    <section class="panel"><h2>The Major code</h2>
      <div class="major-strip">${MAJOR.map((m) => `<div><b class="mono">${m.d}</b><span>${m.sounds}</span></div>`).join('')}</div>
      <p class="small">Vowels and w, h, y carry no value. Go by sound: <em>knife</em> is n–f, 28. <a href="#/learn/major-code">The lesson</a> explains the code.</p></section>
    <section class="panel"><div class="panel-h"><h2>Images for 00–99</h2><span class="small mono" data-count>${count()}/100 your own</span></div>
      <p class="small">Grey placeholders are the example list. Type your own to replace one; clear the box to go back to the example. Stuck on one? The <a href="#/systems/ideas">idea finder</a> lists Major words, shapes and famous numbers.</p>
      <div class="peg-grid">${Array.from({ length: 100 }, (_, i) => { const id = pegId(i); return `<label><span class="mono">${id}</span><input type="text" data-peg="${id}" value="${esc(st.pegs[id] || '')}" placeholder="${esc(EXAMPLE_PEGS[i])}" maxlength="40" aria-label="Image for ${id}"></label>`; }).join('')}</div>
      <div class="row"><a class="btn primary" href="#/train/pegs">Drill the number images</a><a class="btn" href="#/train/digits?n=20">20-digit number</a></div></section>`;
  $$('[data-peg]', el).forEach((i) => { i.onchange = () => { const v = i.value.trim(); if (v) st.pegs[i.dataset.peg] = v; else delete st.pegs[i.dataset.peg]; store.save(); $('[data-count]', el).textContent = `${count()}/100 your own`; }; });
}

// ── idea finder ──────────────────────────────────────────────────
const IDEA_SAMPLES = ['47', 'Tuesday', 'March', '7 of hearts', 'justice', '1066', 'Q'];

function ideas(el, route, ctx) {
  const store = ctx.store;
  const st = store.state;
  el.innerHTML = `
    <section class="panel"><h2>Idea finder</h2>
      <p>Stuck for a picture? Type a number, a day, a month, a letter, a card or an abstract word. You get starting points sorted by route: your own system, the Major code, shape, rhyme, sound and meaning.</p>
      <form class="row tight idea-form" data-idea-form><input type="text" data-idea-q value="${esc(route.query.q || '')}" placeholder="47, Tuesday, March, 7 of hearts, justice…" aria-label="What do you want to picture?" autocomplete="off" maxlength="60"><button class="btn primary">Find ideas</button></form>
      <div class="chips idea-samples"><span class="small">Try:</span>${IDEA_SAMPLES.map((x) => `<button type="button" class="chip" data-sample="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <p class="small">These are prompts, not answers. Take the one that makes a picture appear straight away, then make it bigger, stranger and moving.</p></section>
    <div data-idea-out aria-live="polite"></div>`;
  const q = $('[data-idea-q]', el);
  const out = $('[data-idea-out]', el);
  const paint = () => {
    const text = q.value.trim();
    try { history.replaceState(null, '', `#/systems/ideas${text ? `?q=${encodeURIComponent(text)}` : ''}`); } catch { /* ignore */ }
    const r = findIdeas(text, st);
    if (!r) { out.innerHTML = ''; return; }
    const groups = r.groups.filter((x) => x.items.length || x.note);
    out.innerHTML = `<section class="panel"><div class="panel-h"><h2>Ideas for ${esc(r.label)}</h2><span class="small mono">${esc(r.kind)}</span></div>
      <div class="idea-groups">${groups.map((x) => `<div class="idea-group"><h3>${esc(x.title)}</h3>${x.items.length ? `<ul>${x.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}${x.note ? `<p class="small">${esc(x.note)}</p>` : ''}</div>`).join('')}</div>
      ${r.note ? `<p class="small">${esc(r.note)}</p>` : ''}
      ${r.peg ? `<form class="row" data-peg-save><label class="small" for="peg-save">Your image for ${r.peg}</label><input id="peg-save" type="text" maxlength="40" value="${esc(st.pegs[r.peg] || '')}" placeholder="${esc(EXAMPLE_PEGS[Number(r.peg)])}"><button class="btn">Save</button></form>` : ''}</section>`;
    const f = $('[data-peg-save]', out);
    if (f) {
      f.onsubmit = (e) => {
        e.preventDefault();
        const v = $('input', f).value.trim();
        if (v) st.pegs[r.peg] = v; else delete st.pegs[r.peg];
        store.save();
        ctx.toast(v ? `Saved: ${r.peg} is now ${v}` : `${r.peg} is back to the example`);
        paint();
      };
    }
  };
  $('[data-idea-form]', el).onsubmit = (e) => { e.preventDefault(); paint(); };
  q.oninput = paint;
  $$('[data-sample]', el).forEach((b) => { b.onclick = () => { q.value = b.dataset.sample; paint(); q.focus(); }; });
  paint();
  if (!q.value) q.focus();
}

// ── data ─────────────────────────────────────────────────────────
function data(el, route, ctx) {
  const store = ctx.store;
  const st = store.state;
  const theme = window.CachetTheme;
  el.innerHTML = `
    <section class="panel"><h2>Your data</h2>
      <p>Everything is stored in this browser on this device: lessons, palaces, card and PAO systems, card records and history. Nothing is sent anywhere, and there is no account. Clearing the browser's site data deletes it, so keep a backup.</p>
      <p class="small mono">${Object.keys(st.lessons).length} lessons · ${st.palaces.length} palaces · ${savedImageCount(st)} card images · ${paoCompletion(st.pao).filled} PAO entries · ${Object.keys(st.pegs).length} number images · ${st.history.length} history entries</p>
      ${store.loadError ? `<p class="claim coach"><b>Note</b>Saved data could not be read when the page loaded (${esc(store.loadError.message)}). It was set aside, not deleted, and a fresh start was made.</p>` : ''}
      <div class="row"><button class="btn primary" data-export>Download a backup</button><label class="btn">Restore from a backup<input type="file" accept="application/json,.json" data-import hidden></label></div>
      <p class="small">Restoring replaces everything currently here with the contents of the file. The file is checked first; a file that is not a Cachet backup changes nothing.</p></section>
    <section class="panel"><h2>Appearance</h2>
      <p class="small">Style</p>
      <div class="seg" data-style-seg>${[['ledger', 'Ledger'], ['notebook', 'Notebook'], ['library', 'Library'], ['table', 'Table']].map(([k, v]) => `<button data-v="${k}" class="${theme.ui() === k ? 'on' : ''}">${v}</button>`).join('')}</div>
      <p class="small">${{ ledger: 'The default: plain paper, ruled sections, large figures.', notebook: 'The original: graph paper and serif headings.', library: 'Dark, serif and brass. Dark only, so the light/dark setting below does not apply.', table: 'Soft panels, with card screens on green baize. Light only, so the light/dark setting below does not apply.' }[theme.ui()]}</p>
      <p class="small">Light or dark</p>
      <div class="seg" data-theme-seg>${[['auto', 'Match system'], ['notebook', 'Light'], ['night', 'Dark']].map(([k, v]) => `<button data-v="${k}" class="${theme.choice() === k ? 'on' : ''}">${v}</button>`).join('')}</div></section>
    <section class="panel"><h2>Start again</h2><p class="small">Deletes all progress and systems on this device. This cannot be undone; download a backup first.</p>
      <div class="row"><button class="btn danger" data-reset>Delete everything</button></div></section>`;
  $('[data-export]', el).onclick = () => download(`cachet-backup-${new Date().toISOString().slice(0, 10)}.json`, store.exportJSON());
  $('[data-import]', el).onchange = async (e) => {
    try { store.importJSON(await e.target.files[0].text()); ctx.toast('Backup restored.'); data(el, route, ctx); ctx.refreshNav?.(); } catch (err) { ctx.toast(`Not restored: ${err.message || 'the file could not be read.'}`); }
  };
  $$('[data-theme-seg] button', el).forEach((b) => { b.onclick = () => { theme.set(b.dataset.v); $$('[data-theme-seg] button', el).forEach((x) => x.classList.toggle('on', x === b)); }; });
  $$('[data-style-seg] button', el).forEach((b) => { b.onclick = () => { theme.setUi(b.dataset.v); data(el, route, ctx); }; });
  const reset = $('[data-reset]', el);
  reset.onclick = () => { if (reset.dataset.sure !== '1') { reset.dataset.sure = '1'; reset.textContent = 'Yes, delete everything on this device'; return; } store.reset(); ctx.toast('Everything was deleted.'); data(el, route, ctx); ctx.refreshNav?.(); };
}
