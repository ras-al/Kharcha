import { ArrowCounterClockwise, Check, HandCoins, PencilSimpleLine, Plus, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { CompleteDebtModal, DebtFormModal, DebtIcon } from '../../components/debts/DebtModals';
import MobileHeader from '../../components/MobileHeader';
import { Confirm } from '../../components/Overlay';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/States';
import Tabs from '../../components/Tabs';
import { useDebts } from '../../hooks/useDebts';
import { shortLabel } from '../../lib/categories';
import { debtDirection } from '../../lib/debts';
import { formatINR } from '../../lib/format';

function DirectionBadge({ direction }) {
  const isGiven = direction === 'given';
  return (
    <span className={`inline-block rounded-badge px-2 py-0.5 text-[11px] font-bold ${isGiven ? 'bg-income/15 text-income' : 'bg-expense/10 text-expense'}`}>
      {isGiven ? 'Owes you' : 'You owe'}
    </span>
  );
}

export default function DebtsMobile() {
  const d = useDebts();
  const [tab, setTab] = useState('pending');
  const [dirFilter, setDirFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [reopening, setReopening] = useState(null);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (debt) => { setEditing(debt); setFormOpen(true); };

  const filterList = useMemo(() => (list) => list.filter((x) => {
    if (dirFilter !== 'all' && debtDirection(x) !== dirFilter) return false;
    if (personFilter && x.person.trim().toLowerCase() !== personFilter) return false;
    return true;
  }), [dirFilter, personFilter]);

  const visiblePending = useMemo(() => filterList(d.pending), [filterList, d.pending]);
  const visibleCompleted = useMemo(() => filterList(d.completed), [filterList, d.completed]);

  const tabs = [
    { id: 'pending', label: `Pending (${d.pending.length})` },
    { id: 'completed', label: `Completed (${d.completed.length})` },
  ];

  const list = tab === 'pending' ? visiblePending : visibleCompleted;

  return (
    <div className="space-y-5">
      <MobileHeader
        title="Debts"
        action={(
          <button type="button" className="btn-secondary btn-sm bg-surface" onClick={openAdd}>
            <Plus size={16} weight="bold" aria-hidden="true" /> Add
          </button>
        )}
      >
        Track money you owe or lent to friends. Completing what you owe logs an expense on that date.
      </MobileHeader>

      {d.error && <ErrorState error={d.error} />}

      <section className="rounded-card bg-hero text-hero-ink dark:border dark:border-line p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-hero-muted">You owe</p>
            <p className="num text-[28px] font-extrabold leading-tight mt-0.5">{formatINR(d.owedTotal)}</p>
            <p className="text-xs font-semibold text-hero-muted mt-0.5 num">{d.owedPending.length} open</p>
          </div>
          <div className="border-l border-hero-ink/20 pl-4">
            <p className="text-xs font-semibold text-hero-muted">Owed to you</p>
            <p className="num text-[28px] font-extrabold leading-tight mt-0.5">{formatINR(d.givenTotal)}</p>
            <p className="text-xs font-semibold text-hero-muted mt-0.5 num">{d.givenPending.length} open</p>
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto overscroll-x-contain no-scrollbar -mx-4 px-4" aria-label="Filter debts">
        {[['all', 'All'], ['owed', 'I owe'], ['given', 'I gave']].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="chip shrink-0 pl-4 bg-surface"
            aria-pressed={dirFilter === id && !personFilter}
            onClick={() => { setDirFilter(id); setPersonFilter(''); }}
          >
            {label}
          </button>
        ))}
        {d.byPerson.map((p) => (
          <button
            key={p.key}
            type="button"
            className="chip shrink-0 pl-4 bg-surface"
            aria-pressed={personFilter === p.key}
            onClick={() => setPersonFilter((cur) => (cur === p.key ? '' : p.key))}
          >
            {p.name} <span className="num opacity-80">{formatINR(Math.abs(p.net), { whole: true })}</span>
          </button>
        ))}
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Debt status" className="grid grid-cols-2 w-full" />

      {d.loading ? <ListSkeleton rows={4} /> : list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HandCoins}
            title={tab === 'pending' ? 'No pending debts' : 'No completed debts yet'}
            action={tab === 'pending' ? <button type="button" className="btn-primary" onClick={openAdd}><Plus size={18} weight="bold" aria-hidden="true" /> Add debt</button> : null}
          >
            {tab === 'pending'
              ? 'Add a debt here or pick Debt when tapping the plus button.'
              : 'Completed debts appear here.'}
          </EmptyState>
        </div>
      ) : (
        <ul className="space-y-3" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {list.map((item) => {
            const dir = debtDirection(item);
            const isGiven = dir === 'given';
            return (
              <li key={item.id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <DebtIcon debt={item} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate">{item.person}</p>
                      <DirectionBadge direction={dir} />
                    </div>
                    <p className="text-sm text-muted truncate mt-0.5">
                      {[item.note, !isGiven && item.category ? shortLabel(item.category) : null, format(item.date, 'd MMM yyyy')].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="num font-extrabold text-[17px] shrink-0">{formatINR(item.amount)}</span>
                </div>

                {tab === 'completed' && (
                  <p className="text-xs font-semibold text-muted bg-sunk rounded-badge px-3 py-1.5">
                    {isGiven
                      ? `Received on ${format(item.completedDate || item.date, 'd MMM yyyy')} · Tracked only`
                      : `Completed on ${format(item.completedDate || item.date, 'd MMM yyyy')} · Added to ${item.category} expenses`}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  {tab === 'pending' ? (
                    <>
                      <button type="button" className="btn-primary btn-sm flex-1" onClick={() => setCompleting(item)}>
                        <Check size={16} weight="bold" aria-hidden="true" /> {isGiven ? 'Received' : 'Complete'}
                      </button>
                      <button type="button" className="icon-btn" aria-label={`Edit debt (${item.person})`} onClick={() => openEdit(item)}>
                        <PencilSimpleLine size={18} weight="bold" />
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn-secondary btn-sm flex-1" onClick={() => setReopening(item)}>
                      <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" /> Reopen
                    </button>
                  )}
                  <button type="button" className="icon-btn text-expense" aria-label={`Delete debt (${item.person})`} onClick={() => d.remove(item)}>
                    <Trash size={18} weight="bold" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <DebtFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        people={d.people}
        onSave={(data) => (editing ? d.update(editing.id, data, editing) : d.add(data))}
      />

      <CompleteDebtModal
        debt={completing}
        onClose={() => setCompleting(null)}
        onConfirm={(debt, date) => d.complete(debt, date)}
      />

      <Confirm
        open={Boolean(reopening)}
        onClose={() => setReopening(null)}
        onConfirm={() => { if (reopening) d.reopen(reopening); }}
        title="Reopen this debt?"
        confirmLabel="Reopen debt"
      >
        {debtDirection(reopening) === 'given'
          ? `This moves the debt from ${reopening?.person} back to Pending.`
          : `This moves the debt to ${reopening?.person} back to Pending and removes its auto-created expense.`}
      </Confirm>
    </div>
  );
}
