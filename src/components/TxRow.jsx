import { Lightning } from '@phosphor-icons/react';
import { shortLabel } from '../lib/categories';
import { dayHeading } from '../lib/dates';
import { isLargeExpense } from '../lib/stats';
import CategoryIcon from './CategoryIcon';
import { TxAmount } from './Money';

const SOURCE_LABEL = { scholarship: 'Scholarship', refund: 'Refund', other: 'Income' };

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

export function LargeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-badge bg-warn/15 text-warn px-2 py-0.5 text-xs font-bold whitespace-nowrap">
      <Lightning size={12} weight="fill" aria-hidden="true" /> Large expense
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
      className={`w-full flex items-center gap-3.5 px-4 py-3 min-h-[68px] text-left transition-colors duration-150
        ${onClick ? 'hover:bg-sunk/70 rounded-control' : ''} ${selected ? 'bg-sunk' : ''} ${className}`}
    >
      <CategoryIcon id={tx.category} />
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-[15px] truncate">{txTitle(tx)}</span>
        <span className="flex items-center gap-2 text-sm text-muted">
          <span className="truncate">{showDate ? dayHeading(tx.date) : txSubtitle(tx)}</span>
          {large && <LargeBadge />}
        </span>
      </span>
      <TxAmount tx={tx} className="text-[15px] shrink-0" />
    </Tag>
  );
}
