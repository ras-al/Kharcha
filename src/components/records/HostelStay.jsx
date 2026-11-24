import { monthLabel } from '../../lib/dates';
import { formatINR } from '../../lib/format';

/** One hostel stay: deposit, advance, and the monthly fees as a mini bar list. */
export default function HostelStay({ stay, onEdit }) {
  const max = Math.max(...stay.months.map((m) => m.amount), 1);
  return (
    <section className="card p-5" aria-labelledby={`stay-${stay.stay}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`stay-${stay.stay}`} className="text-xl">{stay.label}</h3>
          {stay.from && <p className="text-sm text-muted font-semibold">{monthLabel(stay.from, 'MMM yyyy')} to {monthLabel(stay.to, 'MMM yyyy')}</p>}
        </div>
        <div className="text-right">
          <p className="num text-2xl font-extrabold">{formatINR(stay.paidTotal)}</p>
          <p className="text-xs text-muted font-semibold">paid, avg {formatINR(stay.average)} a month</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-tile bg-sunk p-3">
          <dt className="text-xs font-bold text-muted">{stay.deposit?.refundable ? 'Refundable deposit' : 'Deposit'}</dt>
          <dd className="num font-extrabold text-lg">{stay.deposit ? formatINR(stay.deposit.amount) : 'None'}</dd>
        </div>
        <div className="rounded-tile bg-sunk p-3">
          <dt className="text-xs font-bold text-muted">Advance</dt>
          <dd className="num font-extrabold text-lg">{stay.advance ? formatINR(stay.advance.amount) : 'None'}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-1.5" aria-label={`${stay.label} monthly fees`}>
        {stay.months.map((m) => (
          <li key={m.id}>
            <button type="button" className="w-full flex items-center gap-3 rounded-badge px-1 py-1 hover:bg-sunk text-left" onClick={() => onEdit?.(m)}>
              <span className="w-16 text-sm font-semibold text-muted">{monthLabel(m.month, 'MMM yy')}</span>
              <span className="flex-1 h-2.5 rounded-[3px] bg-sunk overflow-hidden" aria-hidden="true">
                <span className="block h-full rounded-[3px] bg-accent" style={{ width: `${(m.amount / max) * 100}%` }} />
              </span>
              <span className="num font-bold text-sm w-20 text-right">{formatINR(m.amount)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted mt-3">Each month is the fee for that month. In the old workbook it was usually paid at the end of the following month.</p>
    </section>
  );
}
