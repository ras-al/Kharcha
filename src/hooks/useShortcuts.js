import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuickAdd } from '../context/QuickAddContext';

const typing = (el) => el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Desktop keyboard shortcuts:
 *   N        new transaction
 *   /        focus search
 *   G then D dashboard, T transactions, S stats, F fees, R reports, B budgets
 */
export function useShortcuts({ focusSearch }) {
  const navigate = useNavigate();
  const { openAdd, open } = useQuickAdd();
  const pendingG = useRef(0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target) || open) return;
      const k = e.key.toLowerCase();
      if (Date.now() - pendingG.current < 1200) {
        pendingG.current = 0;
        const dest = { d: '/', t: '/transactions', s: '/stats', f: '/fees', r: '/reports', b: '/budgets' }[k];
        if (dest) { e.preventDefault(); navigate(dest); }
        return;
      }
      if (k === 'g') pendingG.current = Date.now();
      else if (k === 'n') { e.preventDefault(); openAdd(); }
      else if (e.key === '/') { e.preventDefault(); focusSearch(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, openAdd, open, focusSearch]);
}
