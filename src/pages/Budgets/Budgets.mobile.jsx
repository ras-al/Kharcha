import BudgetEditor from '../../components/BudgetEditor';
import { ErrorState, ListSkeleton } from '../../components/States';
import TemplateManager from '../../components/TemplateManager';
import { useBudgets } from '../../hooks/useRecords';
import { useStats } from '../../hooks/useStats';
import { monthKey } from '../../lib/dates';

export default function BudgetsMobile() {
  const { summary, loading } = useStats(monthKey(new Date()));
  const { limits, setLimit, error } = useBudgets();
  return (
    <div className="pt-4 space-y-5">
      <header>
        <h1 className="text-[28px]">Budgets</h1>
        <p className="text-muted mt-1">Set a monthly limit for any category. You get a message at 80% and again at 100%.</p>
      </header>
      {error && <ErrorState error={error} />}
      <section className="card px-5 py-1">
        {loading ? <ListSkeleton rows={4} /> : <BudgetEditor byCategory={summary.byCategory} limits={limits} setLimit={setLimit} />}
      </section>
      <section className="card p-5">
        <h2 className="text-lg">Recurring templates</h2>
        <p className="text-sm text-muted mt-1 mb-4">For payments you make every month, like the hostel fee. They show up as one-tap chips on Home.</p>
        <TemplateManager />
      </section>
    </div>
  );
}
