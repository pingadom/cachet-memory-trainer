// Persistence. All learner data is one versioned JSON document in browser storage.
// The store takes any Storage-like object, so it runs unchanged in tests and could later sit
// behind an account/sync layer: replace `storage` with something that talks to a server.

import { isCard } from './cards.js';

export const VERSION = 1;
export const KEY = 'cachet-data';
const HISTORY_CAP = 3000;

export const defaults = () => ({
  version: VERSION,
  created: Date.now(),
  lessons: {},      // lessonId -> { done: timestamp, best: 0..1, tries }
  cardImages: {},   // cardId -> { image, cue }           (the learner's own, never suggestions)
  pao: {},          // cardId -> { p, a, o }
  pegs: {},         // '00'..'99' -> image
  palaces: [],      // { id, name, areas: [{ id, name, loci: [{ id, name, note, img }] }] }
  stats: {},        // 'img:AS' | 'p:AS' | 'a:AS' | 'o:AS' | 'peg:42' -> srs stat
  history: [],      // one entry per finished exercise
  milestones: {},   // milestoneId -> timestamp first earned
  settings: { dailyPlan: true, perView: 1, autoAdvance: 0 },
});

// Ordered upgrade steps: MIGRATIONS[n] turns a version-n document into version n+1.
const MIGRATIONS = {};

const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x, max = 200) => (typeof x === 'string' ? x.slice(0, max) : '');

/**
 * Turn anything read from storage or an import file into a valid current-version state.
 * Unknown cards and malformed entries are dropped rather than trusted; missing sections get defaults.
 * Throws on data that is not ours or comes from a newer version of the app.
 */
export function migrate(raw) {
  if (!isObj(raw)) throw new Error('Not a Cachet data file.');
  let doc = { ...raw };
  let v = Number.isInteger(doc.version) ? doc.version : 1;
  if (v > VERSION) throw new Error('This file was made by a newer version of Cachet.');
  while (v < VERSION) {
    if (!MIGRATIONS[v]) throw new Error(`No upgrade path from data version ${v}.`);
    doc = MIGRATIONS[v](doc);
    v++;
  }
  const d = defaults();
  const out = { ...d, created: Number(doc.created) || d.created };

  if (isObj(doc.lessons)) for (const [id, l] of Object.entries(doc.lessons)) {
    if (isObj(l)) out.lessons[id] = { done: Number(l.done) || 0, best: Math.min(1, Math.max(0, Number(l.best) || 0)), tries: Number(l.tries) || 0 };
  }
  if (isObj(doc.cardImages)) for (const [id, e] of Object.entries(doc.cardImages)) {
    if (isCard(id) && isObj(e) && str(e.image)) out.cardImages[id] = { image: str(e.image), cue: str(e.cue, 400) };
  }
  if (isObj(doc.pao)) for (const [id, e] of Object.entries(doc.pao)) {
    if (isCard(id) && isObj(e)) {
      const entry = { p: str(e.p), a: str(e.a), o: str(e.o) };
      if (entry.p || entry.a || entry.o) out.pao[id] = entry;
    }
  }
  if (isObj(doc.pegs)) for (const [id, e] of Object.entries(doc.pegs)) {
    if (/^\d\d$/.test(id) && str(e)) out.pegs[id] = str(e);
  }
  if (Array.isArray(doc.palaces)) out.palaces = doc.palaces.filter(isObj).map((p, i) => ({
    id: str(p.id) || `p${i}-${Date.now()}`,
    name: str(p.name) || 'Untitled palace',
    areas: (Array.isArray(p.areas) ? p.areas : []).filter(isObj).map((a, j) => ({
      id: str(a.id) || `a${i}-${j}`,
      name: str(a.name) || 'Area',
      loci: (Array.isArray(a.loci) ? a.loci : []).filter(isObj).map((l, k) => ({
        id: str(l.id) || `l${i}-${j}-${k}`, name: str(l.name) || 'Location', note: str(l.note, 600),
        img: typeof l.img === 'string' && l.img.startsWith('data:image/') ? l.img : '',
      })),
    })),
  }));
  if (isObj(doc.stats)) for (const [k, s] of Object.entries(doc.stats)) {
    if (!isObj(s) || !/^(img|p|a|o|peg):/.test(k)) continue;
    out.stats[k] = {
      n: Number(s.n) || 0, c: Number(s.c) || 0,
      rts: Array.isArray(s.rts) ? s.rts.filter(Number.isFinite).slice(-10) : [],
      recent: Array.isArray(s.recent) ? s.recent.map((x) => (x ? 1 : 0)).slice(-10) : [],
      ivl: Number(s.ivl) || 0, ease: Number(s.ease) || 2.3, due: Number(s.due) || 0, last: Number(s.last) || 0,
      conf: isObj(s.conf) ? { ...s.conf } : {},
    };
  }
  if (Array.isArray(doc.history)) out.history = doc.history.filter((h) => isObj(h) && Number.isFinite(h.t) && typeof h.kind === 'string').slice(-HISTORY_CAP);
  if (isObj(doc.milestones)) for (const [id, t] of Object.entries(doc.milestones)) if (Number.isFinite(t)) out.milestones[id] = t;
  if (isObj(doc.settings)) out.settings = { ...d.settings, ...doc.settings };
  return out;
}

export function createStore(storage) {
  let state;
  let error = null;
  const listeners = new Set();
  try {
    const text = storage?.getItem(KEY);
    state = text ? migrate(JSON.parse(text)) : defaults();
  } catch (e) {
    // Keep the unreadable data under another key so nothing is lost, then start clean.
    error = e;
    try { storage?.setItem(`${KEY}-unreadable`, storage.getItem(KEY) ?? ''); } catch { /* ignore */ }
    state = defaults();
  }
  const api = {
    get state() { return state; },
    get loadError() { return error; },
    save() {
      if (state.history.length > HISTORY_CAP) state.history = state.history.slice(-HISTORY_CAP);
      try { storage?.setItem(KEY, JSON.stringify(state)); } catch (e) { error = e; }
      listeners.forEach((fn) => fn(state));
    },
    /** Apply a change and persist it. */
    update(fn) { fn(state); api.save(); },
    log(entry) { state.history.push({ t: Date.now(), ...entry }); api.save(); },
    exportJSON() { return JSON.stringify({ app: 'cachet', exported: new Date().toISOString(), ...state }, null, 2); },
    /** Replace everything with an exported file. Validates first; throws without changing anything on bad input. */
    importJSON(text) {
      const next = migrate(JSON.parse(text));
      state = next;
      api.save();
    },
    reset() { state = defaults(); api.save(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  return api;
}

/** A Storage-like object held in memory: used by tests, and as a fallback when storage is blocked. */
export function memoryStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => void m.set(k, String(v)), removeItem: (k) => void m.delete(k) };
}

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const allLoci = (palace) => palace.areas.flatMap((a) => a.loci.map((l) => ({ ...l, area: a.name })));
