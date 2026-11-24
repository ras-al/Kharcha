export const INSTALL_DISMISSED_KEY = 'kharcha.installDismissedAt';
export const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** True when already running as an installed PWA (standalone / home screen). */
export function isStandaloneMode({ matchMedia, navigator, referrer } = {}) {
  try {
    if (matchMedia?.('(display-mode: standalone)')?.matches) return true;
    if (matchMedia?.('(display-mode: fullscreen)')?.matches) return true;
    if (matchMedia?.('(display-mode: minimal-ui)')?.matches) return true;
    if (navigator?.standalone === true) return true;
    if (typeof referrer === 'string' && referrer.startsWith('android-app://')) return true;
  } catch {
    return false;
  }
  return false;
}

/** Detects mobile platform so the install prompt gives accurate instructions. */
export function detectInstallPlatform(userAgent = '', maxTouchPoints = 0) {
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  // iPadOS reports Macintosh in UA with touch support.
  if (/\bmacintosh\b/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
  if (/android/i.test(userAgent)) return 'android';
  return 'other';
}

/** True if the user dismissed the install banner within the cooldown window. */
export function isInstallDismissed(storage, now = Date.now()) {
  try {
    const raw = storage?.getItem?.(INSTALL_DISMISSED_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && now - ts < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

/** Persists dismissal timestamp safely (no-op if storage is blocked). */
export function markInstallDismissed(storage, now = Date.now()) {
  try {
    storage?.setItem?.(INSTALL_DISMISSED_KEY, String(now));
  } catch {
    // Ignore storage errors in private browsing.
  }
}

/** Decides whether the mobile install prompt should appear. */
export function shouldShowInstallPrompt({ desktop, standalone, dismissed }) {
  return !desktop && !standalone && !dismissed;
}

