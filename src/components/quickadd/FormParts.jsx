import { CATEGORY_IDS, INCOME_SOURCES, shortLabel } from '../../lib/categories';
import CategoryIcon from '../CategoryIcon';

/** Expense / Income switch, a two-option radio group. */
export function TypeToggle({ value, onChange, className = '' }) {
  return (
    <div role="radiogroup" aria-label="Type" className={`inline-flex rounded-control bg-sunk p-1 ${className}`}>
      {[['expense', 'Expense'], ['income', 'Income']].map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`rounded-segment px-5 min-h-[40px] text-sm font-bold transition-colors duration-150
            ${value === id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Category chips with icons, like currency chips. Wraps or scrolls. */
export function CategoryPicker({ value, onChange, error, scroll = false }) {
  return (
    <fieldset>
      <legend className="field-label">Category</legend>
      <div role="radiogroup" aria-label="Category" className={`flex gap-2 ${scroll ? 'overflow-x-auto no-scrollbar -mx-5 px-5 pb-1' : 'flex-wrap'}`}>
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
    <fieldset>
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
    <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-3">
      <div>
        <label htmlFor={`${idPrefix}-date`} className="field-label">Date</label>
        <input
          id={`${idPrefix}-date`}
          type="date"
          className="field"
          value={values.date}
          max="2099-12-31"
          onChange={(e) => set('date', e.target.value)}
          aria-invalid={Boolean(errors.date)}
        />
        {errors.date && <p className="field-error">{errors.date}</p>}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-note`} className="field-label">Note</label>
        <input
          id={`${idPrefix}-note`}
          className="field"
          value={values.note}
          maxLength={500}
          placeholder={values.type === 'income' ? 'Who paid you' : 'What was it'}
          onChange={(e) => set('note', e.target.value)}
        />
      </div>
    </div>
  );
}
