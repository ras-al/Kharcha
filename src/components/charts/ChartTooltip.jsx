import { formatINR } from '../../lib/format';

/** Shared tooltip card for every Recharts chart. */
export default function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-control bg-surface shadow-lift px-4 py-3 text-sm min-w-[150px]">
      {label != null && <p className="font-bold mb-1">{labelFormatter ? labelFormatter(label) : label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-muted">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color || p.payload?.fill }} aria-hidden="true" />
            {p.name}
          </span>
          <span className="num font-bold">{formatINR(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export const axisTick = { fill: 'rgb(var(--muted))', fontSize: 12, fontWeight: 600 };
export const gridStroke = 'rgb(var(--line))';
