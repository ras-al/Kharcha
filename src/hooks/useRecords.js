/**
 * Fees, hostel, scholarships, budgets and templates. Each hook returns the
 * live list, derived totals and the mutations, so pages stay presentational.
 */
import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_IDS } from '../lib/categories';
import { round2 } from '../lib/format';
import { budgetCategory, deleteRecord, saveRecord, setBudget } from '../services/records.service';
import { useCollection } from './useCollection';

const total = (list) => round2(list.reduce((s, x) => s + x.amount, 0));

function useMutations(name) {
  const { user } = useAuth();
  const uid = user?.uid;
  const save = useCallback((data, id) => saveRecord(uid, name, data, id), [uid, name]);
  const remove = useCallback((id) => deleteRecord(uid, name, id), [uid, name]);
  return { save, remove };
}

export function useFees() {
  const { data, loading, error } = useCollection('fees');
  const { save, remove } = useMutations('fees');

  const derived = useMemo(() => {
    const years = [1, 2, 3, 4].map((year) => {
      const items = data.filter((f) => f.academicYear === year).sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.description.localeCompare(b.description));
      const paid = items.filter((f) => f.status === 'paid');
      return { year, items, total: total(items), paid: total(paid), pending: total(items.filter((f) => f.status !== 'paid')) };
    });
    return {
      years,
      total: total(data),
      paid: total(data.filter((f) => f.status === 'paid')),
      pending: total(data.filter((f) => f.status !== 'paid')),
    };
  }, [data]);

  const toggleStatus = useCallback((fee) => {
    const { id, ...rest } = fee;
    const paid = fee.status !== 'paid';
    save({ ...rest, status: paid ? 'paid' : 'pending', paidDate: paid ? new Date() : null }, id);
  }, [save]);

  return { fees: data, ...derived, loading, error, save, remove, toggleStatus };
}

export function useHostel() {
  const { data, loading, error } = useCollection('hostel');
  const { save, remove } = useMutations('hostel');

  const stays = useMemo(() => {
    const ids = [...new Set(data.map((h) => h.stay ?? 1))].sort((a, b) => a - b);
    return ids.map((stay) => {
      const rows = data.filter((h) => (h.stay ?? 1) === stay);
      const months = rows.filter((h) => h.kind === 'monthly').sort((a, b) => a.month.localeCompare(b.month));
      const deposit = rows.find((h) => h.kind === 'deposit') || null;
      const advance = rows.find((h) => h.kind === 'advance') || null;
      return {
        stay,
        label: rows[0]?.label || `Hostel ${stay}`,
        months,
        deposit,
        advance,
        monthlyTotal: total(months),
        paidTotal: round2(total(months) + (advance?.amount || 0)),
        average: months.length ? round2(total(months) / months.length) : 0,
        from: months[0]?.month,
        to: months[months.length - 1]?.month,
      };
    });
  }, [data]);

  const refundable = round2(stays.reduce((s, x) => s + (x.deposit?.refundable ? x.deposit.amount : 0), 0));
  return {
    stays,
    refundable,
    totalPaid: round2(stays.reduce((s, x) => s + x.paidTotal, 0)),
    loading, error, save, remove,
  };
}

export function useScholarships() {
  const { data, loading, error } = useCollection('scholarships');
  const { save, remove } = useMutations('scholarships');
  const derived = useMemo(() => {
    const items = [...data].sort((a, b) => b.date - a.date);
    const byName = Object.entries(items.reduce((acc, s) => ({ ...acc, [s.name]: (acc[s.name] || 0) + s.amount }), {}))
      .map(([name, amount]) => ({ name, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount);
    return { items, byName, total: total(items) };
  }, [data]);
  return { ...derived, loading, error, save, remove };
}

export function useBudgets() {
  const { user } = useAuth();
  const { data, loading, error } = useCollection('budgets');
  const limits = useMemo(() => {
    const out = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
    for (const b of data) out[budgetCategory(b.id)] = b.monthlyLimit;
    return out;
  }, [data]);
  const setLimit = useCallback((category, value) => setBudget(user.uid, category, value), [user]);
  const hasAny = Object.values(limits).some(Boolean);
  return { limits, hasAny, loading, error, setLimit };
}

export function useTemplates() {
  const { data, loading, error } = useCollection('templates');
  const { save, remove } = useMutations('templates');
  const templates = useMemo(() => [...data].sort((a, b) => a.name.localeCompare(b.name)), [data]);
  return { templates, loading, error, save, remove };
}
