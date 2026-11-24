import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { monthKey, monthLabel, shiftMonth } from '../lib/dates';

/** Previous / next month control with the month name between. */
export default function MonthSwitcher({ value, onChange, className = '', pattern = 'MMMM yyyy', narrow = false }) {
  if (narrow) return <CompactSwitcher value={value} onChange={onChange} className={className} />;
  const atNow = value >= monthKey(new Date());
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => onChange(shiftMonth(value, -1))}>
        <CaretLeft size={20} weight="bold" />
      </button>
      <span className={`font-bold text-center ${narrow ? 'min-w-[5.5rem]' : 'min-w-[8.5rem]'}`} aria-live="polite">{monthLabel(value, pattern)}</span>
      <button type="button" className="icon-btn disabled:opacity-30" aria-label="Next month" disabled={atNow} onClick={() => onChange(shiftMonth(value, 1))}>
        <CaretRight size={20} weight="bold" />
      </button>
    </div>
  );
}

/** Phone version: one tidy control, small arrows hugging the month name. */
function CompactSwitcher({ value, onChange, className }) {
  const atNow = value >= monthKey(new Date());
  return (
    <div className={`inline-flex items-center h-10 rounded-control bg-surface shadow-soft ${className}`}>
      <button type="button" className="grid place-items-center w-10 h-10" aria-label="Previous month" onClick={() => onChange(shiftMonth(value, -1))}>
        <CaretLeft size={16} weight="bold" />
      </button>
      <span className="text-sm font-bold num w-[4.75rem] text-center" aria-live="polite">{monthLabel(value, 'MMM yyyy')}</span>
      <button type="button" className="grid place-items-center w-10 h-10 disabled:opacity-30" aria-label="Next month" disabled={atNow} onClick={() => onChange(shiftMonth(value, 1))}>
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
}
