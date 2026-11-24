import { usePreferences } from '../../context/ThemeContext';
import { addDays, format, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import { dayKey } from '../../lib/dates';
import { formatINR } from '../../lib/format';

// Light runs pale lime to forest; dark runs the other way so busy days stay bright.
const SCALES = {
  light: ['rgb(var(--sunk))', '#D5F5BF', '#9FE870', '#5FAE32', '#2E6B12', '#163300'],
  dark: ['rgb(var(--sunk))', '#2A4A16', '#3F7A1F', '#5FAE32', '#86D457', '#C6F5A6'],
};

/**
 * GitHub-style calendar of daily spending over [from, to). Colour steps are
 * quantiles of the non-zero days so one huge day does not wash out the rest.
 */
export default function CalendarHeatmap({ daily, from, to, cell = 13, gap = 3 }) {
  const [hover, setHover] = useState(null);
  const LEVELS = SCALES[usePreferences().resolved];
  const { weeks, thresholds, months } = useMemo(() => {
    const values = [...daily.values()].filter((v) => v > 0).sort((a, b) => a - b);
    const q = (p) => values[Math.min(values.length - 1, Math.floor(p * values.length))] || 0;
    const th = [q(0.2), q(0.4), q(0.6), q(0.8)];
    const start = startOfWeek(from, { weekStartsOn: 1 });
    const end = to > new Date() ? new Date() : to;
    const cols = [];
    const monthMarks = [];
    for (let w = start, i = 0; w < end; w = addDays(w, 7), i++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(w, d);
        const inRange = date >= from && date < end;
        days.push({ date, inRange, value: inRange ? daily.get(dayKey(date)) || 0 : 0 });
      }
      const first = days.find((d) => d.inRange && d.date.getDate() <= 7);
      if (first && (!monthMarks.length || monthMarks[monthMarks.length - 1].label !== format(first.date, 'MMM'))) {
        monthMarks.push({ col: i, label: format(first.date, 'MMM') });
      }
      cols.push(days);
    }
    return { weeks: cols, thresholds: th, months: monthMarks };
  }, [daily, from, to]);

  const level = (v) => (v <= 0 ? 0 : 1 + thresholds.filter((t) => v > t).length);
  const left = 26;
  const top = 18;
  const width = left + weeks.length * (cell + gap);
  const height = top + 7 * (cell + gap);

  return (
    <div>
      <div className="overflow-x-auto no-scrollbar">
        <svg width={width} height={height} role="img" aria-label="Daily spending calendar for the last twelve months">
          {months.map((m) => (
            <text key={m.col} x={left + m.col * (cell + gap)} y={11} fontSize="11" fontWeight="600" fill="rgb(var(--muted))">{m.label}</text>
          ))}
          {['Mon', 'Wed', 'Fri'].map((d, i) => (
            <text key={d} x={0} y={top + (i * 2) * (cell + gap) + cell - 2} fontSize="10" fontWeight="600" fill="rgb(var(--muted))">{d}</text>
          ))}
          {weeks.map((days, wi) => days.map((d, di) => d.inRange && (
            <rect
              key={`${wi}-${di}`}
              x={left + wi * (cell + gap)}
              y={top + di * (cell + gap)}
              width={cell}
              height={cell}
              rx={2}
              fill={LEVELS[level(d.value)]}
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
            />
          )))}
        </svg>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted font-semibold min-h-[20px]">
        <span aria-live="polite">{hover ? `${format(hover.date, 'EEE d MMM yyyy')}: ${hover.value ? formatINR(hover.value) : 'nothing spent'}` : 'Hover a day for its total'}</span>
        <span className="flex items-center gap-1">Less {LEVELS.map((c) => <span key={c} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />)} More</span>
      </div>
    </div>
  );
}
