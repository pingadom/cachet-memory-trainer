// Person-Action-Object encoding: three cards become one scene, and the scene decodes back.

import { DECK } from './cards.js';
import { EXAMPLE_PAO } from './systems.js';
import { norm } from './scoring.js';

export const FIELDS = ['p', 'a', 'o'];
export const FIELD_NAME = { p: 'Person', a: 'Action', o: 'Object' };

/** Saved entries where present, example entries elsewhere, with `own` flags per field. */
export function effectivePao(saved = {}) {
  const sys = {};
  for (const id of DECK) {
    const u = saved[id] || {};
    const ex = EXAMPLE_PAO[id];
    sys[id] = {
      p: u.p || ex.p, a: u.a || ex.a, o: u.o || ex.o,
      own: { p: !!u.p, a: !!u.a, o: !!u.o },
    };
  }
  return sys;
}

export function paoCompletion(saved = {}) {
  let filled = 0;
  for (const id of DECK) for (const f of FIELDS) if (saved[id]?.[f]) filled++;
  return { filled, total: 156, fraction: filled / 156 };
}

/** Card 1 gives the person, card 2 the action, card 3 the object. Fewer cards give a partial scene. */
export function encodeTriple(cards, sys) {
  const [c1, c2, c3] = cards;
  const scene = {
    cards: cards.slice(0, 3),
    person: c1 ? sys[c1].p : null,
    action: c2 ? sys[c2].a : null,
    object: c3 ? sys[c3].o : null,
  };
  scene.text = sceneText(scene);
  return scene;
}

export function sceneText({ person, action, object }) {
  if (!person) return '';
  const cap = person[0].toUpperCase() + person.slice(1);
  if (!action) return `${cap}, alone`;
  if (!object) return `${cap} is ${action} …`;
  return `${cap} is ${action} ${object}`;
}

/** A whole sequence as scenes: 52 cards -> 17 full triples plus one single card at an 18th locus. */
export function encodeDeck(seq, sys) {
  const scenes = [];
  for (let i = 0; i < seq.length; i += 3) scenes.push(encodeTriple(seq.slice(i, i + 3), sys));
  return scenes;
}

function lookup(sys, field, value) {
  const v = norm(value);
  if (!v) return [];
  return DECK.filter((id) => norm(sys[id][field]) === v);
}

/**
 * Translate a scene back into its cards. Each component must match exactly one card; a missing
 * or ambiguous component decodes to null, which is exactly what a duplicated entry does in practice.
 */
export function decodeScene(scene, sys) {
  const parts = [['p', scene.person], ['a', scene.action], ['o', scene.object]].filter(([, v]) => v != null);
  return parts.map(([f, v]) => {
    const hits = lookup(sys, f, v);
    return hits.length === 1 ? hits[0] : null;
  });
}

export const decodeDeck = (scenes, sys) => scenes.flatMap((s) => decodeScene(s, sys));

/** Entries likely to cause decoding errors: exact duplicates within a column, or shared key words. */
export function findConflicts(sys) {
  const out = [];
  for (const f of FIELDS) {
    const seen = new Map();
    for (const id of DECK) {
      const k = norm(sys[id][f]);
      if (!k) continue;
      seen.set(k, [...(seen.get(k) || []), id]);
    }
    for (const cards of seen.values()) if (cards.length > 1) out.push({ type: 'duplicate', field: f, value: sys[cards[0]][f], cards });
  }
  // The same main word used as (say) one card's object and another's person muddles decoding.
  const STOP = new Set(['a', 'an', 'the', 'of', 'on', 'in', 'into', 'with', 'out', 'up', 'down', 'from', 'through', 'to', 'off', 'pair', 'three', 'king', 'queen']);
  const key = (text) => String(text).toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2 && !STOP.has(w));
  const words = new Map();
  for (const id of DECK) for (const f of ['p', 'o']) for (const w of key(sys[id][f])) {
    words.set(w, [...(words.get(w) || []), { id, f }]);
  }
  for (const [w, uses] of words) {
    const cards = [...new Set(uses.map((u) => u.id))];
    if (cards.length > 1) out.push({ type: 'similar', field: 'word', value: w, cards });
  }
  return out;
}
