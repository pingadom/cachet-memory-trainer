// One memorise → recall → results attempt, with no DOM. The deck lives only in this closure:
// the interface can ask for the cards in view while memorising, and for nothing once recall begins.

import { newDeck, isCard } from './cards.js';
import { compareSequences } from './scoring.js';

export function createArenaSession({ n = 52, perView = 1, clock = () => performance.now() } = {}) {
  let deck = null;
  let phase = 'ready';
  let pos = 0;
  let t0 = 0;
  let t1 = 0;
  let encodeMs = 0;
  let assisted = false;
  let result = null;

  const need = (p, what) => {
    if (phase === p) return;
    if (phase === 'ready') throw new Error('Attempt not started.');
    throw new Error(`Not available during ${phase}: ${what}.`);
  };

  return {
    get phase() { return phase; },
    get n() { return n; },
    get perView() { return perView; },
    get assisted() { return assisted; },
    get result() { return result; },
    /** Memorisation time; zero until recall has begun. */
    get encodeMs() { return encodeMs; },
    /** Position while memorising: first card index in view, and whether this is the last view. */
    get position() { return { index: pos, total: n, last: pos + perView >= n }; },

    start() {
      if (phase !== 'ready') throw new Error('Attempt already started.');
      deck = newDeck(n);
      phase = 'memorise';
      pos = 0;
      t0 = clock();
    },
    /** The cards currently in view. Only while memorising. */
    view() { need('memorise', 'viewing cards'); return deck.slice(pos, pos + perView); },
    next() { need('memorise', 'paging'); if (pos + perView < n) pos += perView; return pos; },
    prev() { need('memorise', 'paging'); pos = Math.max(0, pos - perView); return pos; },
    useHint() { need('memorise', 'hints'); assisted = true; },
    elapsed() { return phase === 'memorise' ? clock() - t0 : phase === 'recall' ? clock() - t1 : 0; },

    beginRecall() {
      need('memorise', 'starting recall');
      encodeMs = clock() - t0;
      t1 = clock();
      phase = 'recall';
      return encodeMs;
    },

    /** Score a submitted order. `submitted[i]` is a card id or null. One submission per attempt. */
    submit(submitted) {
      if (phase === 'done') throw new Error('This attempt was already submitted.');
      need('recall', 'submitting');
      const filled = submitted.filter((c) => c != null);
      if (!filled.every(isCard)) throw new Error('Submission contains something that is not a card.');
      if (new Set(filled).size !== filled.length) throw new Error('A card appears twice in the submission.');
      const recallMs = clock() - t1;
      const cmp = compareSequences(deck, submitted);
      result = { ...cmp, original: deck.slice(), submitted: deck.map((_, i) => submitted[i] ?? null), encodeMs, recallMs, assisted, perView };
      phase = 'done';
      return result;
    },
  };
}
