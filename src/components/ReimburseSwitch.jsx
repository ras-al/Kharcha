import { REIMBURSE_OPTIONS } from '../hooks/useEvents';

/** Three-way status for an event expense. */
export default function ReimburseSwitch({ value = 'none', onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-control bg-sunk p-1">
      {REIMBURSE_OPTIONS.map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`rounded-segment px-3 min-h-[36px] text-xs font-bold transition-colors duration-150 ${value === id ? 'bg-surface shadow-soft text-ink' : 'text-muted hover:text-ink'}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
