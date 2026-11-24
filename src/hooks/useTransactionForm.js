import { useCallback, useMemo, useState } from 'react';
import { fromInputDate, toInputDate } from '../lib/dates';
import { validateDebt, validateTransaction } from '../lib/validation';
import { useDebts } from './useDebts';
import { useTransactionActions } from './useTransactionActions';

const blank = (preset) => ({
  type: preset?.type || 'expense',
  debtDirection: preset?.debtDirection || 'owed',
  amount: preset?.amount != null ? String(preset.amount) : '',
  category: preset?.category || 'Food',
  person: preset?.person || '',
  date: toInputDate(preset?.date || new Date()),
  note: preset?.note || '',
  source: preset?.source || 'other',
});

/**
 * State, validation and submit for adding/editing a transaction or adding a debt.
 * The mobile sheet and the desktop card are two skins over this one hook.
 */
export function useTransactionForm({ editing = null, preset = null, onDone } = {}) {
  const { add, update } = useTransactionActions();
  const { add: addDebt, people } = useDebts();
  const [values, setValues] = useState(() => (editing ? { ...blank(editing), amount: String(editing.amount) } : blank(preset)));
  const [touched, setTouched] = useState(false);

  const parsed = useMemo(() => ({
    ...values,
    direction: values.debtDirection,
    amount: values.amount === '' ? '' : Number(values.amount),
    date: fromInputDate(values.date),
    category: values.type === 'income' ? 'Income' : (values.type === 'debt' && values.debtDirection === 'given' ? null : values.category),
  }), [values]);

  const errors = useMemo(
    () => (values.type === 'debt' ? validateDebt(parsed) : validateTransaction(parsed)),
    [values.type, parsed],
  );
  const shownErrors = touched ? errors : {};

  const set = useCallback((field, value) => setValues((v) => ({ ...v, [field]: value })), []);

  /** Keypad input: digits, one dot, two decimals, sensible max length. */
  const press = useCallback((key) => {
    setValues((v) => {
      let a = v.amount;
      if (key === 'back') a = a.slice(0, -1);
      else if (key === '.') a = a.includes('.') ? a : (a || '0') + '.';
      else if (/^\d$/.test(key)) {
        if (a.includes('.') && a.split('.')[1].length >= 2) return v;
        if (a.replace('.', '').length >= 8) return v;
        a = a === '0' ? key : a + key;
      }
      return { ...v, amount: a };
    });
  }, []);

  const reset = useCallback((next = null) => {
    setValues(blank(next));
    setTouched(false);
  }, []);

  const submit = useCallback((e) => {
    e?.preventDefault?.();
    setTouched(true);
    if (Object.keys(errors).length) return false;
    if (values.type === 'debt' && !editing) {
      addDebt(parsed);
      onDone?.();
      return true;
    }
    const tx = { ...parsed, reimbursement: editing?.reimbursement, tags: editing?.tags, origin: editing?.origin };
    if (editing) update(editing.id, tx);
    else add(tx);
    onDone?.();
    return true;
  }, [errors, values.type, parsed, editing, add, addDebt, update, onDone]);

  return { values, set, press, errors: shownErrors, isValid: !Object.keys(errors).length, submit, reset, isEdit: Boolean(editing), people };
}
