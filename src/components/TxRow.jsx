import { Lightning } from '@phosphor-icons/react';
import { shortLabel } from '../lib/categories';
import { dayHeading } from '../lib/dates';
import { isLargeExpense } from '../lib/stats';
import CategoryIcon from './CategoryIcon';
import { TxAmount } from './Money';

const SOURCE_LABEL = { scholarship: 'Scholarship', other: 'Income' };

export function txTitle(tx) {
  if (tx.note) return tx.note;
  return tx.type === 'income' ? SOURCE_LABEL[tx.source] || 'Income' : tx.category;
}

export function txSubtitle(tx) {
  if (tx.type === 'income') return tx.note ? SOURCE_LABEL[tx.source] || 'Income' : 'Money in';
  const parts = [tx.note ? shortLabel(tx.category) : null];
  if (tx.reimbursement === 'pending') parts.push('Awaiting reimbursement');
  if (tx.reimbursement === 'received') parts.push('Reimbursed');
  return parts.filter(Boolean).join(' · ') || 'Spent';
}

export function LargeBadge({ compact = false }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-badge bg-warn/15 text-warn px-1.5 py-0.5 text-[11px] leading-none font-bold whitespace-nowrap shrink-0" title="More than 3 times your median core day">
      <Lightning size={11} weight="fill" aria-hidden="true" />{compact ? 'Large' : 'Large expense'}
      {compact && <span className="sr-only"> expense</span>}
    </span>
  );
}

/**
 * Wise-style detail row: icon circle, title and category, amount on the right.
 * Renders as a button when `onClick` is passed.
 */
export default function TxRow({ tx, median = 0, onClick, selected = false, showDate = false, className = '' }) {
  const large = isLargeExpense(tx, median);
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3 min-h-[68px] text-left transition-colors duration-150
        ${onClick ? 'hover:bg-sunk/70 rounded-control' : ''} ${selected ? 'bg-sunk' : ''} ${className}`}
    >
      <CategoryIcon id={tx.category} />
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-[15px] truncate">{txTitle(tx)}</span>
          {large && <LargeBadge compact />}
        </span>
        <span className="block text-sm text-muted truncate">{showDate ? dayHeading(tx.date) : txSubtitle(tx)}</span>
      </span>
      <TxAmount tx={tx} className="text-[15px] shrink-0" />
    </Tag>
  );
}
