// Runs before React hydration to prevent light/dark flash.
// Loaded via next/script strategy="beforeInteractive" in app/layout.tsx.
(function () {
  try {
    var s = localStorage.getItem('nc-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    var shouldBeLight = s ? s !== 'dark' : !prefersDark;
    document.documentElement.classList.toggle('light', shouldBeLight);
  } catch {}
})();
