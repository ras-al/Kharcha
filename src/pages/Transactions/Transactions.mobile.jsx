import { Funnel, MagnifyingGlass, Receipt } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import DayGroupedList from '../../components/DayGroupedList';
import { CategoryFilter, RangeFilter, TypeFilter } from '../../components/FilterControls';
import { Sheet } from '../../components/Overlay';
import PullToRefresh from '../../components/PullToRefresh';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/States';
import SwipeRow from '../../components/SwipeRow';
import TxRow from '../../components/TxRow';
import { usePeriod } from '../../context/PeriodContext';
import { useQuickAdd } from '../../context/QuickAddContext';
import { useStats } from '../../hooks/useStats';
import { useTransactionActions } from '../../hooks/useTransactionActions';
import { useTransactionFilters } from '../../hooks/useTransactionFilters';
import { useTransactions } from '../../hooks/useTransactions';
import { formatINR } from '../../lib/format';
import { summarize } from '../../lib/stats';

const PAGE = 120;

export default function TransactionsMobile() {
  const f = useTransactionFilters();
  const { month } = usePeriod();
  const { data, loading, error, refresh } = useTransactions(f.range);
  const { median } = useStats(month);
  const { openEdit } = useQuickAdd();
  const { remove } = useTransactionActions();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shown, setShown] = useState(PAGE);

  const { apply } = f;
  const items = useMemo(() => apply(data), [apply, data]);
  const totals = useMemo(() => summarize(items), [items]);

  return (
    <div className="pt-4">
      <h1 className="text-[28px]">Transactions</h1>

      <div className="flex gap-2 mt-4">
        <div className="relative flex-1">
          <label htmlFor="tx-search" className="sr-only">Search notes</label>
          <MagnifyingGlass size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input id="tx-search" type="search" className="field pl-12 bg-surface" placeholder="Search notes" value={f.q} onChange={(e) => f.setQ(e.target.value)} />
        </div>
        <button type="button" className="btn-secondary px-4 bg-surface relative" onClick={() => setFiltersOpen(true)} aria-label={`Filters${f.activeCount ? `, ${f.activeCount} active` : ''}`}>
          <Funnel size={20} weight="bold" aria-hidden="true" />
          {f.activeCount > 0 && <span className="absolute -top-1 -right-1 grid place-items-center w-5 h-5 rounded-badge bg-forest text-lime dark:bg-lime dark:text-forest text-xs font-bold">{f.activeCount}</span>}
        </button>
      </div>

      <p className="text-sm text-muted font-semibold mt-3 num" aria-live="polite">
        {items.length} entries · {formatINR(totals.expense)} spent{totals.income > 0 && ` · ${formatINR(totals.income)} in`}
      </p>

      <PullToRefresh onRefresh={refresh}>
        {error && <div className="mt-4"><ErrorState error={error} /></div>}
        {loading ? <div className="mt-4"><ListSkeleton rows={6} /></div> : items.length === 0 ? (
          <EmptyState icon={Receipt} title="No matches" action={f.activeCount || f.q ? <button type="button" className="btn-secondary" onClick={f.reset}>Clear filters</button> : null}>
            Nothing in this range fits the filters. Try a wider date range.
          </EmptyState>
        ) : (
          <>
            <p className="sr-only">Swipe a row left to delete or right to edit. Tap to open it.</p>
            <DayGroupedList
              items={items.slice(0, shown)}
              renderRow={(t) => (
                <SwipeRow onEdit={() => openEdit(t)} onDelete={() => remove(t)}>
                  <TxRow tx={t} median={median} onClick={() => openEdit(t)} />
                </SwipeRow>
              )}
            />
            {items.length > shown && (
              <button type="button" className="btn-secondary w-full mt-4" onClick={() => setShown((n) => n + PAGE)}>Show more</button>
            )}
          </>
        )}
      </PullToRefresh>

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <div className="space-y-6 pt-2">
          <RangeFilter f={f} idPrefix="m" />
          <TypeFilter f={f} />
          <CategoryFilter f={f} />
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={f.reset}>Reset</button>
            <button type="button" className="btn-primary flex-1" onClick={() => setFiltersOpen(false)}>Show {items.length}</button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
