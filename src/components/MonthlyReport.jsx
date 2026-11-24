import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useBudgets } from '../hooks/useRecords';
import { useStats } from '../hooks/useStats';
import { CATEGORY_IDS } from '../lib/categories';
import { monthLabel } from '../lib/dates';
import { formatINR, formatPct } from '../lib/format';
import { isLargeExpense } from '../lib/stats';
import Logo from './Logo';
import { ErrorState, Skeleton } from './States';
import { txTitle } from './TxRow';

/**
 * One month on paper. Plain tables, no charts, so it prints cleanly in
 * black and white. Printing hides everything outside `.print-area`.
 */
export default function MonthlyReport({ month }) {
  const { user } = useAuth();
  const s = useStats(month);
  const { limits } = useBudgets();
  if (s.loading) return <Skeleton className="h-[600px]" />;
  if (s.error) return <ErrorState error={s.error} />;

  const sorted = [...s.current].sort((a, b) => a.date - b.date);
  const income = sorted.filter((t) => t.type === 'income');
  const kpis = [
    ['Spent', s.summary.expense],
    ['Core spending', s.summary.core],
    ['Hostel and academics', s.summary.fixed],
    ['Income', s.summary.income],
    ['Net', s.summary.net],
    ['Daily average', s.avgDaily],
  ];

  return (
    <article className="print-area card p-8 text-[14px]">
      <header className="flex items-start justify-between border-b-2 border-ink pb-5">
        <div>
          <h2 className="text-[30px] leading-tight">Monthly report</h2>
          <p className="text-lg font-bold">{monthLabel(month)}</p>
          <p className="text-muted text-sm">{user.displayName || user.email} · printed {format(new Date(), 'd MMM yyyy')}</p>
        </div>
        <Logo />
      </header>

      <section className="print-break mt-6">
        <dl className="grid grid-cols-3 gap-4">
          {kpis.map(([k, v]) => (
            <div key={k} className="border border-line rounded-badge p-3">
              <dt className="text-xs font-bold text-muted">{k}</dt>
              <dd className="num text-xl font-extrabold">{formatINR(v, { signed: k === 'Net' })}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="print-break mt-8">
        <h3 className="text-lg mb-2">By category</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-muted text-xs border-b border-line">
              <th scope="col" className="py-2 font-bold">Category</th>
              <th scope="col" className="py-2 font-bold text-right">Spent</th>
              <th scope="col" className="py-2 font-bold text-right">Share</th>
              <th scope="col" className="py-2 font-bold text-right">Budget</th>
              <th scope="col" className="py-2 font-bold text-right">{monthLabel(s.prevKey, 'MMM')}</th>
              <th scope="col" className="py-2 font-bold text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORY_IDS.map((id) => {
              const v = s.summary.byCategory[id];
              const p = s.prevSummary.byCategory[id];
              if (!v && !p) return null;
              return (
                <tr key={id} className="border-b border-line num">
                  <th scope="row" className="py-2 text-left font-semibold">{id}</th>
                  <td className="py-2 text-right font-bold">{formatINR(v)}</td>
                  <td className="py-2 text-right">{s.summary.expense ? Math.round((v / s.summary.expense) * 100) : 0}%</td>
                  <td className="py-2 text-right">{limits[id] ? formatINR(limits[id]) : ''}</td>
                  <td className="py-2 text-right text-muted">{formatINR(p)}</td>
                  <td className="py-2 text-right">{p ? formatPct(((v - p) / p) * 100) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {s.top.length > 0 && (
        <section className="print-break mt-8">
          <h3 className="text-lg mb-2">Five biggest expenses</h3>
          <ol className="list-decimal pl-5 space-y-1">
            {s.top.map((t) => (
              <li key={t.id}><b className="num">{formatINR(t.amount)}</b> {txTitle(t)} ({t.category}), {format(t.date, 'd MMM')}{isLargeExpense(t, s.median) ? ', large expense' : ''}</li>
            ))}
          </ol>
        </section>
      )}

      {income.length > 0 && (
        <section className="print-break mt-8">
          <h3 className="text-lg mb-2">Money in</h3>
          <ul className="space-y-1">
            {income.map((t) => <li key={t.id}>{format(t.date, 'd MMM')}: <b className="num">{formatINR(t.amount)}</b> {t.note || (t.source === 'scholarship' ? 'Scholarship' : 'Income')}</li>)}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h3 className="text-lg mb-2">Every entry</h3>
        {sorted.length === 0 ? <p className="text-muted">No entries this month.</p> : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-xs border-b border-line">
                <th scope="col" className="py-1.5 font-bold">Date</th>
                <th scope="col" className="py-1.5 font-bold">Category</th>
                <th scope="col" className="py-1.5 font-bold">Note</th>
                <th scope="col" className="py-1.5 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className="border-b border-line/60 print-break">
                  <td className="py-1.5 num">{format(t.date, 'd MMM')}</td>
                  <td className="py-1.5">{t.type === 'income' ? 'Income' : t.category}</td>
                  <td className="py-1.5">{t.note}</td>
                  <td className="py-1.5 text-right num font-semibold">{t.type === 'income' ? '+' : ''}{formatINR(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </article>
  );
}
