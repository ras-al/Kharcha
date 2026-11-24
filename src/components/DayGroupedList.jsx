import { Fragment, useMemo } from 'react';
import { dayHeading, dayKey } from '../lib/dates';
import { formatINR } from '../lib/format';

/** Groups transactions under sticky day headers with that day's net total. */
export default function DayGroupedList({ items, renderRow, stickyTop = 0 }) {
  const groups = useMemo(() => {
    const map = new Map();
    for (const t of items) {
      const k = dayKey(t.date);
      if (!map.has(k)) map.set(k, { key: k, date: t.date, items: [], spent: 0 });
      const g = map.get(k);
      g.items.push(t);
      if (t.type === 'expense') g.spent += t.amount;
    }
    return [...map.values()];
  }, [items]);

  return (
    <div>
      {groups.map((g) => (
        <Fragment key={g.key}>
          <h3
            className="sticky z-10 flex justify-between items-baseline bg-bg px-[18px] pt-4 pb-2 text-[13px] font-bold text-muted tracking-normal"
            style={{ top: stickyTop }}
          >
            <span>{dayHeading(g.date)}</span>
            {g.spent > 0 && <span className="num font-semibold">{formatINR(g.spent)} spent</span>}
          </h3>
          <ul className="card p-1">
            {g.items.map((t) => <li key={t.id}>{renderRow(t)}</li>)}
          </ul>
        </Fragment>
      ))}
    </div>
  );
}
