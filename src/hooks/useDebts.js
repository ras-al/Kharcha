import { startOfDay } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { buildDebtExpense, debtDirection, summarizeDebts } from '../lib/debts';
import { formatINR, round2 } from '../lib/format';
import { deleteRecord, saveRecord } from '../services/records.service';
import { addTransaction, deleteTransaction } from '../services/transactions.service';
import { useCollection } from './useCollection';

function debtDoc(data, overrides = {}) {
  const dir = debtDirection(data);
  return {
    direction: dir,
    person: data.person.trim(),
    amount: round2(Number(data.amount)),
    category: dir === 'given' ? null : data.category,
    date: startOfDay(data.date),
    note: (data.note || '').trim(),
    status: data.status || 'pending',
    completedDate: data.completedDate ?? null,
    transactionId: data.transactionId ?? null,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/** Live debts list, totals by direction/friend, and mutations including complete-to-expense. */
export function useDebts() {
  const { user } = useAuth();
  const toast = useToast();
  const uid = user?.uid;
  const { data, loading, error } = useCollection('debts');

  const derived = useMemo(() => summarizeDebts(data), [data]);

  const add = useCallback((input) => {
    const payload = debtDoc(input, { status: 'pending', completedDate: null, transactionId: null });
    const id = saveRecord(uid, 'debts', payload);
    const msg = payload.direction === 'given'
      ? `Lent ${formatINR(payload.amount)} to ${payload.person}`
      : `Debt of ${formatINR(payload.amount)} to ${payload.person} added`;
    toast(msg);
    return id;
  }, [uid, toast]);

  const update = useCallback((id, input, existing = {}) => {
    const payload = debtDoc({ ...existing, ...input });
    saveRecord(uid, 'debts', payload, id);
    toast('Debt updated');
  }, [uid, toast]);

  const reopen = useCallback((debt, { silent = false } = {}) => {
    if (debt.transactionId) deleteTransaction(uid, debt.transactionId);
    saveRecord(uid, 'debts', debtDoc(debt, { status: 'pending', completedDate: null, transactionId: null }), debt.id);
    if (!silent) {
      toast(debtDirection(debt) === 'given'
        ? `Moved debt from ${debt.person} back to pending`
        : `Reopened debt to ${debt.person} and removed expense`);
    }
  }, [uid, toast]);

  const complete = useCallback((debt, completedDate = new Date()) => {
    if (debt.status === 'completed') return null;
    const doneOn = startOfDay(completedDate);
    const dir = debtDirection(debt);
    // Only money I owed becomes an expense when settled; money I gave is tracked as receivable only.
    const txId = dir === 'owed' ? addTransaction(uid, buildDebtExpense(debt, doneOn)) : null;
    const next = debtDoc(debt, { status: 'completed', completedDate: doneOn, transactionId: txId });
    saveRecord(uid, 'debts', next, debt.id);
    const message = dir === 'owed'
      ? `Completed · ${formatINR(debt.amount)} added to ${debt.category} expenses`
      : `Received ${formatINR(debt.amount)} from ${debt.person}`;
    toast(message, {
      action: { label: 'Undo', onClick: () => reopen({ ...debt, ...next, id: debt.id }, { silent: true }) },
    });
    return txId;
  }, [uid, toast, reopen]);

  const remove = useCallback((debt) => {
    deleteRecord(uid, 'debts', debt.id);
    const { id, ...rest } = debt;
    toast(`Deleted debt (${debt.person})`, {
      action: { label: 'Undo', onClick: () => saveRecord(uid, 'debts', debtDoc(rest), id) },
    });
  }, [uid, toast]);

  return {
    items: data,
    ...derived,
    loading,
    error,
    add,
    update,
    complete,
    reopen,
    remove,
  };
}
