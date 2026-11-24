import { useEffect, useState } from 'react';
import { CATEGORY_IDS } from '../lib/categories';
import { budgetStatus } from '../lib/stats';
import { formatINR } from '../lib/format';
import CategoryIcon from './CategoryIcon';
import ProgressBar from './ProgressBar';

function LimitInput({ id, value, onSave }) {
  const [text, setText] = useState(value ? String(value) : '');
  useEffect(() => { setText(value ? String(value) : ''); }, [value]);
  const commit = () => {
    const n = text === '' ? 0 : Number(text);
    if (Number.isNaN(n) || n < 0 || n === (value || 0)) return;
    onSave(n);
  };
  return (
    <input
      id={id}
      inputMode="decimal"
      className="field num text-right w-32 min-h-[44px]"
      placeholder="No limit"
      value={text}
      onChange={(e) => setText(e.target.value.replace(/[^\d.]/g, ''))}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
  );
}

/** Every category with this month's spend and an editable monthly limit. */
export default function BudgetEditor({ byCategory, limits, setLimit }) {
  return (
    <ul className="divide-y divide-line">
      {CATEGORY_IDS.map((id) => {
        const spent = byCategory[id] || 0;
        const st = budgetStatus(spent, limits[id]);
        return (
          <li key={id} className="flex items-center gap-4 py-4">
            <CategoryIcon id={id} size={40} />
            <div className="flex-1 min-w-0">
              <label htmlFor={`limit-${id}`} className="font-bold block">{id}</label>
              <p className="text-sm text-muted num">{formatINR(spent)} spent this month{limits[id] ? `, ${Math.round(st.ratio * 100)}% of limit` : ''}</p>
              {limits[id] > 0 && <ProgressBar ratio={st.ratio} level={st.level} label={`${id} budget used`} className="mt-2" height={8} />}
            </div>
            <LimitInput id={`limit-${id}`} value={limits[id]} onSave={(n) => setLimit(id, n)} />
          </li>
        );
      })}
    </ul>
  );
}
