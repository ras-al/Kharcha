import {
  ArrowDown, ArrowUp, CaretLeft, CaretRight, DownloadSimple, Receipt, Trash, X,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import CategoryIcon from '../../components/CategoryIcon';
import { RangeFilter } from '../../components/FilterControls';
import { TxAmount } from '../../components/Money';
import { Confirm, Drawer } from '../../components/Overlay';
import { EmptyState, ErrorState, Skeleton } from '../../components/States';
import TxDetail from '../../components/TxDetail';
import { LargeBadge, txTitle } from '../../components/TxRow';
import { usePeriod } from '../../context/PeriodContext';
import { useStats } from '../../hooks/useStats';
import { useTransactionActions } from '../../hooks/useTransactionActions';
import { useTransactionFilters } from '../../hooks/useTransactionFilters';
import { useTransactions } from '../../hooks/useTransactions';
import { CATEGORY_IDS } from '../../lib/categories';
import { fromInputDate, toInputDate } from '../../lib/dates';
import { formatINR } from '../../lib/format';
import { isLargeExpense, summarize } from '../../lib/stats';
import { validateTransaction } from '../../lib/validation';
import { downloadCsv, downloadTransactionsXlsx } from '../../services/exportExcel';

const COLUMNS = [
  { key: 'date', label: 'Date', width: 'w-[150px]' },
  { key: 'title', label: 'Description' },
  { key: 'category', label: 'Category', width: 'w-[200px]' },
  { key: 'type', label: 'Type', width: 'w-[120px]' },
  { key: 'amount', label: 'Amount', width: 'w-[150px]', align: 'right' },
];

const sortValue = {
  date: (t) => t.date.getTime(),
  title: (t) => txTitle(t).toLowerCase(),
  category: (t) => t.category,
  type: (t) => t.type,
  amount: (t) => (t.type === 'income' ? t.amount : -t.amount),
};

export default function TransactionsDesktop() {
  const f = useTransactionFilters();
  const { month } = usePeriod();
  const { data, loading, error } = useTransactions(f.range);
  const { median } = useStats(month);
  const { update, removeMany, recategorize } = useTransactionActions();

  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [editing, setEditing] = useState(null); // { id, field }
  const [detailId, setDetailId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { apply } = f;
  const items = useMemo(() => {
    const list = apply(data);
    const get = sortValue[sort.key];
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => (get(a) > get(b) ? dir : get(a) < get(b) ? -dir : b.date - a.date));
  }, [apply, data, sort]);
  const totals = useMemo(() => summarize(items), [items]);

  // Reset paging and selection whenever the result set changes shape.
  useEffect(() => { setPage(0); setSelected(new Set()); }, [f.range.from.getTime(), f.range.to.getTime(), f.q, f.type, f.categories.size]);

  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const rows = items.slice(page * pageSize, page * pageSize + pageSize);
  const selectedTx = items.filter((t) => selected.has(t.id));
  const allOnPage = rows.length > 0 && rows.every((t) => selected.has(t.id));
  const detail = detailId ? data.find((t) => t.id === detailId) : null;

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  const toggleRow = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const togglePage = () => setSelected((s) => {
    const n = new Set(s);
    rows.forEach((t) => (allOnPage ? n.delete(t.id) : n.add(t.id)));
    return n;
  });

  const saveInline = (tx, field, raw) => {
    setEditing(null);
    const next = { ...tx };
    if (field === 'amount') next.amount = Number(raw);
    if (field === 'title') next.note = raw;
    if (field === 'category') next.category = raw;
    if (field === 'date') next.date = fromInputDate(raw);
    const unchanged = field === 'amount' ? next.amount === tx.amount
      : field === 'title' ? (next.note || '') === (tx.note || '')
        : field === 'date' ? next.date?.getTime() === tx.date.getTime() : next.category === tx.category;
    if (unchanged) return;
    if (Object.keys(validateTransaction(next)).length) return;
    update(tx.id, next);
  };

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[40px] leading-tight">Transactions</h1>
          <p className="text-muted font-semibold mt-1 num" aria-live="polite">
            {items.length} entries · <span className="text-ink">{formatINR(totals.expense)}</span> spent · <span className="text-income">{formatINR(totals.income)}</span> in
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary bg-surface" disabled={!items.length} onClick={() => downloadCsv(items)}>
            <DownloadSimple size={18} weight="bold" aria-hidden="true" /> CSV
          </button>
          <button type="button" className="btn-secondary bg-surface" disabled={!items.length} onClick={() => downloadTransactionsXlsx(items)}>
            <DownloadSimple size={18} weight="bold" aria-hidden="true" /> Excel
          </button>
        </div>
      </header>

      <div className="card p-5"><RangeFilter f={f} idPrefix="d" /></div>

      {selected.size > 0 && (
        <div role="region" aria-label="Bulk actions" className="sticky top-[88px] z-10 flex items-center gap-3 rounded-control bg-accent text-accent-ink pl-6 pr-2 py-2 shadow-lift">
          <span className="font-bold">{selected.size} selected</span>
          <label htmlFor="recat" className="sr-only">Move to category</label>
          <select
            id="recat"
            className="ml-auto rounded-badge bg-accent-ink/10 font-bold px-4 min-h-[40px]"
            value=""
            onChange={(e) => { if (e.target.value) { recategorize(selectedTx, e.target.value); setSelected(new Set()); } }}
          >
            <option value="" className="text-ink bg-surface">Move to category</option>
            {CATEGORY_IDS.map((c) => <option key={c} value={c} className="text-ink bg-surface">{c}</option>)}
          </select>
          <button type="button" className="btn btn-sm bg-expense text-on-expense hover:brightness-110" onClick={() => setConfirmDelete(true)}>
            <Trash size={16} weight="bold" aria-hidden="true" /> Delete
          </button>
          <button type="button" className="icon-btn text-inherit hover:bg-accent-ink/10" aria-label="Clear selection" onClick={() => setSelected(new Set())}><X size={18} weight="bold" /></button>
        </div>
      )}

      {error && <ErrorState error={error} />}

      <div className="card overflow-hidden">
        <table className="w-full text-[15px]">
          <caption className="sr-only">Transactions. Click a row for details, double-click a cell to edit it.</caption>
          <thead className="bg-sunk/60">
            <tr>
              <th scope="col" className="w-12 pl-5">
                <input type="checkbox" className="w-5 h-5 accent-[rgb(var(--ink))]" checked={allOnPage} onChange={togglePage} aria-label="Select all on this page" />
              </th>
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" className={`${c.width || ''} px-3 py-3 text-sm font-bold text-muted ${c.align === 'right' ? 'text-right pr-6' : 'text-left'}`}
                  aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="inline-flex items-center gap-1 hover:text-ink min-h-[32px]" onClick={() => toggleSort(c.key)}>
                    {c.label}
                    {sort.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={14} weight="bold" /> : <ArrowDown size={14} weight="bold" />)}
                  </button>
                </th>
              ))}
            </tr>
            <tr className="border-t border-line">
              <td />
              <td className="px-3 pb-3 text-xs text-muted font-semibold">Range above</td>
              <td className="px-3 pb-3">
                <label htmlFor="col-q" className="sr-only">Filter description</label>
                <input id="col-q" className="field min-h-[38px] rounded-badge text-sm bg-surface" placeholder="Contains" value={f.q} onChange={(e) => f.setQ(e.target.value)} />
              </td>
              <td className="px-3 pb-3">
                <label htmlFor="col-cat" className="sr-only">Filter category</label>
                <select id="col-cat" className="field min-h-[38px] rounded-badge text-sm bg-surface" value={f.categories.size === 1 ? [...f.categories][0] : ''}
                  onChange={(e) => { f.clearCategories(); if (e.target.value) f.toggleCategory(e.target.value); }}>
                  <option value="">All</option>
                  {[...CATEGORY_IDS, 'Income'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </td>
              <td className="px-3 pb-3">
                <label htmlFor="col-type" className="sr-only">Filter type</label>
                <select id="col-type" className="field min-h-[38px] rounded-badge text-sm bg-surface" value={f.type} onChange={(e) => f.setType(e.target.value)}>
                  <option value="all">All</option><option value="expense">Expense</option><option value="income">Income</option>
                </select>
              </td>
              <td className="px-3 pr-6 pb-3">
                <div className="flex gap-1.5">
                  <label htmlFor="col-min" className="sr-only">Minimum amount</label>
                  <input id="col-min" inputMode="decimal" className="field min-h-[38px] rounded-badge text-sm px-3 bg-surface" placeholder="Min" value={f.amount.min} onChange={(e) => f.setAmount((a) => ({ ...a, min: e.target.value.replace(/[^\d.]/g, '') }))} />
                  <label htmlFor="col-max" className="sr-only">Maximum amount</label>
                  <input id="col-max" inputMode="decimal" className="field min-h-[38px] rounded-badge text-sm px-3 bg-surface" placeholder="Max" value={f.amount.max} onChange={(e) => f.setAmount((a) => ({ ...a, max: e.target.value.replace(/[^\d.]/g, '') }))} />
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-t border-line"><td colSpan={6} className="px-5 py-3"><Skeleton className="h-6" /></td></tr>
            ))}
            {!loading && rows.map((t) => (
              <tr
                key={t.id}
                tabIndex={0}
                onClick={() => setDetailId(t.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setDetailId(t.id); }}
                className={`border-t border-line cursor-pointer transition-colors duration-100 hover:bg-sunk/60 focus-visible:bg-sunk ${selected.has(t.id) ? 'bg-accent/15' : ''}`}
              >
                <td className="pl-5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="w-5 h-5 accent-[rgb(var(--ink))]" checked={selected.has(t.id)} onChange={() => toggleRow(t.id)} aria-label={`Select ${txTitle(t)}, ${formatINR(t.amount)}`} />
                </td>
                <EditableCell tx={t} field="date" editing={editing} setEditing={setEditing} onSave={saveInline}>
                  <span className="num">{format(t.date, 'd MMM yyyy')}</span>
                </EditableCell>
                <EditableCell tx={t} field="title" editing={editing} setEditing={setEditing} onSave={saveInline}>
                  <span className="flex items-center gap-3">
                    <CategoryIcon id={t.category} size={34} />
                    <span className="font-bold truncate max-w-[340px]">{txTitle(t)}</span>
                    {isLargeExpense(t, median) && <LargeBadge />}
                  </span>
                </EditableCell>
                <EditableCell tx={t} field="category" editing={editing} setEditing={setEditing} onSave={saveInline}>
                  <span className="text-muted font-semibold">{t.type === 'income' ? 'Income' : t.category}</span>
                </EditableCell>
                <td className="px-3 py-2.5 text-muted font-semibold">{t.type === 'income' ? 'Income' : 'Expense'}</td>
                <EditableCell tx={t} field="amount" editing={editing} setEditing={setEditing} onSave={saveInline} align="right">
                  <TxAmount tx={t} />
                </EditableCell>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && items.length === 0 && (
          <EmptyState icon={Receipt} title="No transactions match" action={<button type="button" className="btn-secondary" onClick={f.reset}>Clear filters</button>}>
            Try another date range or remove a column filter.
          </EmptyState>
        )}
        {items.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-line text-sm font-semibold">
            <label className="flex items-center gap-2 text-muted">
              Rows per page
              <select className="rounded-badge bg-sunk px-3 min-h-[36px] text-ink font-bold" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}>
                {[25, 50, 100, 250].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-muted num">{page * pageSize + 1} to {Math.min(items.length, (page + 1) * pageSize)} of {items.length}</span>
              <button type="button" className="icon-btn disabled:opacity-30" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><CaretLeft size={18} weight="bold" /></button>
              <button type="button" className="icon-btn disabled:opacity-30" aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}><CaretRight size={18} weight="bold" /></button>
            </div>
          </div>
        )}
      </div>

      <Drawer open={Boolean(detail)} onClose={() => setDetailId(null)} title="Transaction">
        {detail && <TxDetail tx={detail} median={median} onClose={() => setDetailId(null)} />}
      </Drawer>
      <Confirm
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { removeMany(selectedTx); setSelected(new Set()); }}
        title={`Delete ${selected.size} transaction${selected.size === 1 ? '' : 's'}?`}
      >
        You can undo this from the message that appears afterwards.
      </Confirm>
    </div>
  );
}

