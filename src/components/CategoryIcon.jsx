import {
  ArrowDownLeft, Bed, Bus, DotsThreeCircle, FirstAidKit, ForkKnife, GraduationCap, PencilSimple, Ticket,
} from '@phosphor-icons/react';
import { categoryColor } from '../lib/categories';

export const CATEGORY_ICONS = {
  Food: ForkKnife,
  Transport: Bus,
  Medical: FirstAidKit,
  Stationery: PencilSimple,
  Academics: GraduationCap,
  Hostel: Bed,
  'Workshop/Events': Ticket,
  Others: DotsThreeCircle,
  Income: ArrowDownLeft,
};

/**
 * Round icon badge. "soft" is the neutral Wise-style circle used in lists;
 * "tint" fills with the category colour at low strength, used in chips.
 */
export default function CategoryIcon({ id, size = 44, variant = 'soft', className = '' }) {
  const Icon = CATEGORY_ICONS[id] || DotsThreeCircle;
  const isIncome = id === 'Income';
  const style = variant === 'tint'
    ? { width: size, height: size, background: `color-mix(in srgb, ${categoryColor(id)} 22%, transparent)` }
    : { width: size, height: size };
  return (
    <span
      aria-hidden="true"
      style={style}
      className={`inline-grid place-items-center rounded-[30%] shrink-0 ${variant === 'soft' ? (isIncome ? 'bg-accent text-accent-ink' : 'bg-sunk text-ink') : 'text-ink'} ${className}`}
    >
      <Icon size={Math.round(size * 0.48)} weight={variant === 'soft' ? 'bold' : 'fill'} />
    </span>
  );
}
