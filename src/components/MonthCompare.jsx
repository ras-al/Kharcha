import { useEffect, useState } from 'react';
import { useMonthCompare } from '../hooks/useMonthCompare';
import { monthKey, monthLabel, shiftMonth } from '../lib/dates';
import { formatINR, formatPct } from '../lib/format';
import { Skeleton } from './States';

const recentMonths = (n = 24) => Array.from({ length: n }, (_, i) => shiftMonth(monthKey(new Date()), -i));

function MonthSelect({ id, value, onChange, label, options, pattern }) {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="field-label">{label}</label>
      <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((k) => <option key={k} value={k}>{monthLabel(k, pattern)}</option>)}
      </select>
    </div>
  );
}

/** Pick two months and see each category side by side. */
export default function MonthCompare({ anchor, compact = false }) {
  const [a, setA] = useState(anchor);
  const [b, setB] = useState(shiftMonth(anchor, -1));
  useEffect(() => { setA(anchor); setB(shiftMonth(anchor, -1)); }, [anchor]);
  const { a: sa, b: sb, rows, loading } = useMonthCompare(a, b);
  const options = recentMonths();

  const diff = sa.expense - sb.expense;
  return (
    <div>
      <div className="flex gap-3">
        <MonthSelect id={`cmp-a-${compact}`} value={a} onChange={setA} label="Month" options={options} pattern={compact ? 'MMM yyyy' : 'MMMM yyyy'} />
        <MonthSelect id={`cmp-b-${compact}`} value={b} onChange={setB} label="Compared with" options={options} pattern={compact ? 'MMM yyyy' : 'MMMM yyyy'} />
      </div>
      {loading ? <Skeleton className="h-40 mt-4" /> : (
        <>
          <p className="mt-4 text-[15px]">
            {monthLabel(a, 'MMMM yyyy')}: <b className="num">{formatINR(sa.expense)}</b>, which is{' '}
            <b className={`num ${diff > 0 ? 'text-expense' : 'text-income'}`}>{formatINR(Math.abs(diff))} {diff > 0 ? 'more' : 'less'}</b> than {monthLabel(b, 'MMMM')}.
          </p>
          <table className="w-full text-sm mt-4">
            <caption className="sr-only">Spending per category in both months</caption>
            <thead>
              <tr className="text-muted text-left">
                <th scope="col" className="py-2 font-semibold">Category</th>
                <th scope="col" className="py-2 font-semibold text-right">{monthLabel(a, 'MMM yy')}</th>
                <th scope="col" className="py-2 font-semibold text-right">{monthLabel(b, 'MMM yy')}</th>
                {!compact && <th scope="col" className="py-2 font-semibold text-right">Difference</th>}
                <th scope="col" className="py-2 font-semibold text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <th scope="row" className="py-2.5 text-left font-semibold">{r.id}</th>
                  <td className="py-2.5 text-right num">{formatINR(r.a)}</td>
                  <td className="py-2.5 text-right num text-muted">{formatINR(r.b)}</td>
                  {!compact && <td className={`py-2.5 text-right num font-bold ${r.diff > 0 ? 'text-expense' : r.diff < 0 ? 'text-income' : ''}`}>{formatINR(r.diff, { signed: true })}</td>}
                  <td className="py-2.5 text-right num font-semibold">{r.pct === null ? 'new' : formatPct(r.pct)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="py-4 text-muted">No spending in either month.</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
