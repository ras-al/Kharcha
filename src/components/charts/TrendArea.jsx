import { useReducedMotion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { monthLabel } from '../../lib/dates';
import { formatCompact, formatINR } from '../../lib/format';
import ChartTooltip, { axisTick, gridStroke } from './ChartTooltip';

/** Monthly spending trend: total spend as an area, core spend as a line on top. */
export default function TrendArea({ series, height = 280 }) {
  const reduce = useReducedMotion();
  const data = series.map((m) => ({ ...m, label: monthLabel(m.key, 'MMM yy') }));
  const peak = data.reduce((a, b) => (b.expense > a.expense ? b : a), data[0] || { expense: 0 });
  const label = data.length
    ? `Spending trend over ${data.length} months. Highest was ${monthLabel(peak.key, 'MMMM yyyy')} at ${formatINR(peak.expense, { whole: true })}. The table on the Stats page lists every month.`
    : 'Spending trend, no data yet.';
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} />
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={56} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgb(var(--muted))', strokeWidth: 1 }} />
          <Area name="Total spent" type="monotone" dataKey="expense" stroke="rgb(var(--ink))" strokeWidth={2} fill="rgb(var(--ink))" fillOpacity={0.12} isAnimationActive={!reduce} />
          <Area name="Core" type="monotone" dataKey="core" stroke="rgb(var(--muted))" strokeWidth={2.5} strokeDasharray="6 4" fill="none" isAnimationActive={!reduce} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
