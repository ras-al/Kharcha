import { useEffect, useState } from 'react';

const QUERY = '(min-width: 1024px)';

/** Chooses the desktop or mobile component tree and reacts live to resizing. */
export function useIsDesktop() {
  const [matches, setMatches] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return matches;
}
