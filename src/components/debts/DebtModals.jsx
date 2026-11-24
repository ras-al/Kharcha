import { HandCoins } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { fromInputDate, toInputDate } from '../../lib/dates';
import { debtDirection } from '../../lib/debts';
import { formatINR } from '../../lib/format';
import { validateDebt } from '../../lib/validation';
import CategoryIcon from '../CategoryIcon';
import { Dialog, Sheet } from '../Overlay';
import { CategoryPicker, DebtDirectionToggle, PersonField } from '../quickadd/FormParts';

/** Renders category icon for owed debts, and a neutral HandCoins tile for given debts. */
export function DebtIcon({ debt, size = 40 }) {
  if (debtDirection(debt) === 'given' || !debt?.category) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size }}
        className="inline-grid place-items-center rounded-[30%] shrink-0 bg-sunk text-ink"
      >
        <HandCoins size={Math.round(size * 0.48)} weight="bold" />
      </span>
    );
  }
  return <CategoryIcon id={debt.category} size={size} />;
}

function ResponsiveModal({ open, onClose, title, width = 520, children }) {
  const desktop = useIsDesktop();
  if (desktop) return <Dialog open={open} onClose={onClose} title={title} width={width}>{children}</Dialog>;
  return <Sheet open={open} onClose={onClose} title={title}>{children}</Sheet>;
}

/** Add or edit a debt entry (direction, amount, friend name, category, date, note). */
export function DebtFormModal({ open, onClose, initial = null, people = [], onSave }) {
  return (
    <ResponsiveModal open={open} onClose={onClose} title={initial ? 'Edit debt' : 'Add debt'}>
      {open && <DebtFormBody key={initial?.id || 'new'} initial={initial} people={people} onSave={onSave} onCancel={onClose} />}
    </ResponsiveModal>
  );
}

function DebtFormBody({ initial, people, onSave, onCancel }) {
  const [direction, setDirection] = useState(debtDirection(initial));
  const [person, setPerson] = useState(initial?.person || '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category || 'Food');
  const [date, setDate] = useState(toInputDate(initial?.date || new Date()));
  const [note, setNote] = useState(initial?.note || '');
  const [touched, setTouched] = useState(false);

  const parsed = {
    direction,
    person,
    amount: amount === '' ? '' : Number(amount),
    category: direction === 'given' ? null : category,
    date: fromInputDate(date),
    note,
  };
  const errors = touched ? validateDebt(parsed) : {};

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validateDebt(parsed)).length) return;
    onSave(parsed);
    onCancel();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 pt-1">
      <DebtDirectionToggle value={direction} onChange={setDirection} className="grid grid-cols-2 w-full" />

      <div>
        <label htmlFor="debt-amount" className="field-label">{direction === 'given' ? 'Amount you gave' : 'Amount you owe'}</label>
        <div className={`flex items-center rounded-control bg-sunk border-2 px-4 ${errors.amount ? 'border-expense' : 'border-transparent focus-within:border-ink'}`}>
          <span className="text-2xl font-extrabold text-muted mr-1" aria-hidden="true">₹</span>
          <input
            id="debt-amount"
            data-autofocus
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'))}
            className="num w-full bg-transparent py-2.5 text-2xl font-extrabold outline-none placeholder:text-muted/60"
          />
        </div>
        {errors.amount && <p className="field-error">{errors.amount}</p>}
      </div>

      <PersonField value={person} onChange={setPerson} error={errors.person} people={people} direction={direction} idPrefix="debt-modal" />

      {direction === 'owed' && <CategoryPicker value={category} onChange={setCategory} error={errors.category} />}

      <div className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] gap-3 min-w-0">
        <div className="min-w-0">
          <label htmlFor="debt-date" className="field-label">Date</label>
          <input
            id="debt-date"
            type="date"
            className="field min-w-0"
            value={date}
            max="2099-12-31"
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className="field-error">{errors.date}</p>}
        </div>
        <div className="min-w-0">
          <label htmlFor="debt-note" className="field-label">Note</label>
          <input
            id="debt-note"
            className="field min-w-0"
            value={note}
            maxLength={200}
            placeholder="What was it for (e.g. Tea)"
            onChange={(e) => setNote(e.target.value)}
          />
          {errors.note && <p className="field-error">{errors.note}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Save debt' : direction === 'given' ? 'Add given debt' : 'Add debt'}
        </button>
      </div>
    </form>
  );
}

/** Confirms debt completion date (logs an expense only for debts you owed). */
export function CompleteDebtModal({ debt, onClose, onConfirm }) {
  const [dateStr, setDateStr] = useState(() => toInputDate(new Date()));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (debt) {
      setDateStr(toInputDate(new Date()));
      setError(null);
    }
  }, [debt]);

  const parsedDate = fromInputDate(dateStr);
  const isGiven = debtDirection(debt) === 'given';

  const submit = (e) => {
    e.preventDefault();
    if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
      setError('Pick the completion date.');
      return;
    }
    onConfirm(debt, parsedDate);
    onClose();
  };

  return (
    <ResponsiveModal open={Boolean(debt)} onClose={onClose} title={isGiven ? 'Mark debt received' : 'Complete debt'} width={440}>
      {debt && (
        <form onSubmit={submit} noValidate className="space-y-4 pt-1">
          <div className="rounded-control bg-sunk p-4">
            <p className="text-sm font-semibold text-muted">
              {isGiven ? `${debt.person} paying you back` : `Paying back ${debt.person}`}
            </p>
            <p className="num text-2xl font-extrabold mt-0.5">{formatINR(debt.amount)}</p>
            <p className="text-sm font-semibold text-muted mt-1">
              {debt.note ? `${debt.note} · ` : ''}{!isGiven && debt.category ? `${debt.category} · ` : ''}{isGiven ? 'given' : 'borrowed'} {format(debt.date, 'd MMM yyyy')}
            </p>
          </div>

          <div>
            <label htmlFor="complete-debt-date" className="field-label">
              {isGiven ? 'Received on' : 'Debt completing date'}
            </label>
            <input
              id="complete-debt-date"
              type="date"
              data-autofocus
              className="field"
              value={dateStr}
              max="2099-12-31"
              onChange={(e) => { setDateStr(e.target.value); setError(null); }}
            />
            {error && <p className="field-error">{error}</p>}
          </div>

          <p className="text-sm text-muted">
            {isGiven ? (
              <>Marks this debt as received{parsedDate ? ` on ${format(parsedDate, 'd MMM yyyy')}` : ''}. No expense or income is added.</>
            ) : (
              <>
                Completing this debt will automatically add a <b className="text-ink num">{formatINR(debt.amount)}</b>{' '}
                <b className="text-ink">{debt.category}</b> expense{parsedDate ? ` on ${format(parsedDate, 'd MMM yyyy')}` : ''}.
              </>
            )}
          </p>

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              {isGiven ? 'Mark received' : 'Complete & add expense'}
            </button>
          </div>
        </form>
      )}
    </ResponsiveModal>
  );
}
