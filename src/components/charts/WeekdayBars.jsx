import { useReducedMotion } from 'framer-motion';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import ChartTooltip, { axisTick } from './ChartTooltip';

/** Average core spend per weekday; the highest day is drawn in the ink colour. */
export default function WeekdayBars({ data, height = 200 }) {
  const reduce = useReducedMotion();
  const max = Math.max(...data.map((d) => d.average));
  const label = `Average core spend per weekday. ${data.map((d) => `${d.day} ${Math.round(d.average)} rupees`).join(', ')}.`;
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="short" tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: 'rgb(var(--sunk))' }} content={<ChartTooltip />} />
          <Bar name="Average" dataKey="average" radius={[4, 4, 4, 4]} isAnimationActive={!reduce}>
            {data.map((d) => <Cell key={d.day} fill={d.average === max && max > 0 ? 'rgb(var(--ink))' : 'rgb(var(--accent))'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
