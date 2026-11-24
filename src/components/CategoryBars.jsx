import { budgetStatus } from '../lib/stats';
import { formatINR } from '../lib/format';
import CategoryIcon from './CategoryIcon';
import ProgressBar from './ProgressBar';

/** Category list with progress bars: budget used when a limit exists, otherwise share of the month. */
export default function CategoryBars({ breakdown, limits = {} }) {
  if (!breakdown.length) return <p className="text-muted text-sm">No spending this month yet.</p>;
  return (
    <ul className="space-y-4">
      {breakdown.map((b) => {
        const limit = limits[b.id];
        const st = limit ? budgetStatus(b.value, limit) : { ratio: b.share, level: 'ok' };
        return (
          <li key={b.id} className="flex items-center gap-3">
            <CategoryIcon id={b.id} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold">{b.id}</span>
                <span className="num font-bold">{formatINR(b.value)}</span>
              </div>
              <ProgressBar ratio={st.ratio} level={limit ? st.level : 'ok'} label={limit ? `${b.id} budget used` : `${b.id} share of spending`} />
              <p className="text-xs text-muted font-semibold mt-1">
                {limit ? `${Math.round(st.ratio * 100)}% of ${formatINR(limit)} budget` : `${Math.round(b.share * 100)}% of the month`}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
