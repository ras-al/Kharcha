import BudgetEditor from '../../components/BudgetEditor';
import { ErrorState, ListSkeleton } from '../../components/States';
import TemplateManager from '../../components/TemplateManager';
import { useBudgets } from '../../hooks/useRecords';
import { useStats } from '../../hooks/useStats';
import { monthKey } from '../../lib/dates';
import MobileHeader from '../../components/MobileHeader';

export default function BudgetsMobile() {
  const { summary, loading } = useStats(monthKey(new Date()));
  const { limits, setLimit, error } = useBudgets();
  return (
    <div className="space-y-4">
      <MobileHeader title="Budgets">Monthly limits per category. You get a message at 80% and at 100%.</MobileHeader>
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
