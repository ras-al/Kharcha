import { Bank, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog } from '../../components/Overlay';
import FeeYear from '../../components/records/FeeYear';
import HostelStay from '../../components/records/HostelStay';
import { FeeForm, HostelForm, ScholarshipForm } from '../../components/records/RecordForms';
import ScholarshipTimeline from '../../components/records/ScholarshipTimeline';
import { EmptyState, ErrorState, Skeleton } from '../../components/States';
import Tabs from '../../components/Tabs';
import { FEE_TABS, useRecordEditor } from '../../hooks/useRecordEditor';
import { formatINR } from '../../lib/format';

function Stat({ label, value, sub }) {
  return (
    <div className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="num text-[28px] font-extrabold leading-tight mt-1">{value}</p>
      {sub && <p className="text-xs text-muted font-semibold mt-1">{sub}</p>}
    </div>
  );
}

export default function FeesDesktop() {
  const r = useRecordEditor();
  const [tab, setTab] = useState('college');
  const addFor = { college: () => r.openFee(1), hostel: r.openHostel, scholarships: r.openScholarship }[tab];
  const addLabel = { college: 'Add fee', hostel: 'Add hostel payment', scholarships: 'Add scholarship' }[tab];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] leading-tight">Fees and hostel</h1>
          <p className="text-muted font-semibold mt-1">College fees by year, hostel rent and deposits, and scholarships received.</p>
        </div>
        <button type="button" className="btn-primary" onClick={addFor}><Plus size={18} weight="bold" aria-hidden="true" /> {addLabel}</button>
      </header>

      {r.error && <ErrorState error={r.error} />}

      {r.loading ? <Skeleton className="h-28" /> : (
        <div className="grid grid-cols-4 gap-6">
          <Stat label="College fees" value={formatINR(r.fees.total)} sub={r.fees.pending ? `${formatINR(r.fees.pending)} pending` : 'All paid'} />
          <Stat label="Hostel paid" value={formatINR(r.hostel.totalPaid)} sub={`${r.hostel.stays.length} hostel${r.hostel.stays.length === 1 ? '' : 's'}`} />
          <Stat label="Refundable deposits" value={formatINR(r.hostel.refundable)} sub="Comes back when you leave" />
          <Stat label="Scholarships" value={formatINR(r.scholarships.total)} sub={`${r.scholarships.items.length} payments`} />
        </div>
      )}

      <Tabs tabs={FEE_TABS} value={tab} onChange={setTab} label="Fee sections" />

      {!r.loading && r.empty ? (
        <div className="card">
          <EmptyState icon={Bank} title="No fees recorded" action={<Link to="/settings/import" className="btn-primary">Import from Excel</Link>}>
            Import the College and Hostel sheet from your workbook, or add records with the button above.
          </EmptyState>
        </div>
      ) : (
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'college' && (
            <div className="grid grid-cols-2 gap-6 items-start">
              {r.fees.years.map((y) => <FeeYear key={y.year} year={y} onToggle={r.fees.toggleStatus} onDelete={r.fees.remove} onAdd={r.openFee} />)}
            </div>
          )}
          {tab === 'hostel' && (
            <div className="grid grid-cols-2 gap-6 items-start">
              {r.hostel.stays.length ? [...r.hostel.stays].reverse().map((s) => <HostelStay key={s.stay} stay={s} />) : <p className="text-muted">No hostel payments yet.</p>}
            </div>
          )}
          {tab === 'scholarships' && (
            <div className="grid grid-cols-12 gap-6 items-start">
              <section className="card p-6 col-span-7">
                <h2 className="text-lg mb-5">Timeline</h2>
                <ScholarshipTimeline items={r.scholarships.items} onDelete={r.deleteScholarship} />
              </section>
              <section className="card p-6 col-span-5">
                <h2 className="text-lg mb-4">By scheme</h2>
                <ul className="space-y-3">
                  {r.scholarships.byName.map((n) => (
                    <li key={n.name} className="flex items-center gap-3">
                      <span className="flex-1 font-bold">{n.name}</span>
                      <span className="text-sm text-muted num">{Math.round((n.amount / (r.scholarships.total || 1)) * 100)}%</span>
                      <span className="num font-extrabold w-28 text-right">{formatINR(n.amount)}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex justify-between border-t border-line mt-4 pt-4 font-extrabold"><span>Total</span><span className="num">{formatINR(r.scholarships.total)}</span></p>
              </section>
            </div>
          )}
        </div>
      )}

      <Dialog open={Boolean(r.form)} onClose={r.close} title={r.form?.kind === 'fee' ? 'College fee' : r.form?.kind === 'hostel' ? 'Hostel payment' : 'Scholarship'}>
        {r.form?.kind === 'fee' && <FeeForm defaultYear={r.form.year} initial={r.form.initial} onSave={r.saveFee} onCancel={r.close} />}
        {r.form?.kind === 'hostel' && <HostelForm stays={r.hostel.stays} onSave={r.saveHostel} onCancel={r.close} />}
        {r.form?.kind === 'scholarship' && <ScholarshipForm onSave={r.saveScholarship} onCancel={r.close} />}
      </Dialog>
    </div>
  );
}
