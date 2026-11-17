// Small rendering helpers shared by every view: escaping, playing cards, the card picker, charts.

import { SUITS, RANKS, SUIT_SYM, SUIT_NAME, cardName, rankLabel, isRed } from '../core/cards.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
export const pct = (x) => `${Math.round(x * 100)}%`;
export const secs = (ms, dp = 1) => (Number.isFinite(ms) ? `${(ms / 1000).toFixed(dp)}s` : '—');

/** A playing card. size: 'lg' (study), '' (default), 'sm' (slots and lists), 'xs' (grids). */
export function cardHTML(id, size = '', extra = '') {
  if (!id) return `<span class="pc ${size} empty ${extra}" aria-label="empty"></span>`;
  const r = rankLabel(id);
  const s = SUIT_SYM[id[1]];
  const inner = size === 'lg' || size === ''
    ? `<span class="pc-c"><b>${r}</b><i>${s}</i></span><span class="pc-pip" aria-hidden="true">${s}</span><span class="pc-c br" aria-hidden="true"><b>${r}</b><i>${s}</i></span>`
    : `<b>${r}</b><i>${s}</i>`;
  return `<span class="pc ${size} ${isRed(id) ? 'red' : ''} ${extra}" data-card="${id}" role="img" aria-label="${cardName(id)}">${inner}</span>`;
}

/** Inline card name for prose: 7♣ in the right colour. */
export const cardInline = (id) => `<span class="ci ${isRed(id) ? 'red' : ''}">${rankLabel(id)}${SUIT_SYM[id[1]]}</span>`;

/** A 4 × 13 grid of every card. Cards in `used` are disabled, so a card cannot be chosen twice. */
export function pickerHTML(used = new Set(), label = 'Choose a card') {
  return `<div class="picker" role="group" aria-label="${esc(label)}">${SUITS.map((s) => `
    <div class="picker-row" aria-label="${SUIT_NAME[s]}">${RANKS.map((r) => {
      const id = r + s;
      return `<button type="button" class="pk ${isRed(id) ? 'red' : ''}" data-pick="${id}" ${used.has(id) ? 'disabled' : ''} aria-label="${cardName(id)}"><b>${rankLabel(id)}</b><i>${SUIT_SYM[s]}</i></button>`;
    }).join('')}</div>`).join('')}
  </div>
  <p class="small picker-help">Keyboard: type a rank (<kbd>A</kbd> <kbd>2</kbd>–<kbd>9</kbd> <kbd>T</kbd> <kbd>J</kbd> <kbd>Q</kbd> <kbd>K</kbd>) then a suit (<kbd>S</kbd> <kbd>H</kbd> <kbd>D</kbd> <kbd>C</kbd>).</p>`;
}

/** Keyboard entry of a card as rank then suit. Returns a handler: (event) => true if it used the key. */
export function cardKeys(onCard, onPending = () => {}) {
  let rank = null;
  return (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    const k = e.key.toUpperCase();
    if (k === '1' || k === '0') { rank = 'T'; onPending(rank); return true; }
    if (RANKS.includes(k) && !(rank && 'SHDC'.includes(k))) { rank = k; onPending(rank); return true; }
    if (rank && 'SHDC'.includes(k)) { const id = rank + k; rank = null; onPending(null); onCard(id); return true; }
    return false;
  };
}

// ── charts: plain SVG, sized by viewBox ──────────────────────────

/**
 * Line chart. points: [{ label, y }]. opts: fmt(y), goal (horizontal reference), lowerIsBetter,
 * log (logarithmic y axis, for times spanning minutes down to seconds).
 */
