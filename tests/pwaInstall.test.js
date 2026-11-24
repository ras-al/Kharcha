import { describe, expect, it } from 'vitest';
import {
  DISMISS_COOLDOWN_MS, INSTALL_DISMISSED_KEY, detectInstallPlatform, isInstallDismissed, isStandaloneMode,
  markInstallDismissed, shouldShowInstallPrompt,
} from '../src/lib/pwaInstall';

describe('detectInstallPlatform', () => {
  it('identifies iOS, iPadOS, Android, and other user agents', () => {
    expect(detectInstallPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('ios');
    expect(detectInstallPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe('ios');
    expect(detectInstallPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 9)')).toBe('android');
    expect(detectInstallPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBe('other');
  });
});

describe('isStandaloneMode', () => {
  it('returns true for installed PWA display modes and iOS/Android standalone launches', () => {
    expect(isStandaloneMode({ matchMedia: (q) => ({ matches: q === '(display-mode: standalone)' }) })).toBe(true);
    expect(isStandaloneMode({ navigator: { standalone: true } })).toBe(true);
    expect(isStandaloneMode({ referrer: 'android-app://com.google.android.apps.kharcha' })).toBe(true);
    expect(isStandaloneMode({ matchMedia: () => ({ matches: false }), navigator: { standalone: false }, referrer: '' })).toBe(false);
  });
});

describe('dismissal cooldown & visibility', () => {
  const memoryStorage = () => {
    const map = new Map();
    return {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
    };
  };

  it('respects the 7-day dismissal cooldown', () => {
    const store = memoryStorage();
    const t0 = 1_700_000_000_000;
    expect(isInstallDismissed(store, t0)).toBe(false);

    markInstallDismissed(store, t0);
    expect(store.getItem(INSTALL_DISMISSED_KEY)).toBe(String(t0));
    expect(isInstallDismissed(store, t0 + 1000)).toBe(true);
    expect(isInstallDismissed(store, t0 + DISMISS_COOLDOWN_MS)).toBe(false);
  });

  it('only shows when on mobile, not standalone, and not dismissed', () => {
    expect(shouldShowInstallPrompt({ desktop: false, standalone: false, dismissed: false })).toBe(true);
    expect(shouldShowInstallPrompt({ desktop: true, standalone: false, dismissed: false })).toBe(false);
    expect(shouldShowInstallPrompt({ desktop: false, standalone: true, dismissed: false })).toBe(false);
    expect(shouldShowInstallPrompt({ desktop: false, standalone: false, dismissed: true })).toBe(false);
  });
});

