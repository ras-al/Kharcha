import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePeriod } from '../context/PeriodContext';
import { fromInputDate, monthRange, toInputDate, trailingMonths } from '../lib/dates';

export const RANGE_PRESETS = [
  { id: 'month', label: 'This month' },
  { id: '3m', label: '3 months' },
  { id: 'year', label: 'This year' },
  { id: '12m', label: '12 months' },
  { id: 'custom', label: 'Custom' },
];

/**
 * Filter state for the transactions screens. Search text, category and type
 * live in the URL so other screens can link here (?q=, ?category=, ?type=).
 * The date range always bounds the Firestore query.
 */
export function useTransactionFilters() {
  const { month } = usePeriod();
  const [params, setParams] = useSearchParams();
  const [preset, setPreset] = useState(params.get('range') || 'month');
  const [custom, setCustom] = useState(() => {
    const r = monthRange(month);
    return { from: toInputDate(r.from), to: toInputDate(new Date(r.to.getTime() - 86400000)) };
  });
  const [amount, setAmount] = useState({ min: '', max: '' });

  const q = params.get('q') || '';
  const type = params.get('type') || 'all';
  const categories = useMemo(() => new Set(params.getAll('category')), [params]);

  const range = useMemo(() => {
    if (preset === '3m') return trailingMonths(month, 3);
    if (preset === '12m') return trailingMonths(month, 12);
    if (preset === 'year') {
      const y = Number(month.slice(0, 4));
      return { from: new Date(y, 0, 1), to: new Date(y + 1, 0, 1) };
    }
    if (preset === 'custom') {
      const from = fromInputDate(custom.from);
      const toDay = fromInputDate(custom.to);
      if (from && toDay && toDay >= from) return { from, to: new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate() + 1) };
    }
    return monthRange(month);
  }, [preset, month, custom]);

  const update = useCallback((mutate) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      mutate(next);
      return next;
    }, { replace: true });
  }, [setParams]);

  const setQ = useCallback((value) => update((p) => (value ? p.set('q', value) : p.delete('q'))), [update]);
  const setType = useCallback((value) => update((p) => (value === 'all' ? p.delete('type') : p.set('type', value))), [update]);
  const toggleCategory = useCallback((id) => update((p) => {
    const list = p.getAll('category');
    p.delete('category');
    (list.includes(id) ? list.filter((c) => c !== id) : [...list, id]).forEach((c) => p.append('category', c));
  }), [update]);
  const clearCategories = useCallback(() => update((p) => p.delete('category')), [update]);

  const reset = useCallback(() => {
    update((p) => { p.delete('q'); p.delete('type'); p.delete('category'); });
    setPreset('month');
    setAmount({ min: '', max: '' });
  }, [update]);

  /** Applies the non-date filters to an already range-bounded list. */
  const apply = useCallback((list) => {
    const needle = q.trim().toLowerCase();
    const min = amount.min === '' ? null : Number(amount.min);
    const max = amount.max === '' ? null : Number(amount.max);
    return list.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (categories.size && !categories.has(t.category)) return false;
      if (min !== null && t.amount < min) return false;
      if (max !== null && t.amount > max) return false;
      if (needle) {
        const hay = `${t.note || ''} ${t.category} ${t.source || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, type, categories, amount]);

  const activeCount = (type !== 'all' ? 1 : 0) + categories.size + (preset !== 'month' ? 1 : 0)
    + (amount.min !== '' || amount.max !== '' ? 1 : 0);

  return {
    range, preset, setPreset, custom, setCustom, q, setQ, type, setType,
    categories, toggleCategory, clearCategories, amount, setAmount, apply, activeCount, reset,
  };
}
