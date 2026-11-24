import { useRef } from 'react';
import { useTransactionActions } from '../../hooks/useTransactionActions';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { CategoryPicker, DateNoteFields, DebtDirectionToggle, PersonField, SourcePicker, TypeToggle } from './FormParts';

/**
 * Desktop add/edit: the calculator-style card. Used in the dashboard hero
 * and inside the "N" dialog. Typing goes straight into a large amount field.
 */
export default function QuickAddCard({ editing = null, preset = null, onDone, idPrefix = 'card', autoFocus = false, bare = false }) {
  const amountRef = useRef(null);
  const form = useTransactionForm({
    editing,
    preset,
    onDone: () => {
      onDone?.();
      if (!editing) {
        form.reset({ type: form.values.type, debtDirection: form.values.debtDirection, category: form.values.category });
        amountRef.current?.focus();
      }
    },
  });
  const { values, set, errors, submit, people } = form;
  const { remove } = useTransactionActions();
  const amountLabel = values.type === 'income'
    ? 'You received'
    : values.type === 'debt'
      ? (values.debtDirection === 'given' ? 'You gave' : 'You owe')
      : 'You spent';
  const submitLabel = editing
    ? 'Save changes'
    : values.type === 'income'
      ? 'Add income'
      : values.type === 'debt'
        ? (values.debtDirection === 'given' ? 'Add given debt' : 'Add debt')
        : 'Add expense';

  return (
    <form onSubmit={submit} noValidate className={bare ? '' : 'card p-7'}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <TypeToggle value={values.type} onChange={(t) => set('type', t)} allowDebt={!editing} />
        {!bare && <span className="eyebrow">Press N anywhere to add</span>}
      </div>

      <label htmlFor={`${idPrefix}-amount`} className="field-label">{amountLabel}</label>
      <div className={`flex items-center rounded-control bg-sunk border-2 px-5 ${errors.amount ? 'border-expense' : 'border-transparent focus-within:border-ink'}`}>
        <span className="text-[40px] font-extrabold text-muted mr-1" aria-hidden="true">₹</span>
        <input
          id={`${idPrefix}-amount`}
          ref={amountRef}
          data-autofocus={autoFocus || undefined}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={values.amount}
          onChange={(e) => set('amount', e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'))}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? `${idPrefix}-amount-err` : undefined}
          className="num w-full bg-transparent py-3 text-[44px] font-extrabold outline-none placeholder:text-muted/60"
        />
      </div>
      {errors.amount && <p id={`${idPrefix}-amount-err`} className="field-error">{errors.amount}</p>}

      {values.type === 'debt' && (
        <div className="mt-5 space-y-4">
          <DebtDirectionToggle value={values.debtDirection} onChange={(dir) => set('debtDirection', dir)} className="grid grid-cols-2 w-full" />
          <PersonField value={values.person} onChange={(p) => set('person', p)} error={errors.person} people={people} direction={values.debtDirection} idPrefix={idPrefix} />
        </div>
      )}

      {values.type === 'income' && (
        <div className="mt-5">
          <SourcePicker value={values.source} onChange={(s) => set('source', s)} />
        </div>
      )}
      {(values.type === 'expense' || (values.type === 'debt' && values.debtDirection === 'owed')) && (
        <div className="mt-5">
          <CategoryPicker value={values.category} onChange={(c) => set('category', c)} error={errors.category} />
        </div>
      )}

      <div className="mt-5"><DateNoteFields form={form} idPrefix={idPrefix} /></div>

      <div className="flex gap-3 mt-6">
        {editing && (
          <button type="button" className="btn-secondary min-h-[52px] text-expense" onClick={() => { onDone?.(); remove(editing); }}>Delete</button>
        )}
        <button type="submit" className="btn-primary flex-1 min-h-[52px] text-base">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