export function lineChart(points, { fmt = (v) => v, goal = null, goalLabel = '', log = false, height = 150, min = null, max = null } = {}) {
  if (points.length < 1) return '<p class="small chart-empty">No data yet.</p>';
  const W = 520, H = height, L = 46, R = 12, T = 12, B = 22;
  const f = log ? Math.log : (v) => v;
  const ys = points.map((p) => p.y).concat(goal != null ? [goal] : []);
  let lo = min ?? Math.min(...ys), hi = max ?? Math.max(...ys);
  if (lo === hi) { lo = lo * 0.9 - (log ? 0 : 1); hi = hi * 1.1 + 1; }
  if (log) lo = Math.max(lo, 1e-9);
  const X = (i) => L + (points.length === 1 ? (W - L - R) / 2 : (i / (points.length - 1)) * (W - L - R));
  const Y = (v) => T + (1 - (f(v) - f(lo)) / (f(hi) - f(lo))) * (H - T - B);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const ticks = [lo, log ? Math.exp((Math.log(lo) + Math.log(hi)) / 2) : (lo + hi) / 2, hi];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart, ${points.length} points, latest ${esc(fmt(points[points.length - 1].y))}">
    ${ticks.map((t) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="tick" x="${L - 6}" y="${Y(t) + 4}" text-anchor="end">${esc(fmt(t))}</text>`).join('')}
    ${goal != null ? `<line class="goal" x1="${L}" x2="${W - R}" y1="${Y(goal)}" y2="${Y(goal)}"/><text class="tick goal-t" x="${W - R}" y="${Y(goal) - 5}" text-anchor="end">${esc(goalLabel)}</text>` : ''}
    <path class="line" d="${path}"/>
    ${points.map((p, i) => `<circle class="dot ${p.cls || ''}" cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3"><title>${esc(p.label)}: ${esc(fmt(p.y))}</title></circle>`).join('')}
    <text class="tick" x="${L}" y="${H - 5}">${esc(points[0].label)}</text>
    ${points.length > 1 ? `<text class="tick" x="${W - R}" y="${H - 5}" text-anchor="end">${esc(points[points.length - 1].label)}</text>` : ''}
  </svg>`;
}

/** Horizontal distribution bar with a legend. parts: [{ label, value, cls }]. */
export function distBar(parts) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  return `<div class="dist" role="img" aria-label="${esc(parts.map((p) => `${p.label} ${p.value}`).join(', '))}">${parts.filter((p) => p.value).map((p) => `<span class="${p.cls}" style="flex:${p.value / total}"></span>`).join('')}</div>
  <div class="legend">${parts.map((p) => `<span><i class="sw ${p.cls}"></i>${esc(p.label)} <b class="mono">${p.value}</b></span>`).join('')}</div>`;
}

/** Practice calendar: one square per day, weeks as columns. days: [{ key, n }] oldest first. */
export function heatStrip(days) {
  const first = new Date(days[0].key + 'T12:00:00').getDay();
  const pad = (first + 6) % 7; // weeks start on Monday
  const cells = [...Array(pad).fill(null), ...days];
  const lvl = (n) => (n === 0 ? 0 : n < 3 ? 1 : n < 8 ? 2 : 3);
  return `<div class="heat" role="img" aria-label="Practice on ${days.filter((d) => d.n).length} of the last ${days.length} days">${cells.map((d) => (d ? `<span class="h${lvl(d.n)}" title="${d.key}: ${d.n} exercise${d.n === 1 ? '' : 's'}"></span>` : '<span class="hx"></span>')).join('')}</div>`;
}

export const progressBar = (fraction, label = '') => `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(fraction * 100)}" aria-label="${esc(label)}"><span style="width:${Math.max(0, Math.min(1, fraction)) * 100}%"></span></div>`;

export const shortDate = (t) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** Reduce an uploaded image to a small JPEG data URL so it fits comfortably in browser storage. */
export function shrinkImage(file, size = 220) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Choose an image file.'));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, size / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
    img.src = url;
  });
}

/** Re-render while keeping keyboard focus on the same control (matched by its first data- attribute). */
export function keepFocus(root, repaint) {
  setTimeout(() => {
    const a = document.activeElement;
    let sel = null;
    if (a && root.contains(a)) {
      const d = Object.entries(a.dataset)[0];
      if (d) sel = `${a.tagName.toLowerCase()}[data-${d[0].replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}="${d[1]}"]`;
    }
    repaint();
    if (sel) root.querySelector(sel)?.focus();
  }, 0);
}

export function download(filename, text, type = 'application/json') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
