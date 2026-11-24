import { ArrowCounterClockwise, Check, HandCoins, PencilSimpleLine, Plus, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { CompleteDebtModal, DebtFormModal, DebtIcon } from '../../components/debts/DebtModals';
import { Confirm } from '../../components/Overlay';
import { EmptyState, ErrorState, Skeleton } from '../../components/States';
import Tabs from '../../components/Tabs';
import { useDebts } from '../../hooks/useDebts';
import { debtDirection } from '../../lib/debts';
import { formatINR } from '../../lib/format';

function DirectionBadge({ direction }) {
  const isGiven = direction === 'given';
  return (
    <span className={`inline-block rounded-badge px-2 py-0.5 text-xs font-bold ${isGiven ? 'bg-income/15 text-income' : 'bg-expense/10 text-expense'}`}>
      {isGiven ? 'Owes you' : 'You owe'}
    </span>
  );
}

export default function DebtsDesktop() {
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

  const stats = [
    ['You owe', formatINR(d.owedTotal), `${d.owedPending.length} pending · logs expense when settled`],
    ['Owed to you', formatINR(d.givenTotal), `${d.givenPending.length} pending · tracked only`],
    ['Completed', formatINR(d.completedTotal), `${d.completed.length} settled`],
    ['Net balance', formatINR(d.netDebt, { signed: true }), 'Owed to you minus you owe', d.netDebt < 0 ? 'text-expense' : d.netDebt > 0 ? 'text-income' : ''],
  ];

  const tabs = [
    { id: 'pending', label: `Pending (${d.pending.length})` },
    { id: 'completed', label: `Completed (${d.completed.length})` },
  ];

  const list = tab === 'pending' ? visiblePending : visibleCompleted;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] leading-tight">Debts</h1>
          <p className="text-muted font-semibold mt-1">Track money you owe and money you gave. Completing what you owe adds an expense on that date.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <Plus size={18} weight="bold" aria-hidden="true" /> Add debt
        </button>
      </header>

      {d.error && <ErrorState error={d.error} />}

      <div className="grid grid-cols-4 gap-6">
        {stats.map(([label, value, sub, tone], i) => (
          <div key={label} className={`rounded-card p-5 ${i === 0 ? 'bg-hero text-hero-ink dark:border dark:border-line' : 'card'}`}>
            <p className={`text-[13px] font-semibold ${i === 0 ? 'text-hero-muted' : 'text-muted'}`}>{label}</p>
            {d.loading ? <Skeleton className="h-8 w-24 mt-2" /> : <p className={`num text-[28px] font-extrabold mt-1 ${tone || ''}`}>{value}</p>}
            <p className={`text-xs font-semibold mt-1 ${i === 0 ? 'text-hero-muted' : 'text-muted'}`}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs tabs={tabs} value={tab} onChange={setTab} label="Debt status" />
        <div className="flex flex-wrap gap-2" aria-label="Filter debts">
          {[['all', 'All'], ['owed', 'I owe'], ['given', 'I gave']].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="chip pl-4 bg-surface"
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
              className="chip pl-4 bg-surface"
              aria-pressed={personFilter === p.key}
              onClick={() => setPersonFilter((cur) => (cur === p.key ? '' : p.key))}
            >
              {p.name} <span className="num opacity-80">{formatINR(p.net, { signed: true, whole: true })}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="card overflow-hidden" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {d.loading ? <Skeleton className="h-64 m-6" /> : list.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={tab === 'pending' ? 'No pending debts' : 'No completed debts yet'}
            action={tab === 'pending' ? <button type="button" className="btn-primary" onClick={openAdd}><Plus size={18} weight="bold" aria-hidden="true" /> Add debt</button> : null}
          >
            {tab === 'pending'
              ? 'Add a debt above, or pick the Debt option right inside Quick Add.'
              : 'Completed debts appear here.'}
          </EmptyState>
        ) : (
          <table className="w-full text-[15px]">
            <caption className="sr-only">{tab === 'pending' ? 'Pending debts' : 'Completed debts'}</caption>
            <thead className="bg-sunk/60 text-sm text-muted">
              <tr>
                <th scope="col" className="text-left font-bold px-6 py-3">Date</th>
                {tab === 'completed' && <th scope="col" className="text-left font-bold px-3 py-3">Completed on</th>}
                <th scope="col" className="text-left font-bold px-3 py-3">Type</th>
                <th scope="col" className="text-left font-bold px-3 py-3">Friend</th>
                <th scope="col" className="text-left font-bold px-3 py-3">Details</th>
                <th scope="col" className="text-right font-bold px-3 py-3">Amount</th>
                <th scope="col" className="text-right font-bold px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => {
                const dir = debtDirection(item);
                const isGiven = dir === 'given';
                return (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-6 py-3 num text-muted font-semibold">{format(item.date, 'd MMM yyyy')}</td>
                    {tab === 'completed' && (
                      <td className="px-3 py-3 num font-semibold">{format(item.completedDate || item.date, 'd MMM yyyy')}</td>
                    )}
                    <td className="px-3 py-3"><DirectionBadge direction={dir} /></td>
                    <td className="px-3 py-3 font-bold">{item.person}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-3">
                        <DebtIcon debt={item} size={32} />
                        <span>
                          <span className="font-bold">{item.note || (isGiven ? 'Lent money' : item.category)}</span>
                          {!isGiven && item.note && <span className="block text-xs text-muted font-semibold">{item.category}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right num font-extrabold">{formatINR(item.amount)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {tab === 'pending' ? (
                          <>
                            <button type="button" className="btn-primary btn-sm" onClick={() => setCompleting(item)}>
                              <Check size={15} weight="bold" aria-hidden="true" /> {isGiven ? 'Received' : 'Complete'}
                            </button>
                            <button type="button" className="icon-btn" aria-label={`Edit debt (${item.person})`} onClick={() => openEdit(item)}>
                              <PencilSimpleLine size={18} weight="bold" />
                            </button>
                          </>
                        ) : (
                          <button type="button" className="btn-secondary btn-sm" onClick={() => setReopening(item)}>
                            <ArrowCounterClockwise size={15} weight="bold" aria-hidden="true" /> Reopen
                          </button>
                        )}
                        <button type="button" className="icon-btn text-expense" aria-label={`Delete debt (${item.person})`} onClick={() => d.remove(item)}>
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

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
