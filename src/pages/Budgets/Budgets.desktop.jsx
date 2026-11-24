import BudgetEditor from '../../components/BudgetEditor';
import BudgetList from '../../components/BudgetList';
import { ErrorState, Skeleton } from '../../components/States';
import TemplateManager from '../../components/TemplateManager';
import { useBudgets } from '../../hooks/useRecords';
import { useStats } from '../../hooks/useStats';
import { monthKey, monthLabel } from '../../lib/dates';
import { formatINR } from '../../lib/format';

export default function BudgetsDesktop() {
  const key = monthKey(new Date());
  const { summary, loading } = useStats(key);
  const { limits, setLimit, error } = useBudgets();
  const totalLimit = Object.values(limits).reduce((a, b) => a + b, 0);
  const budgeted = Object.entries(limits).filter(([, l]) => l > 0).reduce((s, [id]) => s + (summary.byCategory[id] || 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[40px] leading-tight">Budgets</h1>
        <p className="text-muted font-semibold mt-1">Limits apply to each calendar month. {monthLabel(key)} is shown.</p>
      </header>
      {error && <ErrorState error={error} />}
      <div className="grid grid-cols-12 gap-6 items-start">
        <section className="card px-6 py-2 col-span-7">
          {loading ? <Skeleton className="h-96 my-4" /> : <BudgetEditor byCategory={summary.byCategory} limits={limits} setLimit={setLimit} />}
        </section>
        <div className="col-span-5 space-y-6">
          <section className="card p-6">
            <p className="eyebrow">Budgeted categories this month</p>
            <p className="num text-[32px] font-extrabold leading-tight mt-1">{formatINR(budgeted)} <span className="text-muted text-xl">of {formatINR(totalLimit)}</span></p>
            <div className="mt-5"><BudgetList byCategory={summary.byCategory} limits={limits} /></div>
          </section>
          <section className="card p-6">
            <h2 className="text-lg">Recurring templates</h2>
            <p className="text-sm text-muted mt-1 mb-4">One click adds them for today from the dashboard.</p>
            <TemplateManager />
          </section>
        </div>
      </div>
    </div>
  );
}
