import { PencilSimpleLine, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useQuickAdd } from '../context/QuickAddContext';
import { useTransactionActions } from '../hooks/useTransactionActions';
import { isLargeExpense, LARGE_MULTIPLIER } from '../lib/stats';
import { formatINR } from '../lib/format';
import CategoryIcon from './CategoryIcon';
import ReimburseSwitch from './ReimburseSwitch';
import { TxAmount } from './Money';
import { LargeBadge, txTitle } from './TxRow';

const ORIGIN = { manual: 'Added by hand', import: 'Imported from Excel', template: 'Added from a recurring template' };
const SOURCE = { scholarship: 'Scholarship', refund: 'Refund', other: 'Other' };

/** Body of the right-hand detail drawer on desktop. */
export default function TxDetail({ tx, median, onClose }) {
  const { openEdit } = useQuickAdd();
  const { remove, patch } = useTransactionActions();
  const large = isLargeExpense(tx, median);

  const rows = [
    ['Date', format(tx.date, 'EEEE, d MMMM yyyy')],
    ['Type', tx.type === 'income' ? 'Income' : 'Expense'],
    tx.type === 'expense' ? ['Category', tx.category] : ['Source', SOURCE[tx.source] || 'Other'],
    ['Note', tx.note || 'No note'],
    ['Origin', ORIGIN[tx.origin] || 'Added by hand'],
    tx.updatedAt ? ['Last changed', format(tx.updatedAt, 'd MMM yyyy, HH:mm')] : null,
  ].filter(Boolean);

  return (
    <div>
      <div className="flex items-center gap-4 mt-2">
        <CategoryIcon id={tx.category} size={56} />
        <div className="min-w-0">
          <p className="font-bold text-lg truncate">{txTitle(tx)}</p>
          <TxAmount tx={tx} className="text-[32px] font-extrabold" />
        </div>
      </div>
      {large && (
        <p className="mt-4 text-sm text-muted">
          <LargeBadge /> More than {LARGE_MULTIPLIER} times your median core day of {formatINR(median)}.
        </p>
      )}

      <dl className="mt-6 divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3">
            <dt className="text-muted font-semibold">{k}</dt>
            <dd className="font-semibold text-right">{v}</dd>
          </div>
        ))}
      </dl>

      {tx.category === 'Workshop/Events' && (
        <div className="mt-5">
          <p className="field-label">Reimbursement</p>
          <ReimburseSwitch value={tx.reimbursement} onChange={(v) => patch(tx.id, { reimbursement: v })} label="Reimbursement" />
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button type="button" className="btn-primary flex-1" onClick={() => { onClose(); openEdit(tx); }}>
          <PencilSimpleLine size={18} weight="bold" aria-hidden="true" /> Edit
        </button>
        <button type="button" className="btn-secondary flex-1 text-expense" onClick={() => { onClose(); remove(tx); }}>
          <Trash size={18} weight="bold" aria-hidden="true" /> Delete
        </button>
      </div>
    </div>
  );
}
