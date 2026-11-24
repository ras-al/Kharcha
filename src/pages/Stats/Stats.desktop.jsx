import CategoryBars from '../../components/CategoryBars';
import CategoryDonut from '../../components/charts/CategoryDonut';
import MonthlyBars from '../../components/charts/MonthlyBars';
import WeekdayBars from '../../components/charts/WeekdayBars';
import Insights from '../../components/Insights';
import MonthCompare from '../../components/MonthCompare';
import { ErrorState, Skeleton } from '../../components/States';
import { usePeriod } from '../../context/PeriodContext';
import { useBudgets } from '../../hooks/useRecords';
import { useStats } from '../../hooks/useStats';
import { monthLabel } from '../../lib/dates';
import { formatINR } from '../../lib/format';

function Panel({ title, note, className = '', children }) {
  return (
    <section className={`card p-6 ${className}`}>
      <h2 className="text-lg">{title}</h2>
      {note && <p className="text-sm text-muted mt-0.5">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function StatsDesktop() {
  const { month } = usePeriod();
  const s = useStats(month);
  const { limits } = useBudgets();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[40px] leading-tight">Stats</h1>
        <p className="text-muted font-semibold mt-1">{monthLabel(month)} and the eleven months before it.</p>
      </header>
      {s.error && <ErrorState error={s.error} />}

      <div className="grid grid-cols-12 gap-6">
        <Panel title="Categories" className="col-span-4">
          {s.loading ? <Skeleton className="h-[220px]" /> : <CategoryDonut breakdown={s.breakdown} total={s.summary.expense} height={220} />}
          <div className="mt-6"><CategoryBars breakdown={s.breakdown} limits={limits} /></div>
        </Panel>

        <div className="col-span-8 space-y-6">
          <Panel title="Monthly spending" note="Lime is core spending, grey is hostel and academics. The selected month is drawn dark.">
            {s.loading ? <Skeleton className="h-[260px]" /> : <MonthlyBars series={s.series} activeKey={month} />}
          </Panel>
          <div className="grid grid-cols-2 gap-6">
            <Panel title="Weekday pattern" note="Average core spend per weekday.">
              <WeekdayBars data={s.weekday} />
            </Panel>
            <Panel title={s.forecast.isCurrent ? 'Month-end estimate' : 'How the month went'}>
              {s.forecast.isCurrent ? (
                <div className="space-y-3 text-[15px]">
                  <p><span className="eyebrow block">Core pace</span><b className="num text-2xl">{formatINR(s.forecast.pace)}</b> a day</p>
                  <p><span className="eyebrow block">Projected core spend</span><b className="num text-2xl">{formatINR(s.forecast.projectedCore)}</b></p>
                  <p className="text-muted">With hostel and academics already paid, the month lands near <b className="text-ink num">{formatINR(s.forecast.projectedTotal)}</b>.</p>
                </div>
              ) : (
                <div className="space-y-3 text-[15px]">
                  <p><span className="eyebrow block">Daily average</span><b className="num text-2xl">{formatINR(s.avgDaily)}</b></p>
                  <p><span className="eyebrow block">Core spending</span><b className="num text-2xl">{formatINR(s.summary.core)}</b></p>
                </div>
              )}
            </Panel>
          </div>
        </div>

        <Panel title="Compare two months" className="col-span-7"><MonthCompare anchor={month} /></Panel>
        <Panel title="Observations" className="col-span-5">
          {s.insights.length ? <Insights items={s.insights} /> : <p className="text-muted text-sm">Not enough history yet to say anything useful.</p>}
        </Panel>

        <Panel title="Month by month" className="col-span-12" note="The last column matches the old Monthly sheet, which also subtracted income.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-right">
                  <th scope="col" className="py-2 text-left font-semibold">Month</th>
                  <th scope="col" className="py-2 font-semibold">Spent</th>
                  <th scope="col" className="py-2 font-semibold">Core</th>
                  <th scope="col" className="py-2 font-semibold">Hostel and academics</th>
                  <th scope="col" className="py-2 font-semibold">Income</th>
                  <th scope="col" className="py-2 font-semibold">Net</th>
                  <th scope="col" className="py-2 font-semibold">Core minus income</th>
                </tr>
              </thead>
              <tbody>
                {[...s.series].reverse().map((m) => (
                  <tr key={m.key} className={`border-t border-line text-right num ${m.key === month ? 'font-bold' : ''}`}>
                    <th scope="row" className="py-2.5 text-left font-semibold">{monthLabel(m.key, 'MMMM yyyy')}</th>
                    <td className="py-2.5">{formatINR(m.expense)}</td>
                    <td className="py-2.5">{formatINR(m.core)}</td>
                    <td className="py-2.5 text-muted">{formatINR(m.fixed)}</td>
                    <td className="py-2.5 text-income">{formatINR(m.income)}</td>
                    <td className={`py-2.5 ${m.net < 0 ? 'text-expense' : 'text-income'}`}>{formatINR(m.net, { signed: true })}</td>
                    <td className="py-2.5">{formatINR(m.coreNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
