import { useMemo } from 'react';
import { monthKey, trailingMonths } from '../lib/dates';
import { round2 } from '../lib/format';
import { useTransactions } from './useTransactions';

/** Workshop and event spending over the last 24 months, with reimbursement totals. */
export function useEvents() {
  const range = useMemo(() => trailingMonths(monthKey(new Date()), 24), []);
  const { data, loading, error } = useTransactions(range);
  return useMemo(() => {
    const items = data.filter((t) => t.type === 'expense' && t.category === 'Workshop/Events');
    const by = (status) => round2(items.filter((t) => (t.reimbursement || 'none') === status).reduce((s, t) => s + t.amount, 0));
    return {
      items,
      total: round2(items.reduce((s, t) => s + t.amount, 0)),
      pending: by('pending'),
      received: by('received'),
      unclaimed: by('none'),
      loading,
      error,
      range,
    };
  }, [data, loading, error, range]);
}

export const REIMBURSE_OPTIONS = [
  ['none', 'Not claimed'],
  ['pending', 'Awaiting'],
  ['received', 'Received'],
];
