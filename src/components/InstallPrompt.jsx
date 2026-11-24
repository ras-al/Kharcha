import { DotsThreeVertical, DownloadSimple, Export, PlusSquare, X } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useIsDesktop } from '../hooks/useIsDesktop';
import {
  detectInstallPlatform, isInstallDismissed, isStandaloneMode, markInstallDismissed, shouldShowInstallPrompt,
} from '../lib/pwaInstall';
import Logo from './Logo';

const FALLBACK_DELAY_MS = 1200;

/**
 * Mobile PWA installation prompt shown on entry when running in a mobile browser.
 * Triggers the native Chrome/Android prompt when available, or displays clear
 * Add-to-Home-Screen guidance on iOS Safari and browsers without `beforeinstallprompt`.
 */
export default function InstallPrompt({ signedIn = false }) {
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const [deferredPrompt, setDeferredPrompt] = useState(() => (typeof window !== 'undefined' ? window.__kharchaInstallPrompt || null : null));
  const [dismissed, setDismissed] = useState(() => (typeof window !== 'undefined' ? isInstallDismissed(window.localStorage) : true));
  const [installed, setInstalled] = useState(() => (typeof window !== 'undefined'
    ? isStandaloneMode({
      matchMedia: window.matchMedia?.bind(window),
      navigator: window.navigator,
      referrer: document.referrer,
    })
    : true));
  const [fallbackReady, setFallbackReady] = useState(false);
  const [installing, setInstalling] = useState(false);

  const platform = typeof navigator !== 'undefined'
    ? detectInstallPlatform(navigator.userAgent, navigator.maxTouchPoints)
    : 'other';

  useEffect(() => {
    const syncPrompt = () => {
      if (window.__kharchaInstallPrompt) setDeferredPrompt(window.__kharchaInstallPrompt);
    };
    const onBeforeInstall = (e) => {
      e.preventDefault();
      window.__kharchaInstallPrompt = e;
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      window.__kharchaInstallPrompt = null;
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('kharcha:installprompt', syncPrompt);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('kharcha:appinstalled', onInstalled);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('kharcha:installprompt', syncPrompt);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('kharcha:appinstalled', onInstalled);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const eligible = shouldShowInstallPrompt({ desktop, standalone: installed, dismissed });

  useEffect(() => {
    if (!eligible || deferredPrompt || platform === 'ios') return undefined;
    const timer = setTimeout(() => setFallbackReady(true), FALLBACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [eligible, deferredPrompt, platform]);

  const dismiss = useCallback(() => {
    markInstallDismissed(window.localStorage);
    setDismissed(true);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt || installing) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      window.__kharchaInstallPrompt = null;
      setDeferredPrompt(null);
      if (choice?.outcome === 'accepted') setInstalled(true);
      else dismiss();
    } catch {
      setFallbackReady(true);
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt, installing, dismiss]);

  const visible = eligible && (Boolean(deferredPrompt) || platform === 'ios' || fallbackReady);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Install Kharcha app"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="no-print fixed inset-x-4 z-40 max-w-md mx-auto"
          style={{ bottom: signedIn ? 'calc(5rem + env(safe-area-inset-bottom))' : 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div className="rounded-card bg-hero text-hero-ink border border-hero-ink/15 p-4 shadow-lift">
            <div className="flex items-start gap-3">
              <Logo compact inverted className="shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-[15px] leading-snug">Install Kharcha</p>
                {deferredPrompt ? (
                  <p className="text-xs font-semibold text-hero-muted mt-0.5">
                    Add to your home screen for quick entry and offline access.
                  </p>
                ) : platform === 'ios' ? (
                  <p className="text-xs font-semibold text-hero-muted mt-1 leading-relaxed">
                    Tap <Export size={14} weight="bold" className="inline -mt-0.5 mx-0.5 text-hero-ink" aria-label="Share" /> Share, then{' '}
                    <PlusSquare size={14} weight="bold" className="inline -mt-0.5 mx-0.5 text-hero-ink" aria-hidden="true" />{' '}
                    <b className="text-hero-ink">Add to Home Screen</b>.
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-hero-muted mt-1 leading-relaxed">
                    Open browser menu <DotsThreeVertical size={14} weight="bold" className="inline -mt-0.5 text-hero-ink" aria-label="Menu" /> and tap{' '}
                    <b className="text-hero-ink">Install app</b> or <b className="text-hero-ink">Add to Home screen</b>.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss install prompt"
                className="rounded-badge w-8 h-8 -mt-1 -mr-1 grid place-items-center text-hero-muted hover:text-hero-ink hover:bg-hero-ink/10 shrink-0"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              {deferredPrompt ? (
                <>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-control px-3.5 min-h-[38px] text-xs font-bold text-hero-muted hover:text-hero-ink hover:bg-hero-ink/10"
                  >
                    Not now
                  </button>
                  <button
                    type="button"
                    onClick={install}
                    disabled={installing}
                    className="inline-flex items-center gap-1.5 rounded-control bg-hero-ink text-hero px-4 min-h-[38px] text-xs font-extrabold hover:opacity-90 active:translate-y-px disabled:opacity-60"
                  >
                    <DownloadSimple size={15} weight="bold" aria-hidden="true" />
                    {installing ? 'Installing…' : 'Install'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-control bg-hero-ink text-hero px-4 min-h-[36px] text-xs font-extrabold hover:opacity-90"
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

