import { Bank, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet } from '../../components/Overlay';
import FeeYear from '../../components/records/FeeYear';
import HostelStay from '../../components/records/HostelStay';
import { FeeForm, HostelForm, ScholarshipForm } from '../../components/records/RecordForms';
import ScholarshipTimeline from '../../components/records/ScholarshipTimeline';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/States';
import Tabs from '../../components/Tabs';
import { FEE_TABS, useRecordEditor } from '../../hooks/useRecordEditor';
import { formatINR } from '../../lib/format';
import MobileHeader from '../../components/MobileHeader';

export default function FeesMobile() {
  const r = useRecordEditor();
  const [tab, setTab] = useState('college');
  const addFor = { college: () => r.openFee(1), hostel: r.openHostel, scholarships: r.openScholarship }[tab];

  return (
    <div className="space-y-4">
      <MobileHeader title="Fees" action={<button type="button" className="btn-secondary btn-sm bg-surface shadow-soft" onClick={addFor}><Plus size={16} weight="bold" aria-hidden="true" /> Add</button>} />

      <Tabs tabs={FEE_TABS} value={tab} onChange={setTab} label="Fee sections" className="w-full grid grid-cols-3" />
      {r.error && <ErrorState error={r.error} />}

      {r.loading ? <ListSkeleton rows={5} /> : r.empty ? (
        <div className="card">
          <EmptyState icon={Bank} title="No fees recorded" action={<Link to="/settings/import" className="btn-primary">Import from Excel</Link>}>
            Import the College and Hostel sheet from your workbook, or add fees one by one.
          </EmptyState>
        </div>
      ) : (
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="space-y-4">
          {tab === 'college' && (
            <>
              <div className="rounded-card bg-hero text-hero-ink dark:border dark:border-line p-5">
                <p className="text-sm font-semibold text-hero-muted">College fees so far</p>
                <p className="num text-[34px] font-extrabold">{formatINR(r.fees.total)}</p>
                {r.fees.pending > 0 && <p className="text-sm font-semibold text-hero-muted num">{formatINR(r.fees.pending)} still pending</p>}
              </div>
              {r.fees.years.map((y) => (
                <FeeYear key={y.year} year={y} compact onToggle={r.fees.toggleStatus} onAdd={r.openFee} onEdit={(f) => r.openFee(f.academicYear, f)} />
              ))}
            </>
          )}

          {tab === 'hostel' && (
            <>
              <div className="rounded-card bg-hero text-hero-ink dark:border dark:border-line p-5">
                <p className="text-sm font-semibold text-hero-muted">Hostel fees paid</p>
                <p className="num text-[34px] font-extrabold">{formatINR(r.hostel.totalPaid)}</p>
                <p className="text-sm font-semibold text-hero-muted num">{formatINR(r.hostel.refundable)} in refundable deposits</p>
              </div>
              {r.hostel.stays.length ? [...r.hostel.stays].reverse().map((s) => <HostelStay key={s.stay} stay={s} />) : <p className="text-muted">No hostel payments yet.</p>}
            </>
          )}

          {tab === 'scholarships' && (
            <>
              <div className="rounded-card bg-hero text-hero-ink dark:border dark:border-line p-5">
                <p className="text-sm font-semibold text-hero-muted">Scholarships received</p>
                <p className="num text-[34px] font-extrabold">{formatINR(r.scholarships.total)}</p>
                <p className="text-sm font-semibold text-hero-muted">
                  {r.scholarships.byName.map((n) => `${n.name} ${formatINR(n.amount)}`).join(', ')}
                </p>
              </div>
              <section className="card p-5">
                <h2 className="text-lg mb-4">Timeline</h2>
                <ScholarshipTimeline items={r.scholarships.items} onDelete={r.deleteScholarship} />
              </section>
            </>
          )}
        </div>
      )}

      <Sheet open={Boolean(r.form)} onClose={r.close} title={r.form?.kind === 'fee' ? 'College fee' : r.form?.kind === 'hostel' ? 'Hostel payment' : 'Scholarship'}>
        <div className="pt-2">
          {r.form?.kind === 'fee' && <FeeForm key={r.form.initial?.id || 'new'} defaultYear={r.form.year} initial={r.form.initial} onSave={r.saveFee} onCancel={r.close} onDelete={r.deleteFee} />}
          {r.form?.kind === 'hostel' && <HostelForm stays={r.hostel.stays} onSave={r.saveHostel} onCancel={r.close} />}
          {r.form?.kind === 'scholarship' && <ScholarshipForm onSave={r.saveScholarship} onCancel={r.close} />}
        </div>
      </Sheet>
    </div>
  );
}
