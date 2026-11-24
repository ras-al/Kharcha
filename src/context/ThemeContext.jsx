/**
 * Display preference: colour theme.
 * Stored in localStorage for an instant first paint and mirrored to
 * users/{uid}/settings/profile so they follow the user across devices.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);
const THEME_KEY = 'kharcha.theme';

localStorage.removeItem('kharcha.view');

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'system');
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  useEffect(() => {
    const mql = darkQuery();
    const onChange = (e) => setSystemDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0A0A0A');
  }, [resolved]);

  // Pull saved preferences once signed in. The service is imported lazily
  // so Firestore stays out of the sign-in screen's download.
  useEffect(() => {
    if (!user) return undefined;
    let stop = () => {};
    let cancelled = false;
    import('../services/records.service').then(({ subscribeProfile }) => {
      if (cancelled) return;
      stop = subscribeProfile(user.uid, (p) => {
      if (p.theme) {
        setThemeState(p.theme);
        localStorage.setItem(THEME_KEY, p.theme);
      }
      }, () => {});
    });
    return () => { cancelled = true; stop(); };
  }, [user]);

  const persist = useCallback((patch) => {
    if (user) import('../services/records.service').then(({ saveProfile }) => saveProfile(user.uid, { ...patch, currency: 'INR' }));
  }, [user]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    localStorage.setItem(THEME_KEY, next);
    persist({ theme: next });
  }, [persist]);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => useContext(PreferencesContext);
