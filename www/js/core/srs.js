// Per-item statistics and a small, transparent spaced-repetition schedule.
//
// The rule, in full:
//   wrong            -> review again in 10 minutes; interval resets; ease drops by 0.2 (min 1.3)
//   right but slow   -> interval grows by x1.3 (at least 1 day)
//   right and fast   -> interval grows by x ease (starts at 2.3, +0.05 per fast answer, max 2.8)
// "Fast" means under FAST_MS. Nothing else is hidden in the schedule.

export const FAST_MS = 2500;
export const AUTO_MS = 1800; // median response under this, with high accuracy, counts as automatic
const DAY = 86400000;

export const emptyStat = () => ({ n: 0, c: 0, rts: [], recent: [], ivl: 0, ease: 2.3, due: 0, last: 0, conf: {} });

export function median(xs) {
  if (!xs.length) return NaN;
  const a = xs.slice().sort((x, y) => x - y);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

/** Returns an updated copy of `stat` after one attempt. */
export function recordAttempt(stat, { correct, ms, now = Date.now(), confusedWith = null }) {
  const s = { ...emptyStat(), ...stat, rts: [...(stat?.rts || [])], recent: [...(stat?.recent || [])], conf: { ...(stat?.conf || {}) } };
  s.n++;
  s.last = now;
  s.recent = [...s.recent, correct ? 1 : 0].slice(-10);
  if (correct) {
    s.c++;
    if (Number.isFinite(ms)) s.rts = [...s.rts, Math.round(ms)].slice(-10);
    const fast = Number.isFinite(ms) && ms < FAST_MS;
    if (fast) s.ease = Math.min(2.8, s.ease + 0.05);
    s.ivl = Math.max(1, s.ivl * (fast ? s.ease : 1.3));
    s.due = now + s.ivl * DAY;
  } else {
    s.ease = Math.max(1.3, s.ease - 0.2);
    s.ivl = 0;
    s.due = now + 10 * 60000;
    if (confusedWith) s.conf[confusedWith] = (s.conf[confusedWith] || 0) + 1;
  }
  return s;
}

export const recentAccuracy = (s) => (s && s.recent.length ? s.recent.reduce((a, b) => a + b, 0) / s.recent.length : 0);
export const recentSpeed = (s) => (s && s.rts.length ? median(s.rts.slice(-5)) : NaN);

/** Association strength estimate in [0, 1]: recent accuracy, discounted for slowness and thin evidence. */
export function mastery(s) {
  if (!s || !s.n) return 0;
  const acc = recentAccuracy(s);
  const rt = recentSpeed(s);
  const speed = !Number.isFinite(rt) ? 0.4 : rt <= AUTO_MS ? 1 : rt >= 6000 ? 0.4 : 1 - 0.6 * ((rt - AUTO_MS) / (6000 - AUTO_MS));
  const evidence = Math.min(1, s.n / 5);
  return acc * speed * evidence;
}

export const LEVELS = ['new', 'learning', 'shaky', 'solid', 'automatic'];
export const LEVEL_LABEL = { new: 'Not started', learning: 'Learning', shaky: 'Shaky', solid: 'Solid', automatic: 'Automatic' };

export function level(s) {
  if (!s || !s.n) return 'new';
  const acc = recentAccuracy(s);
  const rt = recentSpeed(s);
  if (s.n < 3) return 'learning';
  if (acc < 0.7) return 'shaky';
  if (acc >= 0.9 && s.n >= 5 && rt <= AUTO_MS) return 'automatic';
  if (acc >= 0.8) return 'solid';
  return 'learning';
}

export const isDue = (s, now = Date.now()) => !!s && s.n > 0 && s.due <= now;

/** Weakness weight used to choose what to show next: weak, slow and unseen items come up more. */
export function weakness(s) {
  if (!s || !s.n) return 1.2;
  return 0.15 + (1 - mastery(s)) * 1.5;
}

/** Weighted random choice by weakness, never repeating `avoid` when there is an alternative. */
export function pickNext(ids, stats, rand01 = Math.random, avoid = null) {
  const pool = ids.length > 1 ? ids.filter((id) => id !== avoid) : ids;
  const w = pool.map((id) => weakness(stats[id]));
  let r = rand01() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= w[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** Score a finished drill: accuracy, median time of correct answers, and items per minute. */
export function scoreDrill(results) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const times = results.filter((r) => r.correct && Number.isFinite(r.ms)).map((r) => r.ms);
  const elapsed = results.reduce((a, r) => a + (Number.isFinite(r.ms) ? r.ms : 0), 0);
  return {
    total,
    correct,
    accuracy: total ? correct / total : 0,
    medianMs: median(times),
    perMinute: elapsed ? (correct / elapsed) * 60000 : 0,
    slowest: results.filter((r) => r.correct).sort((a, b) => b.ms - a.ms).slice(0, 5).map((r) => r.id),
    missed: [...new Set(results.filter((r) => !r.correct).map((r) => r.id))],
  };
}
