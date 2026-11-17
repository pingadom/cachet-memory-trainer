// Theme: loaded in <head> without `defer` so the right colours are applied before first paint.
// Two independent settings, both stored per device:
//   style        ledger (default) | notebook | library (dark only) | table (light only)
//   light/dark   'auto' follows the system; or 'notebook' (light) / 'night' (dark)
(function () {
  const KEY = 'cachet-theme';
  const UI_KEY = 'cachet-ui';
  const UIS = ['ledger', 'notebook', 'library', 'table'];
  // Browser chrome colour per style: [light, dark].
  const BG = { ledger: ['#fbfaf7', '#121212'], notebook: ['#f5efe3', '#141519'], library: ['#0e1714', '#0e1714'], table: ['#eef1f5', '#eef1f5'] };
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener() {} };
  const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* applies for this visit only */ } };

  try { const q = new URLSearchParams(location.search).get('ui'); if (UIS.includes(q)) write(UI_KEY, q); } catch { /* ignore */ }
  const ui = () => { const v = read(UI_KEY); return UIS.includes(v) ? v : 'ledger'; };
  const choice = () => { const v = read(KEY); return v === 'notebook' || v === 'night' ? v : 'auto'; };
  const current = () => { const c = choice(); return c === 'auto' ? (mq.matches ? 'night' : 'notebook') : c; };

  function apply() {
    const u = ui();
    if (u === 'notebook') root.removeAttribute('data-ui'); else root.setAttribute('data-ui', u);
    const c = choice();
    if (c === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', c);
    const pair = BG[u];
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      const darkMeta = (m.getAttribute('media') || '').includes('dark');
      m.setAttribute('content', pair[(c === 'auto' ? darkMeta : c === 'night') ? 1 : 0]);
    });
  }

  window.CachetTheme = {
    UIS, ui, choice, current,
    dark: () => ui() === 'library' || (ui() !== 'table' && current() === 'night'),
    setUi(v) { write(UI_KEY, v); apply(); },
    set(v) { write(KEY, v); apply(); },
  };
  mq.addEventListener('change', apply);
  apply();
})();
