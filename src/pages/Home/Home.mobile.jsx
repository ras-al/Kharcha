import { ArrowRight, Check, Receipt, UploadSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BudgetList from '../../components/BudgetList';
import CategoryIcon from '../../components/CategoryIcon';
import { CompleteDebtModal, DebtIcon } from '../../components/debts/DebtModals';
import Insights from '../../components/Insights';
import Money from '../../components/Money';
import MonthSwitcher from '../../components/MonthSwitcher';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '../../components/States';
import TemplateChips from '../../components/TemplateChips';
import TxRow from '../../components/TxRow';
import { useAuth } from '../../context/AuthContext';
import { usePeriod } from '../../context/PeriodContext';
import { useQuickAdd } from '../../context/QuickAddContext';
import { useDebts } from '../../hooks/useDebts';
import { useBudgets } from '../../hooks/useRecords';
import { useStats } from '../../hooks/useStats';
import { shortLabel } from '../../lib/categories';
import { debtDirection } from '../../lib/debts';
import { monthLabel } from '../../lib/dates';
import { formatINR, formatPct } from '../../lib/format';
import MobileHeader from '../../components/MobileHeader';

export default function HomeMobile() {
  const { user } = useAuth();
  const { month, setMonth, isCurrent } = usePeriod();
  const s = useStats(month);
  const { limits, hasAny } = useBudgets();
  const debts = useDebts();
  const [completingDebt, setCompletingDebt] = useState(null);
  const { openEdit, openAdd } = useQuickAdd();
  const navigate = useNavigate();
  const first = (user.displayName || '').split(' ')[0];

  const recent = [...s.all].sort((a, b) => b.date - a.date || (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, 6);
  const compareBase = isCurrent ? s.prevToDateSummary.expense : s.prevSummary.expense;
  const delta = compareBase ? ((s.summary.expense - compareBase) / compareBase) * 100 : null;

  return (
    <div className="space-y-5">
      <MobileHeader eyebrow={first ? `Hi ${first}` : 'Hello'} title="Your money" action={<MonthSwitcher value={month} onChange={setMonth} narrow />} />

      {s.error && <ErrorState error={s.error} />}

      {/* Balance-style summary card */}
      <section aria-labelledby="month-total" className="rounded-card bg-hero text-hero-ink dark:border dark:border-line p-6">
        <p id="month-total" className="text-[15px] font-semibold text-hero-muted">Spent in {monthLabel(month, 'MMMM')}</p>
        {s.loading ? <Skeleton className="h-12 w-48 mt-2 bg-white/10" /> : (
          <p className="text-[44px] font-extrabold leading-tight"><Money value={s.summary.expense} animate /></p>
        )}
        {delta !== null && !s.loading && (
          <p className="mt-1 text-sm font-semibold text-hero-muted">
            <span className="inline-block rounded-badge bg-hero-ink text-hero px-2 py-0.5 mr-1.5 num">{formatPct(delta)}</span>
            vs {monthLabel(s.prevKey, 'MMMM')}{isCurrent ? ' by this day' : ''}
          </p>
        )}
        <dl className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-hero-ink/20">
          <div><dt className="text-xs font-semibold text-hero-muted">{isCurrent ? 'Today' : 'Daily avg'}</dt><dd className="num font-extrabold text-lg">{formatINR(isCurrent ? s.todaySpend : s.avgDaily, { whole: true })}</dd></div>
          <div><dt className="text-xs font-semibold text-hero-muted">Core</dt><dd className="num font-extrabold text-lg">{formatINR(s.summary.core, { whole: true })}</dd></div>
          <div><dt className="text-xs font-semibold text-hero-muted">Income</dt><dd className="num font-extrabold text-lg">{formatINR(s.summary.income, { whole: true })}</dd></div>
        </dl>
        {s.forecast.isCurrent && s.summary.core > 0 && (
          <p className="text-sm text-hero-muted mt-4">At this pace core spending ends the month near <b className="text-hero-ink num">{formatINR(s.forecast.projectedCore)}</b>.</p>
        )}
      </section>

      {/* Category chips */}
      {s.breakdown.length > 0 && (
        <section aria-label="Spending by category">
          <div className="flex gap-2 overflow-x-auto overscroll-x-contain no-scrollbar -mx-4 px-4">
            {s.breakdown.map((b) => (
              <button
                key={b.id}
                type="button"
                className="chip shrink-0 bg-surface"
                onClick={() => navigate(`/transactions?category=${encodeURIComponent(b.id)}`)}
              >
                <CategoryIcon id={b.id} size={32} variant="tint" />
                {shortLabel(b.id)} <span className="num">{formatINR(b.value)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <TemplateChips scroll />

      {debts.pending.length > 0 && (
        <section className="card p-5" aria-labelledby="pending-debts-title">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 id="pending-debts-title" className="text-lg">Pending debts</h2>
              <p className="text-xs font-semibold text-muted num">
                {[
                  debts.owedTotal > 0 ? `You owe ${formatINR(debts.owedTotal)}` : null,
                  debts.givenTotal > 0 ? `Owed to you ${formatINR(debts.givenTotal)}` : null,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Link to="/debts" className="flex items-center gap-1 font-bold text-sm min-h-[44px] px-2">Manage <ArrowRight size={16} weight="bold" aria-hidden="true" /></Link>
          </div>
          <ul className="divide-y divide-line">
            {debts.pending.slice(0, 3).map((item) => {
              const isGiven = debtDirection(item) === 'given';
              return (
                <li key={item.id} className="flex items-center gap-3 py-2.5">
                  <DebtIcon debt={item} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{item.person} · <span className="num">{formatINR(item.amount)}</span></p>
                    <p className="text-xs text-muted truncate">{isGiven ? 'Owes you' : 'You owe'} · {item.note || (isGiven ? 'Lent money' : item.category)}</p>
                  </div>
                  <button type="button" className="btn-primary btn-sm shrink-0" onClick={() => setCompletingDebt(item)}>
                    <Check size={14} weight="bold" aria-hidden="true" /> {isGiven ? 'Received' : 'Complete'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {hasAny && (
        <section className="card p-5">
          <h2 className="text-lg mb-4">Budgets</h2>
          <BudgetList byCategory={s.summary.byCategory} limits={limits} limit={3} />
        </section>
      )}

      {s.insights.length > 0 && <Insights items={s.insights} />}

      <section aria-labelledby="recent">
        <div className="flex items-center justify-between mb-2">
          <h2 id="recent" className="text-xl">Recent</h2>
          <Link to="/transactions" className="flex items-center gap-1 font-bold text-sm min-h-[44px] px-2">See all <ArrowRight size={16} weight="bold" aria-hidden="true" /></Link>
        </div>
        {s.loading ? <ListSkeleton rows={4} /> : recent.length ? (
          <ul className="card p-1">
            {recent.map((t) => <li key={t.id}><TxRow tx={t} median={s.median} showDate onClick={() => openEdit(t)} /></li>)}
          </ul>
        ) : (
          <div className="card">
            <EmptyState icon={Receipt} title="Nothing logged yet" action={(
              <div className="flex flex-col gap-2">
                <button type="button" className="btn-primary" onClick={() => openAdd()}>Add your first expense</button>
                <Link to="/settings/import" className="btn-secondary"><UploadSimple size={18} weight="bold" aria-hidden="true" />Import Expense.xlsx</Link>
              </div>
            )}>
              Tap the plus button after you pay for something, or bring in your old spreadsheet.
            </EmptyState>
          </div>
        )}
      </section>
      <CompleteDebtModal
        debt={completingDebt}
        onClose={() => setCompletingDebt(null)}
        onConfirm={(debt, date) => debts.complete(debt, date)}
      />
    </div>
  );
}
