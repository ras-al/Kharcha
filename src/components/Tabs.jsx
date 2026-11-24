import { useRef } from 'react';

/** Accessible tab list (arrow keys move between tabs). Panels are rendered by the caller. */
export default function Tabs({ tabs, value, onChange, label, className = '' }) {
  const refs = useRef({});
  const onKey = (e, i) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={`inline-flex rounded-control bg-sunk p-1 ${className}`}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[t.id] = el; }}
          type="button"
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={value === t.id ? 0 : -1}
          onKeyDown={(e) => onKey(e, i)}
          onClick={() => onChange(t.id)}
          className={`rounded-segment px-4 min-h-[40px] text-sm font-bold whitespace-nowrap transition-colors duration-150 ${value === t.id ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
