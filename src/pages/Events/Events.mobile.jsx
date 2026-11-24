import { Ticket } from '@phosphor-icons/react';
import { format } from 'date-fns';
import ReimburseSwitch from '../../components/ReimburseSwitch';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/States';
import { txTitle } from '../../components/TxRow';
import { useEvents } from '../../hooks/useEvents';
import { useTransactionActions } from '../../hooks/useTransactionActions';
import { formatINR } from '../../lib/format';

export default function EventsMobile() {
  const e = useEvents();
  const { patch } = useTransactionActions();
  return (
    <div className="pt-4 space-y-5">
      <header>
        <h1 className="text-[28px]">Workshops and events</h1>
        <p className="text-muted mt-1">Mark what you claimed back from college or a club, so nothing is forgotten.</p>
      </header>
      {e.error && <ErrorState error={e.error} />}
      <section className="rounded-card bg-forest text-lime p-5">
        <p className="text-sm font-semibold text-[#D5F5BF]">Waiting to be reimbursed</p>
        <p className="num text-[34px] font-extrabold">{formatINR(e.pending)}</p>
        <p className="text-sm font-semibold text-[#D5F5BF] num">{formatINR(e.total)} spent on events in 24 months, {formatINR(e.received)} paid back</p>
      </section>
      {e.loading ? <ListSkeleton rows={4} /> : e.items.length === 0 ? (
        <div className="card"><EmptyState icon={Ticket} title="No event spending">Expenses in the Workshop/Events category show up here.</EmptyState></div>
      ) : (
        <ul className="space-y-3">
          {e.items.map((t) => (
            <li key={t.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold truncate">{txTitle(t)}</p>
                  <p className="text-sm text-muted">{format(t.date, 'd MMM yyyy')}</p>
                </div>
                <span className="num font-extrabold">{formatINR(t.amount)}</span>
              </div>
              <div className="mt-3"><ReimburseSwitch value={t.reimbursement} onChange={(v) => patch(t.id, { reimbursement: v })} label={`Reimbursement for ${txTitle(t)}`} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
