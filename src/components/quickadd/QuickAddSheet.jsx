import { Backspace } from '@phosphor-icons/react';
import { useQuickAdd } from '../../context/QuickAddContext';
import { useTransactionActions } from '../../hooks/useTransactionActions';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { formatNumber } from '../../lib/format';
import { Sheet } from '../Overlay';
import { CategoryPicker, DateNoteFields, SourcePicker, TypeToggle } from './FormParts';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

/** Mobile add/edit: a full-height sheet with a big amount and a numeric keypad. */
export default function QuickAddSheet() {
  const { open, editing, preset, close } = useQuickAdd();
  return (
    <Sheet open={open} onClose={close} title={editing ? 'Edit transaction' : 'Add'} full>
      {open && <SheetBody key={editing?.id || 'new'} editing={editing} preset={preset} onDone={close} />}
    </Sheet>
  );
}

function SheetBody({ editing, preset, onDone }) {
  const form = useTransactionForm({ editing, preset, onDone });
  const { remove } = useTransactionActions();
  const { values, set, press, errors, submit } = form;
  const [whole, frac] = values.amount.split('.');
  const display = values.amount === '' ? '0' : `${formatNumber(Number(whole || 0))}${frac !== undefined ? `.${frac}` : ''}`;

  return (
    <form onSubmit={submit} className="flex flex-col min-h-full gap-5 pt-1" noValidate>
      <TypeToggle value={values.type} onChange={(t) => set('type', t)} className="self-start" />

      <div>
        <p className="eyebrow">{values.type === 'income' ? 'You received' : 'You spent'}</p>
        <p
          className={`num font-extrabold leading-none mt-1 break-all ${values.amount === '' ? 'text-muted' : ''}`}
          style={{ fontSize: display.length > 8 ? 44 : 56 }}
          aria-live="polite"
          aria-label={`Amount ${display} rupees`}
        >
          ₹{display}
        </p>
        {errors.amount && <p className="field-error">{errors.amount}</p>}
      </div>

      {values.type === 'expense'
        ? <CategoryPicker value={values.category} onChange={(c) => set('category', c)} error={errors.category} scroll />
        : <SourcePicker value={values.source} onChange={(s) => set('source', s)} />}

      <DateNoteFields form={form} idPrefix="sheet" />

      <div className="grid grid-cols-3 gap-2 mt-auto" aria-label="Keypad">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            aria-label={k === 'back' ? 'Delete digit' : k === '.' ? 'Decimal point' : k}
            className="h-14 rounded-control bg-sunk text-2xl font-bold num active:bg-line transition-colors duration-100 grid place-items-center"
          >
            {k === 'back' ? <Backspace size={26} weight="bold" /> : k}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        {editing && (
          <button type="button" className="btn-secondary min-h-[56px] text-expense" onClick={() => { onDone(); remove(editing); }}>Delete</button>
        )}
        <button type="submit" className="btn-primary flex-1 min-h-[56px] text-lg">
          {editing ? 'Save changes' : values.type === 'income' ? 'Add income' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
