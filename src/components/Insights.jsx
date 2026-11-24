import { ArrowDownRight, ArrowUpRight, CalendarCheck } from '@phosphor-icons/react';

const TONE = {
  up: { Icon: ArrowUpRight, cls: 'bg-expense/10 text-expense' },
  down: { Icon: ArrowDownRight, cls: 'bg-income/15 text-income' },
  neutral: { Icon: CalendarCheck, cls: 'bg-sunk text-ink' },
};

/** Plain-language observations from lib/stats buildInsights. */
export default function Insights({ items, layout = 'stack' }) {
  if (!items.length) return null;
  return (
    <ul className={layout === 'row' ? 'flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5' : 'space-y-3'}>
      {items.map((i) => {
        const { Icon, cls } = TONE[i.tone] || TONE.neutral;
        return (
          <li key={i.id} className={`card flex items-start gap-3 p-4 ${layout === 'row' ? 'min-w-[260px]' : ''}`}>
            <span className={`grid place-items-center w-9 h-9 rounded-control shrink-0 ${cls}`}><Icon size={18} weight="bold" aria-hidden="true" /></span>
            <p className="font-semibold text-[15px] leading-snug">{i.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
