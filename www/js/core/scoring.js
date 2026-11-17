// Recall comparison and milestone rules. Pure functions: everything here is unit tested.

export const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Compare a submitted sequence with the original, position by position.
 * `submitted` may contain null/'' for blanks and may be shorter than the original.
 * Each error is classified so feedback can say what kind of slip it was.
 */
export function compareSequences(original, submitted, same = (a, b) => a === b) {
  const positions = original.map((expected, i) => {
    const got = submitted[i] ?? null;
    const blank = got === null || got === '';
    const ok = !blank && same(expected, got);
    let kind = 'ok';
    if (!ok) {
      if (blank) kind = 'blank';
      else if (
        (i + 1 < original.length && same(original[i + 1], got) && submitted[i + 1] != null && same(expected, submitted[i + 1])) ||
        (i > 0 && same(original[i - 1], got) && submitted[i - 1] != null && same(expected, submitted[i - 1]))
      ) kind = 'swap';
      else if (original.some((o, j) => j !== i && same(o, got))) kind = 'misplaced';
      else kind = 'wrong';
    }
    return { i, expected, got: blank ? null : got, ok, kind };
  });
  const correct = positions.filter((p) => p.ok).length;
  const first = positions.find((p) => !p.ok);
  const kinds = { blank: 0, swap: 0, misplaced: 0, wrong: 0 };
  for (const p of positions) if (!p.ok) kinds[p.kind]++;
  return {
    total: original.length,
    correct,
    perfect: correct === original.length,
    firstError: first ? first.i : -1,
    positions,
    kinds,
  };
}

export const compareWords = (original, submitted) => compareSequences(original, submitted, (a, b) => norm(a) === norm(b));

export function compareDigits(original, typed) {
  const got = String(typed || '').replace(/\D/g, '').split('');
  return compareSequences(original.split(''), got);
}

/** Plain-language explanation of what a comparison says about the memoriser's weak point. */
export function diagnose(cmp) {
  const out = [];
  const { kinds, total, correct } = cmp;
  if (cmp.perfect) return ['Every position correct.'];
  if (kinds.blank) out.push(`${kinds.blank} blank ${kinds.blank === 1 ? 'position' : 'positions'}: the image at that location never formed, or was too faint to find. Slow down at those loci and make the image act on the location.`);
  const pairs = Math.max(1, Math.round(kinds.swap / 2));
  if (kinds.swap) out.push(`${pairs} adjacent ${pairs === 1 ? 'pair was' : 'pairs were'} swapped: you had the right images but lost their order. Order comes from the location (or from who-does-what in a scene), so check each image is anchored to exactly one place.`);
  if (kinds.misplaced) out.push(`${kinds.misplaced} ${kinds.misplaced === 1 ? 'item was' : 'items were'} recalled in the wrong place: the image survived but drifted from its location. Walk the route once more before recall and confirm each stop.`);
  if (kinds.wrong) out.push(`${kinds.wrong} ${kinds.wrong === 1 ? 'item was' : 'items were'} not in the sequence at all: usually a decoding slip, where an image is translated back to the wrong card. Drill those associations in both directions.`);
  if (cmp.firstError > total * 0.6 && correct >= total * 0.6) out.push('Your errors cluster at the end. That usually means rushing the last few items; give the final locations the same time as the first.');
  return out;
}

export const DECK_MILESTONES = [
  { id: 'deck-perfect', label: 'First perfect deck', maxMs: Infinity },
  { id: 'deck-15', label: 'Under 15 minutes', maxMs: 15 * 60000 },
  { id: 'deck-10', label: 'Under 10 minutes', maxMs: 10 * 60000 },
  { id: 'deck-5', label: 'Under 5 minutes', maxMs: 5 * 60000 },
  { id: 'deck-3', label: 'Under 3 minutes', maxMs: 3 * 60000 },
  { id: 'deck-2', label: 'Under 2 minutes', maxMs: 2 * 60000 },
];

/**
 * A deck attempt counts towards milestones only if it is a full 52-card deck, every card is in
 * the right position, and no hints were used. Finishing the timer earns nothing by itself.
 */
export function milestoneEligible(a) {
  return !!a && a.total === 52 && a.correct === 52 && !a.assisted && Number.isFinite(a.encodeMs) && a.encodeMs > 0;
}

/** Milestones a single attempt earns. Timed milestones use memorisation (encoding) time. */
export function earnedMilestones(a) {
  if (!milestoneEligible(a)) return [];
  return DECK_MILESTONES.filter((m) => a.encodeMs < m.maxMs).map((m) => m.id);
}

export function fmtTime(ms) {
  if (!Number.isFinite(ms)) return '—';
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(s < 10 ? 2 : 1)}s`;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}
