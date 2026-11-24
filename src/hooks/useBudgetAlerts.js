import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { monthKey } from '../lib/dates';
import { crossedThreshold } from '../lib/stats';
import { useBudgets } from './useRecords';
import { useStats } from './useStats';

/**
 * Watches this month's spending and raises a toast the moment a category
 * crosses 80% or 100% of its budget. The first load never alerts.
 */
export function useBudgetAlerts() {
  const toast = useToast();
  const { limits } = useBudgets();
  const { summary, loading } = useStats(monthKey(new Date()));
  const prev = useRef(null);

  useEffect(() => {
    if (loading) return;
    const before = prev.current;
    prev.current = summary.byCategory;
    if (!before) return;
    for (const [cat, limit] of Object.entries(limits)) {
      const hit = crossedThreshold(before[cat] || 0, summary.byCategory[cat] || 0, limit);
      if (hit === 100) toast(`${cat} is over its monthly budget.`, { tone: 'error' });
      else if (hit === 80) toast(`${cat} has used 80% of its monthly budget.`);
    }
  }, [summary, limits, loading, toast]);
}
