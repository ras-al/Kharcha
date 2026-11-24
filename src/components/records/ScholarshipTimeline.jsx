import { Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { formatINR } from '../../lib/format';

/** Newest first, grouped visually on a vertical line. */
export default function ScholarshipTimeline({ items, onDelete }) {
  if (!items.length) return <p className="text-muted text-sm">No scholarships recorded yet.</p>;
  return (
    <ol className="relative border-l-2 border-line ml-2">
      {items.map((s) => (
        <li key={s.id} className="relative pl-6 pb-5 last:pb-0">
          <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-accent border-4 border-surface" aria-hidden="true" />
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-xs font-bold text-muted">{format(s.date, 'd MMM yyyy')}</p>
              <p className="font-bold">{s.name}</p>
            </div>
            <span className="num font-extrabold text-income">+{formatINR(s.amount)}</span>
            {onDelete && (
              <button type="button" className="icon-btn w-9 h-9 text-muted -mt-1" aria-label={`Delete ${s.name} on ${format(s.date, 'd MMM yyyy')}`} onClick={() => onDelete(s)}>
                <Trash size={16} weight="bold" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
