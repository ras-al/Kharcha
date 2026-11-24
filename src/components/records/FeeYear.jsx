import { Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { formatINR } from '../../lib/format';
import { Confirm } from '../Overlay';

/** One academic year: totals, then each fee with a paid/pending switch. */
export default function FeeYear({ year, onToggle, onDelete, onAdd }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const paidRatio = year.total ? year.paid / year.total : 0;

  return (
    <section className="card p-5" aria-labelledby={`year-${year.year}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`year-${year.year}`} className="text-xl">Year {year.year}</h3>
          <p className="text-sm text-muted font-semibold num">
            {year.items.length ? `${formatINR(year.paid)} paid${year.pending ? `, ${formatINR(year.pending)} pending` : ''}` : 'Nothing recorded yet'}
          </p>
        </div>
        <p className="num text-2xl font-extrabold">{formatINR(year.total)}</p>
      </div>
      {year.items.length > 0 && (
        <div className="h-2 rounded-[3px] bg-sunk mt-4 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-income rounded-[3px]" style={{ width: `${paidRatio * 100}%` }} />
        </div>
      )}

      <ul className="mt-3 divide-y divide-line">
        {year.items.map((f) => (
          <li key={f.id} className="flex items-center gap-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{f.description}</p>
              {f.section && <p className="text-xs text-muted font-semibold">{f.section}</p>}
            </div>
            <span className="num font-bold">{formatINR(f.amount)}</span>
            <button
              type="button"
              role="switch"
              aria-checked={f.status === 'paid'}
              aria-label={`${f.description} paid`}
              onClick={() => onToggle(f)}
              className={`rounded-badge min-h-[36px] min-w-[84px] px-3 text-xs font-bold transition-colors duration-150 ${f.status === 'paid' ? 'bg-income/15 text-income' : 'bg-warn/15 text-warn'}`}
            >
              {f.status === 'paid' ? 'Paid' : 'Pending'}
            </button>
            <button type="button" className="icon-btn w-9 h-9 text-muted" aria-label={`Delete ${f.description}`} onClick={() => setPendingDelete(f)}>
              <Trash size={16} weight="bold" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-ghost btn-sm mt-2 -ml-3" onClick={() => onAdd(year.year)}>Add a fee to year {year.year}</button>

      <Confirm open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={() => onDelete(pendingDelete.id)} title="Delete this fee?">
        {pendingDelete?.description} for {formatINR(pendingDelete?.amount || 0)} will be removed.
      </Confirm>
    </section>
  );
}
