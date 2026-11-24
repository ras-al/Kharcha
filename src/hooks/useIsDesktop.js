import { useEffect, useState } from 'react';
import { usePreferences } from '../context/ThemeContext';

const QUERY = '(min-width: 1024px)';

/**
 * Chooses the desktop or mobile component tree. Reacts live to resizing and
 * honours the "Layout" setting, which can pin either interface.
 */
export function useIsDesktop() {
  const { viewMode } = usePreferences();
  const [matches, setMatches] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (viewMode === 'desktop') return true;
  if (viewMode === 'mobile') return false;
  return matches;
}
