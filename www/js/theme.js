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
  window.CachetTheme = {
    choice, current, dark: () => current() === 'night',
    set(v) { try { localStorage.setItem(KEY, v); } catch { /* applies for this visit only */ } apply(); },
  };
  mq.addEventListener('change', apply);
  apply();
})();