/** Table cell that turns into an input on double-click. Enter saves, Escape cancels. */
function EditableCell({ tx, field, editing, setEditing, onSave, align, children }) {
  const active = editing?.id === tx.id && editing.field === field;
  const ref = useRef(null);
  const cancelled = useRef(false);
  const canEdit = !(field === 'category' && tx.type === 'income');
  useEffect(() => {
    if (active) { cancelled.current = false; ref.current?.focus(); }
  }, [active]);

  const initial = field === 'amount' ? String(tx.amount) : field === 'title' ? tx.note || '' : field === 'date' ? toInputDate(tx.date) : tx.category;
  const common = {
    ref,
    defaultValue: initial,
    onClick: (e) => e.stopPropagation(),
    onBlur: (e) => { if (!cancelled.current) onSave(tx, field, e.target.value); },
    onKeyDown: (e) => {
      if (e.key === 'Enter') e.currentTarget.blur();
      if (e.key === 'Escape') { e.stopPropagation(); cancelled.current = true; setEditing(null); }
    },
    'aria-label': `Edit ${field === 'title' ? 'note' : field}`,
    className: `field min-h-[38px] rounded-badge text-sm bg-surface ${align === 'right' ? 'text-right' : ''}`,
  };

  return (
    <td
      className={`px-3 py-2.5 ${align === 'right' ? 'text-right pr-6' : ''}`}
      onDoubleClick={(e) => { if (canEdit) { e.stopPropagation(); setEditing({ id: tx.id, field }); } }}
      title={canEdit ? 'Double-click to edit' : undefined}
    >
      {!active ? children : field === 'category' ? (
        <select {...common}>{CATEGORY_IDS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      ) : (
        <input {...common} type={field === 'date' ? 'date' : 'text'} inputMode={field === 'amount' ? 'decimal' : undefined} placeholder={field === 'title' ? tx.category : undefined} />
      )}
    </td>
  );
}
