// Theme: loaded in <head> without `defer` so the right colours are applied before first paint.
// 'auto' follows the system (Notebook by day, Night desk in dark mode). Stored per device.
(function () {
  const KEY = 'cachet-theme';
  const BG = { notebook: '#f5efe3', night: '#141519' };
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener() {} };
  const choice = () => { try { const v = localStorage.getItem(KEY); return v === 'notebook' || v === 'night' ? v : 'auto'; } catch { return 'auto'; } };
  const current = () => { const c = choice(); return c === 'auto' ? (mq.matches ? 'night' : 'notebook') : c; };
  function apply() {
    const c = choice();
    if (c === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', c);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      const dark = (m.getAttribute('media') || '').includes('dark');
      m.setAttribute('content', c === 'auto' ? BG[dark ? 'night' : 'notebook'] : BG[c]);
    });
  }
  // Interface style (layout and type), separate from light/dark. ?ui=name in the URL sets it.
  const UI_KEY = 'cachet-ui';
  const UIS = ['notebook', 'ledger', 'library', 'table'];
  try { const q = new URLSearchParams(location.search).get('ui'); if (UIS.includes(q)) localStorage.setItem(UI_KEY, q); } catch { /* ignore */ }
  const ui = () => { try { const v = localStorage.getItem(UI_KEY); return UIS.includes(v) ? v : 'notebook'; } catch { return 'notebook'; } };
  const applyUi = () => { const v = ui(); if (v === 'notebook') root.removeAttribute('data-ui'); else root.setAttribute('data-ui', v); };
  applyUi();
  window.CachetTheme = {
    UIS, ui,
    setUi(v) { try { localStorage.setItem(UI_KEY, v); } catch { /* this visit only */ } applyUi(); document.dispatchEvent(new CustomEvent('cachet:ui')); },
    choice, current, dark: () => current() === 'night',
    set(v) { try { localStorage.setItem(KEY, v); } catch { /* applies for this visit only */ } apply(); },
  };
  mq.addEventListener('change', apply);
  apply();
})();
