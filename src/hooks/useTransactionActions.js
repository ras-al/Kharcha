import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../lib/format';
import {
  addTransaction, bulkDelete, bulkRecategorize, bulkRestore, deleteTransaction, patchTransaction,
  restoreTransaction, updateTransaction,
} from '../services/transactions.service';

/** Mutations with the confirmation and undo toasts every screen uses. */
export function useTransactionActions() {
  const { user } = useAuth();
  const toast = useToast();
  const uid = user?.uid;

  const add = useCallback((tx, { silent = false } = {}) => {
    const id = addTransaction(uid, tx);
    if (!silent) {
      const what = tx.type === 'income' ? 'Income' : tx.category;
      toast(`${what} ${formatINR(tx.amount)} added`);
    }
    return id;
  }, [uid, toast]);

  const update = useCallback((id, tx) => {
    updateTransaction(uid, id, tx);
    toast('Changes saved');
  }, [uid, toast]);

  const patch = useCallback((id, fields) => patchTransaction(uid, id, fields), [uid]);

  const remove = useCallback((tx) => {
    deleteTransaction(uid, tx.id);
    toast(`Deleted ${formatINR(tx.amount)}`, {
      action: { label: 'Undo', onClick: () => restoreTransaction(uid, tx) },
    });
  }, [uid, toast]);

  const removeMany = useCallback((txs) => {
    bulkDelete(uid, txs);
    toast(`Deleted ${txs.length} transaction${txs.length === 1 ? '' : 's'}`, {
      action: { label: 'Undo', onClick: () => bulkRestore(uid, txs) },
    });
  }, [uid, toast]);

  const recategorize = useCallback((txs, category) => {
    bulkRecategorize(uid, txs, category);
    const n = txs.filter((t) => t.type === 'expense').length;
    toast(`Moved ${n} expense${n === 1 ? '' : 's'} to ${category}`);
  }, [uid, toast]);

  return { add, update, patch, remove, removeMany, recategorize };
}
