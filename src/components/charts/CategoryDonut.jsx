import { useReducedMotion } from 'framer-motion';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { categoryColor, shortLabel } from '../../lib/categories';
import { formatINR } from '../../lib/format';
import ChartTooltip from './ChartTooltip';

/** Spending by category with the total in the hole. `breakdown` comes from useStats. */
export default function CategoryDonut({ breakdown, total, height = 240, centerLabel = 'Spent' }) {
  const reduce = useReducedMotion();
  const data = breakdown.map((b) => ({ name: shortLabel(b.id), value: b.value, fill: categoryColor(b.id) }));
  return (
    <div
      className="relative"
      style={{ height }}
      role="img"
      aria-label={`Spending by category, ${formatINR(total)} in total. ${breakdown.map((b) => `${b.id} ${Math.round(b.share * 100)}%`).join(', ') || 'Nothing spent yet'}.`}
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data.length ? data : [{ name: 'Nothing yet', value: 1, fill: 'rgb(var(--sunk))' }]}
            dataKey="value"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={data.length > 1 ? 2 : 0}
            cornerRadius={3}
            stroke="none"
            isAnimationActive={!reduce}
            animationDuration={600}
          >
            {(data.length ? data : [{ fill: 'rgb(var(--sunk))' }]).map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          {data.length > 0 && <Tooltip content={<ChartTooltip />} />}
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
        <div>
          <p className="eyebrow">{centerLabel}</p>
          <p className="num text-2xl font-extrabold">{formatINR(total)}</p>
        </div>
      </div>
    </div>
  );
}

/** Legend list that doubles as the accessible table for the donut. */
export function CategoryLegend({ breakdown, limit }) {
  const rows = limit ? breakdown.slice(0, limit) : breakdown;
  return (
    <ul className="space-y-2.5">
      {rows.map((b) => (
        <li key={b.id} className="flex items-center gap-3 text-sm">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: categoryColor(b.id) }} aria-hidden="true" />
          <span className="flex-1 font-semibold">{b.id}</span>
          <span className="text-muted num w-10 text-right">{Math.round(b.share * 100)}%</span>
          <span className="num font-bold w-24 text-right">{formatINR(b.value)}</span>
        </li>
      ))}
    </ul>
  );
}
