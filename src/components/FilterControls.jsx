import { CATEGORY_IDS, shortLabel } from '../lib/categories';
import { RANGE_PRESETS } from '../hooks/useTransactionFilters';
import CategoryIcon from './CategoryIcon';

/** Range, type and category filters. Rendered in the mobile filter sheet and the desktop toolbar. */
export function RangeFilter({ f, idPrefix }) {
  return (
    <fieldset>
      <legend className="field-label">Date range</legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {RANGE_PRESETS.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={f.preset === p.id} className="chip pl-4" onClick={() => f.setPreset(p.id)}>{p.label}</button>
        ))}
      </div>
      {f.preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="field-label" htmlFor={`${idPrefix}-from`}>From</label>
            <input id={`${idPrefix}-from`} type="date" className="field" value={f.custom.from} onChange={(e) => f.setCustom((c) => ({ ...c, from: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor={`${idPrefix}-to`}>To</label>
            <input id={`${idPrefix}-to`} type="date" className="field" value={f.custom.to} onChange={(e) => f.setCustom((c) => ({ ...c, to: e.target.value }))} />
          </div>
        </div>
      )}
    </fieldset>
  );
}

export function TypeFilter({ f }) {
  return (
    <fieldset>
      <legend className="field-label">Type</legend>
      <div role="radiogroup" className="flex gap-2">
        {[['all', 'All'], ['expense', 'Expenses'], ['income', 'Income']].map(([id, label]) => (
          <button key={id} type="button" role="radio" aria-checked={f.type === id} className="chip pl-4" onClick={() => f.setType(id)}>{label}</button>
        ))}
      </div>
    </fieldset>
  );
}

export function CategoryFilter({ f }) {
  return (
    <fieldset>
      <legend className="field-label">Categories</legend>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={f.categories.has(id)} className="chip" onClick={() => f.toggleCategory(id)}>
            <CategoryIcon id={id} size={32} variant="tint" />{shortLabel(id)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
