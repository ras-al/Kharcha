import { Ticket } from '@phosphor-icons/react';
import { format } from 'date-fns';
import ReimburseSwitch from '../../components/ReimburseSwitch';
import { EmptyState, ErrorState, Skeleton } from '../../components/States';
import { txTitle } from '../../components/TxRow';
import { useEvents } from '../../hooks/useEvents';
import { useTransactionActions } from '../../hooks/useTransactionActions';
import { formatINR } from '../../lib/format';

export default function EventsDesktop() {
  const e = useEvents();
  const { patch } = useTransactionActions();
  const stats = [
    ['Pending reimbursement', e.pending, 'Claimed, not yet paid back'],
    ['Reimbursed', e.received, 'Already returned to you'],
    ['Not claimed', e.unclaimed, 'Your own cost unless you claim it'],
    ['Spent on events', e.total, 'Last 24 months'],
  ];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[40px] leading-tight">Workshops and events</h1>
        <p className="text-muted font-semibold mt-1">Track which event costs you have claimed back.</p>
      </header>
      {e.error && <ErrorState error={e.error} />}
      <div className="grid grid-cols-4 gap-6">
        {stats.map(([label, value, sub], i) => (
          <div key={label} className={`rounded-card p-5 ${i === 0 ? 'bg-forest text-lime' : 'card'}`}>
            <p className={`text-[13px] font-semibold ${i === 0 ? 'text-[#D5F5BF]' : 'text-muted'}`}>{label}</p>
            {e.loading ? <Skeleton className="h-8 w-24 mt-2" /> : <p className="num text-[28px] font-extrabold mt-1">{formatINR(value)}</p>}
            <p className={`text-xs font-semibold mt-1 ${i === 0 ? 'text-[#D5F5BF]' : 'text-muted'}`}>{sub}</p>
          </div>
        ))}
      </div>
      <section className="card overflow-hidden">
        {e.loading ? <Skeleton className="h-64 m-6" /> : e.items.length === 0 ? (
          <EmptyState icon={Ticket} title="No event spending">Expenses in the Workshop/Events category show up here.</EmptyState>
        ) : (
          <table className="w-full text-[15px]">
            <caption className="sr-only">Event expenses and their reimbursement status</caption>
            <thead className="bg-sunk/60 text-sm text-muted">
              <tr>
                <th scope="col" className="text-left font-bold px-6 py-3">Date</th>
                <th scope="col" className="text-left font-bold px-3 py-3">Event</th>
                <th scope="col" className="text-right font-bold px-3 py-3">Amount</th>
                <th scope="col" className="text-right font-bold px-6 py-3">Reimbursement</th>
              </tr>
            </thead>
            <tbody>
              {e.items.map((t) => (
                <tr key={t.id} className="border-t border-line">
                  <td className="px-6 py-3 num text-muted font-semibold">{format(t.date, 'd MMM yyyy')}</td>
                  <td className="px-3 py-3 font-bold">{txTitle(t)}</td>
                  <td className="px-3 py-3 text-right num font-bold">{formatINR(t.amount)}</td>
                  <td className="px-6 py-3 text-right"><ReimburseSwitch value={t.reimbursement} onChange={(v) => patch(t.id, { reimbursement: v })} label={`Reimbursement for ${txTitle(t)} on ${format(t.date, 'd MMM')}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
