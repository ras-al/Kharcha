import { Receipt, UploadSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BudgetList from '../../components/BudgetList';
import CalendarHeatmap from '../../components/charts/CalendarHeatmap';
import CategoryDonut, { CategoryLegend } from '../../components/charts/CategoryDonut';
import MonthlyBars from '../../components/charts/MonthlyBars';
import TrendArea from '../../components/charts/TrendArea';
import WeekdayBars from '../../components/charts/WeekdayBars';
import Insights from '../../components/Insights';
import Money from '../../components/Money';
import { Drawer } from '../../components/Overlay';
import QuickAddCard from '../../components/quickadd/QuickAddCard';
import { EmptyState, ErrorState, Skeleton } from '../../components/States';
import TemplateChips from '../../components/TemplateChips';
import TxRow from '../../components/TxRow';
import { usePeriod } from '../../context/PeriodContext';
import { useBudgets } from '../../hooks/useRecords';
import { useStats } from '../../hooks/useStats';
import { monthLabel } from '../../lib/dates';
import { formatINR, formatPct } from '../../lib/format';
import TxDetail from '../../components/TxDetail';

function Kpi({ label, value, hint, tone, loading }) {
  return (
    <div className="card col-span-2 p-5">
      <p className="eyebrow">{label}</p>
      {loading ? <Skeleton className="h-8 w-28 mt-2" /> : (
        <p className="text-[26px] font-extrabold leading-tight mt-1"><Money value={value} animate tone={tone} whole /></p>
      )}
      {hint && <p className="text-xs text-muted font-semibold mt-1">{hint}</p>}
    </div>
  );
}

function Panel({ title, action, className = '', children }) {
  return (
    <section className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4 min-h-[28px]">
        <h2 className="text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function HomeDesktop() {
  const { month, isCurrent } = usePeriod();
  const s = useStats(month);
  const { limits } = useBudgets();
  const [detailId, setDetailId] = useState(null);
  const detail = detailId ? s.all.find((t) => t.id === detailId) : null;
  const name = monthLabel(month, 'MMMM');
  const base = isCurrent ? s.prevToDateSummary.expense : s.prevSummary.expense;
  const delta = base ? ((s.summary.expense - base) / base) * 100 : null;
  const empty = !s.loading && s.all.length === 0;

  return (
    <div className="space-y-6">
      {/* Hero: headline on the left, calculator-style add card on the right. */}
      <section className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-7 pt-4 pr-6">
          <p className="eyebrow text-[15px]">{monthLabel(month)}</p>
          {s.loading ? <Skeleton className="h-14 w-[28rem] mt-3" /> : (
            <h1 className="text-[56px] leading-[1.02] mt-2"><Money value={s.summary.expense} animate /> spent in {name}.</h1>
          )}
          {!s.loading && (
            <p className="text-[19px] text-muted mt-4 max-w-[38rem] leading-relaxed">
              <b className="text-ink num">{formatINR(s.summary.core)}</b> on daily life and events,{' '}
              <b className="text-ink num">{formatINR(s.summary.fixed)}</b> on hostel and academics.
              {delta !== null && <> That is <b className="text-ink num">{formatPct(delta)}</b> against {monthLabel(s.prevKey, 'MMMM')}{isCurrent ? ' at this point' : ''}.</>}
              {s.forecast.isCurrent && s.summary.core > 0 && <> Core spending is heading for about <b className="text-ink num">{formatINR(s.forecast.projectedCore)}</b> by month end.</>}
            </p>
          )}
          <div className="mt-8"><TemplateChips /></div>
          {s.insights.length > 0 && <div className="mt-8 max-w-[38rem]"><Insights items={s.insights} /></div>}
        </div>
        <div className="col-span-5">
          <QuickAddCard idPrefix="hero" />
        </div>
      </section>

      {s.error && <ErrorState error={s.error} />}

      {empty ? (
        <div className="card">
          <EmptyState icon={Receipt} title="No transactions in the last twelve months" action={(
            <Link to="/settings/import" className="btn-primary"><UploadSimple size={18} weight="bold" aria-hidden="true" />Import Expense.xlsx</Link>
          )}>
            Add one with the card above, or import your spreadsheet to see the charts fill in.
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <Kpi label={`Spent in ${month.slice(0, 4)}`} value={s.ytd.expense} hint="January to this month" loading={s.loading} />
          <Kpi label="This month" value={s.summary.expense} loading={s.loading} />
          <Kpi label="Income" value={s.summary.income} tone="income" hint={name} loading={s.loading} />
          <Kpi label="Net" value={s.summary.net} tone={s.summary.net < 0 ? 'expense' : 'income'} hint="Income minus spending" loading={s.loading} />
          <Kpi label="Core spending" value={s.summary.core} hint="Without hostel and academics" loading={s.loading} />
          <Kpi label="Daily average" value={s.avgDaily} hint={s.forecast.isCurrent ? `Over ${s.forecast.elapsed} days so far` : `Over ${s.forecast.total} days`} loading={s.loading} />

          <Panel title="Monthly trend" className="col-span-8" action={<span className="text-sm text-muted font-semibold">Last 12 months. Dashed line is core spending</span>}>
            {s.loading ? <Skeleton className="h-[280px]" /> : <TrendArea series={s.series} />}
          </Panel>
          <Panel title={`Categories in ${name}`} className="col-span-4">
            {s.loading ? <Skeleton className="h-[240px]" /> : (
              <>
                <CategoryDonut breakdown={s.breakdown} total={s.summary.expense} height={200} />
                <div className="mt-5"><CategoryLegend breakdown={s.breakdown} limit={5} /></div>
              </>
            )}
          </Panel>

          <Panel title="Daily spending" className="col-span-8" action={<span className="text-sm text-muted font-semibold">Median day {formatINR(s.median)} (core)</span>}>
            {s.loading ? <Skeleton className="h-[150px]" /> : <CalendarHeatmap daily={s.daily} from={s.span.from} to={s.span.to} />}
            <h3 className="text-[15px] mt-6 mb-1">Average core spend by weekday</h3>
            <WeekdayBars data={s.weekday} height={130} />
          </Panel>
          <Panel title="Biggest this month" className="col-span-4">
            {s.top.length ? (
              <ol className="-mx-4 -my-2">
                {s.top.map((t) => <li key={t.id}><TxRow tx={t} median={s.median} showDate onClick={() => setDetailId(t.id)} /></li>)}
              </ol>
            ) : <p className="text-muted text-sm">Nothing spent in {name} yet.</p>}
          </Panel>

          <Panel title="Income and spending" className="col-span-6">
            {s.loading ? <Skeleton className="h-[260px]" /> : <MonthlyBars series={s.series.slice(-6)} mode="compare" />}
          </Panel>
          <Panel title="Budgets" className="col-span-6" action={<Link to="/budgets" className="text-sm font-bold underline underline-offset-2">Edit</Link>}>
            <BudgetList byCategory={s.summary.byCategory} limits={limits} limit={6} />
          </Panel>
        </div>
      )}

      <Drawer open={Boolean(detail)} onClose={() => setDetailId(null)} title="Transaction">
        {detail && <TxDetail tx={detail} median={s.median} onClose={() => setDetailId(null)} />}
      </Drawer>
    </div>
  );
}
