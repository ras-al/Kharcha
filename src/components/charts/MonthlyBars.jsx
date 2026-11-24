import { useReducedMotion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { monthLabel } from '../../lib/dates';
import { formatCompact, formatINR } from '../../lib/format';
import ChartTooltip, { axisTick, gridStroke } from './ChartTooltip';

/**
 * Month bars. mode "expense" shows core vs fixed stacked; mode "compare"
 * shows income beside expense.
 */
export default function MonthlyBars({ series, mode = 'expense', height = 260, activeKey, narrow = false }) {
  const reduce = useReducedMotion();
  const data = series.map((m) => ({ ...m, label: monthLabel(m.key, narrow ? 'MMMMM' : 'MMM') }));
  const summary = data.map((m) => (mode === 'compare'
    ? `${monthLabel(m.key, 'MMMM')}: income ${formatINR(m.income, { whole: true })}, spent ${formatINR(m.expense, { whole: true })}`
    : `${monthLabel(m.key, 'MMMM')}: ${formatINR(m.expense, { whole: true })}`)).join('; ');
  return (
    <div style={{ height }} role="img" aria-label={`Bar chart by month. ${summary}.`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="0" />
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={formatCompact} width={narrow ? 44 : 56} />
          <Tooltip cursor={{ fill: 'rgb(var(--sunk))' }} content={<ChartTooltip labelFormatter={(l) => l} />} />
          {mode === 'compare' ? (
            <>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
              <Bar name="Income" dataKey="income" fill="rgb(var(--income))" radius={[4, 4, 0, 0]} isAnimationActive={!reduce} />
              <Bar name="Spent" dataKey="expense" fill="rgb(var(--expense))" radius={[4, 4, 0, 0]} isAnimationActive={!reduce} />
            </>
          ) : (
            <>
              <Bar name="Core" dataKey="core" stackId="s" fill="rgb(var(--chart-bar))" isAnimationActive={!reduce}>
                {data.map((d) => <Cell key={d.key} fill={d.key === activeKey ? 'rgb(var(--ink))' : 'rgb(var(--chart-bar))'} />)}
              </Bar>
              <Bar name="Hostel and academics" dataKey="fixed" stackId="s" fill="rgb(var(--line))" radius={[4, 4, 0, 0]} isAnimationActive={!reduce} />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
