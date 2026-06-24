// Inline script that runs before React hydration to prevent theme flash.
// Reads localStorage; falls back to prefers-color-scheme.
export default function ThemeScript() {
  const script = `
(function(){
  try {
    var s = localStorage.getItem('nc-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = s ? s === 'dark' : prefersDark;
    document.documentElement.classList.toggle('light', !isDark);
  } catch(e){}
})();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
