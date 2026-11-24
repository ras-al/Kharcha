// Applies the saved theme before first paint so dark mode never flashes light,
// and captures PWA install events early before React mounts.
// Kept as a file (not inline) so the Content-Security-Policy can forbid inline scripts.
(function () {
  try {
    var t = localStorage.getItem('kharcha.theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) { /* storage blocked: stay light */ }

  window.__kharchaInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__kharchaInstallPrompt = e;
    window.dispatchEvent(new Event('kharcha:installprompt'));
  });
  window.addEventListener('appinstalled', function () {
    window.__kharchaInstallPrompt = null;
    window.dispatchEvent(new Event('kharcha:appinstalled'));
  });
})();
