// Playing cards: identifiers, names, and unbiased shuffling.
// A card id is rank + suit, e.g. 'AS' (ace of spades), 'TH' (ten of hearts).

export const SUITS = ['S', 'H', 'D', 'C'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
export const SUIT_NAME = { S: 'Spades', H: 'Hearts', D: 'Diamonds', C: 'Clubs' };
export const SUIT_SYM = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const RANK_NAME = {
  A: 'Ace', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven',
  8: 'Eight', 9: 'Nine', T: 'Ten', J: 'Jack', Q: 'Queen', K: 'King',
};

/** All 52 card ids in a fixed reference order (spades, hearts, diamonds, clubs; ace to king). */
export const DECK = Object.freeze(SUITS.flatMap((s) => RANKS.map((r) => r + s)));
const DECK_SET = new Set(DECK);

export const isCard = (id) => DECK_SET.has(id);
export const rankOf = (id) => id[0];
export const suitOf = (id) => id[1];
export const isRed = (id) => id[1] === 'H' || id[1] === 'D';
export const rankLabel = (id) => (id[0] === 'T' ? '10' : id[0]);
export const cardLabel = (id) => rankLabel(id) + SUIT_SYM[id[1]];
export const cardName = (id) => `${RANK_NAME[id[0]]} of ${SUIT_NAME[id[1]]}`;

/**
 * Uniform random integer in [0, n). Uses the platform CSPRNG with rejection sampling, so there
 * is no modulo bias (Math.random() % n style shuffles favour some orderings).
 */
export function randInt(n) {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError('randInt needs a positive integer');
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  let x;
  do {
    globalThis.crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % n;
}

/** Fisher–Yates shuffle. Returns a new array; `rand(n)` must be uniform on [0, n). */
export function shuffle(items, rand = randInt) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The first n cards of a freshly shuffled deck: no duplicates, every ordering equally likely. */
export function newDeck(n = 52, rand = randInt) {
  if (n < 1 || n > 52) throw new RangeError('A sequence has 1 to 52 cards');
  return shuffle(DECK, rand).slice(0, n);
}

/** True when every entry is a real card and none repeats. */
export function isValidSequence(seq) {
  return Array.isArray(seq) && seq.every(isCard) && new Set(seq).size === seq.length;
}

/** Parse loose text such as 'kh', '10 h', 'T♥' or 'king of hearts'. Returns a card id or null. */
export function parseCard(text) {
  const t = String(text || '').trim().toLowerCase();
  if (!t) return null;
  const suit = /spade|♠/.test(t) ? 'S' : /heart|♥/.test(t) ? 'H' : /diamond|♦/.test(t) ? 'D' : /club|♣/.test(t) ? 'C' : null;
  const words = { ace: 'A', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K' };
  for (const [w, r] of Object.entries(words)) if (t.startsWith(w) && suit) return r + suit;
  const m = t.match(/^(10|[a2-9tjqk])\s*([shdc♠♥♦♣])$/);
  if (!m) return null;
  const r = m[1] === '10' ? 'T' : m[1].toUpperCase();
  const s = { s: 'S', h: 'H', d: 'D', c: 'C', '♠': 'S', '♥': 'H', '♦': 'D', '♣': 'C' }[m[2]];
  return r + s;
}

export const sample = (items, rand = randInt) => items[rand(items.length)];
