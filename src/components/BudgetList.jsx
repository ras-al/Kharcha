import { Link } from 'react-router-dom';
import { budgetStatus } from '../lib/stats';
import { formatINR } from '../lib/format';
import CategoryIcon from './CategoryIcon';
import ProgressBar from './ProgressBar';

/** Categories that have a monthly limit, with spend so far and a coloured bar. */
export default function BudgetList({ byCategory, limits, limit }) {
  const rows = Object.entries(limits)
    .filter(([, l]) => l > 0)
    .map(([id, l]) => ({ id, limit: l, spent: byCategory[id] || 0, ...budgetStatus(byCategory[id] || 0, l) }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, limit);

  if (!rows.length) {
    return (
      <p className="text-muted text-sm">
        No budgets yet. <Link to="/budgets" className="font-bold text-ink underline underline-offset-2">Set a monthly limit</Link> to get a warning at 80% and 100%.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-3">
          <CategoryIcon id={r.id} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-bold">{r.id}</span>
              <span className="num">
                <b className={r.level === 'over' ? 'text-expense' : r.level === 'warn' ? 'text-warn' : ''}>{formatINR(r.spent)}</b>
                <span className="text-muted"> of {formatINR(r.limit)}</span>
              </span>
            </div>
            <ProgressBar ratio={r.ratio} level={r.level} label={`${r.id} budget used`} />
          </div>
        </li>
      ))}
    </ul>
  );
}
