import { CATEGORY_IDS, INCOME_SOURCES, shortLabel } from '../../lib/categories';
import CategoryIcon from '../CategoryIcon';

/** Expense / Income / Debt switch, a radio group. */
export function TypeToggle({ value, onChange, allowDebt = false, className = '' }) {
  const options = allowDebt
    ? [['expense', 'Expense'], ['income', 'Income'], ['debt', 'Debt']]
    : [['expense', 'Expense'], ['income', 'Income']];
  return (
    <div role="radiogroup" aria-label="Type" className={`inline-flex rounded-control bg-sunk p-1 ${className}`}>
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`rounded-segment px-3 min-h-[40px] text-sm font-bold truncate transition-colors duration-150
            ${value === id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Borrowed ("I owe") vs lent ("I gave") switch for debt entries. */
export function DebtDirectionToggle({ value = 'owed', onChange, className = '' }) {
  return (
    <div role="radiogroup" aria-label="Debt direction" className={`inline-flex rounded-control bg-sunk p-1 ${className}`}>
      {[['owed', 'I owe'], ['given', 'I gave']].map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`rounded-segment px-4 min-h-[38px] text-sm font-bold truncate transition-colors duration-150
            ${value === id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Friend/person input for debt entries with datalist suggestions from past debts. */
export function PersonField({ value, onChange, error, people = [], direction = 'owed', idPrefix }) {
  const listId = `${idPrefix}-people`;
  const label = direction === 'given' ? 'Friend (owes you)' : 'To (friend)';
  return (
    <div className="min-w-0">
      <label htmlFor={`${idPrefix}-person`} className="field-label">{label}</label>
      <input
        id={`${idPrefix}-person`}
        className="field min-w-0"
        value={value}
        maxLength={80}
        list={people.length ? listId : undefined}
        placeholder="e.g. Harun"
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      />
      {people.length > 0 && (
        <datalist id={listId}>
          {people.map((name) => <option key={name} value={name} />)}
        </datalist>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** Category chips with icons, like currency chips. Wraps or scrolls. */
export function CategoryPicker({ value, onChange, error, scroll = false }) {
  return (
    <fieldset className="min-w-0 w-full">
      <legend className="field-label">Category</legend>
      <div role="radiogroup" aria-label="Category" className={`flex gap-2 ${scroll ? 'overflow-x-auto overscroll-x-contain no-scrollbar -mx-5 px-5 pb-1' : 'flex-wrap'}`}>
        {CATEGORY_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            onClick={() => onChange(id)}
            className="chip shrink-0"
          >
            <CategoryIcon id={id} size={32} variant="tint" />
            {shortLabel(id)}
          </button>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

export function SourcePicker({ value, onChange }) {
  return (
    <fieldset className="min-w-0 w-full">
      <legend className="field-label">Source</legend>
      <div role="radiogroup" className="flex gap-2 flex-wrap">
        {INCOME_SOURCES.map((s) => (
          <button key={s.id} type="button" role="radio" aria-checked={value === s.id} onClick={() => onChange(s.id)} className="chip pl-4">
            {s.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function DateNoteFields({ form, idPrefix }) {
  const { values, set, errors } = form;
  return (
    <div className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] gap-3 min-w-0">
      <div className="min-w-0">
        <label htmlFor={`${idPrefix}-date`} className="field-label">Date</label>
        <input
          id={`${idPrefix}-date`}
          type="date"
          className="field min-w-0"
          value={values.date}
          max="2099-12-31"
          onChange={(e) => set('date', e.target.value)}
          aria-invalid={Boolean(errors.date)}
        />
        {errors.date && <p className="field-error">{errors.date}</p>}
      </div>
      <div className="min-w-0">
        <label htmlFor={`${idPrefix}-note`} className="field-label">Note</label>
        <input
          id={`${idPrefix}-note`}
          className="field min-w-0"
          value={values.note}
          maxLength={500}
          placeholder={values.type === 'income' ? 'Who paid you' : values.type === 'debt' ? 'What was it for (e.g. Tea)' : 'What was it'}
          onChange={(e) => set('note', e.target.value)}
        />
      </div>
    </div>
  );
}
