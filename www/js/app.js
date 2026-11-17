// Application shell: storage, hash routing, keyboard dispatch, and per-view timer cleanup.

import { createStore, memoryStorage } from './core/store.js';
import { cardSummary } from './core/adapt.js';
import { dashboard, progress } from './views/home.js';
import { learn, train } from './views/learn.js';
import { systems } from './views/systems.js';
import { speed, handbook } from './views/misc.js';

let storage;
try { storage = window.localStorage; storage.setItem('cachet-probe', '1'); storage.removeItem('cachet-probe'); } catch { storage = memoryStorage(); }
const store = createStore(storage);

const ROUTES = { '': dashboard, learn, train, systems, speed, progress, handbook };
const main = document.getElementById('main');
let keyHandler = null;
let timers = [];

const ctx = {
  store,
  /** Set (or clear) the active view's key handler. It returns true when it used the key. */
  keys(fn) { keyHandler = fn; },
  /** setInterval that is cleared automatically when the view changes. Returns a stop function. */
  every(ms, fn) { const id = setInterval(fn, ms); const stop = () => clearInterval(id); timers.push(stop); return stop; },
  after(ms, fn) { const id = setTimeout(fn, ms); const stop = () => clearTimeout(id); timers.push(stop); return stop; },
  toast(text) {
    const t = document.getElementById('toast');
    t.textContent = text;
    t.hidden = false;
    clearTimeout(ctx.toastT);
    ctx.toastT = setTimeout(() => { t.hidden = true; }, 4000);
  },
  refreshNav,
};

function refreshNav() {
  const due = cardSummary(store.state).due.length;
  document.querySelectorAll('[data-badge="due"]').forEach((b) => { b.hidden = due < 1; b.textContent = due; });
}

function parse() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), query: Object.fromEntries(new URLSearchParams(qs)) };
}

function render() {
  timers.forEach((stop) => stop());
  timers = [];
  keyHandler = null;
  store.save(); // drills update card records as they go; make sure a half-finished one is kept
  const route = parse();
  const name = route.parts[0] || '';
  const view = ROUTES[name] || dashboard;
  document.querySelectorAll('[data-route]').forEach((a) => {
    const on = a.dataset.route === (ROUTES[name] ? name : '');
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  main.innerHTML = '';
  try {
    view(main, route, ctx);
  } catch (e) {
    console.error(e);
    main.innerHTML = `<h1 tabindex="-1">Something went wrong</h1><p>This page could not be shown. Your saved data has not been changed.</p><p class="small mono"></p><p><a href="#/">Back to the dashboard</a></p>`;
    main.querySelector('.mono').textContent = String(e.message || e);
  }
  refreshNav();
  window.scrollTo(0, 0);
  main.querySelector('h1')?.focus({ preventScroll: true });
}

window.addEventListener('hashchange', render);
window.addEventListener('keydown', (e) => {
  const t = e.target;
  const typing = t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
  if (typing || !keyHandler) return;
  // A focused button already handles Space/Enter itself; do not fire the action twice.
  if ((e.key === ' ' || e.key === 'Enter') && t instanceof HTMLElement && ['BUTTON', 'A', 'SUMMARY'].includes(t.tagName)) return;
  if (keyHandler(e)) e.preventDefault();
});
window.addEventListener('pagehide', () => store.save());

document.getElementById('theme-toggle').addEventListener('click', () => {
  const th = window.CachetTheme;
  th.set(th.dark() ? 'notebook' : 'night');
});

render();
