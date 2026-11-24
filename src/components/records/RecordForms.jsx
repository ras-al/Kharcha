/**
 * Small add/edit forms for fees, hostel payments, scholarships and
 * recurring templates. Shared by the mobile and desktop pages.
 */
import { useState } from 'react';
import { CATEGORY_IDS } from '../../lib/categories';
import { fromInputDate, toInputDate } from '../../lib/dates';
import { validateAmount } from '../../lib/validation';

function Field({ id, label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Actions({ onCancel, label }) {
  return (
    <div className="flex gap-3 pt-2">
      {onCancel && <button type="button" className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>}
      <button type="submit" className="btn-primary flex-1">{label}</button>
    </div>
  );
}

const amountInput = (value, set) => ({
  inputMode: 'decimal', className: 'field num', value, onChange: (e) => set(e.target.value.replace(/[^\d.]/g, '')),
});

export function FeeForm({ initial, defaultYear = 1, onSave, onCancel, onDelete }) {
  const [year, setYear] = useState(initial?.academicYear ?? defaultYear);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [section, setSection] = useState(initial?.section ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [status, setStatus] = useState(initial?.status ?? 'pending');
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const err = { amount: validateAmount(amount), description: description.trim() ? null : 'Describe the fee.' };
    setErrors(err);
    if (err.amount || err.description) return;
    onSave({
      academicYear: Number(year),
      description: description.trim(),
      ...(section.trim() ? { section: section.trim() } : {}),
      amount: Number(amount),
      status,
      paidDate: status === 'paid' ? (initial?.paidDate || new Date()) : null,
      order: initial?.order ?? Date.now(),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="fee-year" label="Year">
        <select id="fee-year" className="field" value={year} onChange={(e) => setYear(e.target.value)}>
          {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </Field>
      <Field id="fee-desc" label="Description" error={errors.description}>
        <input id="fee-desc" className="field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Semester exam fee" />
      </Field>
      <Field id="fee-section" label="Group (optional)">
        <input id="fee-section" className="field" value={section} onChange={(e) => setSection(e.target.value)} placeholder="KTU 4th Year" />
      </Field>
      <Field id="fee-amount" label="Amount" error={errors.amount}>
        <input id="fee-amount" {...amountInput(amount, setAmount)} placeholder="0" />
      </Field>
      <fieldset>
        <legend className="field-label">Status</legend>
        <div role="radiogroup" className="flex gap-2">
          {[['pending', 'Pending'], ['paid', 'Paid']].map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={status === id} className="chip pl-4" onClick={() => setStatus(id)}>{label}</button>
          ))}
        </div>
      </fieldset>
      <Actions onCancel={onCancel} label={initial ? 'Save fee' : 'Add fee'} />
      {initial && onDelete && (
        <button type="button" className="btn-ghost w-full text-expense" onClick={() => onDelete(initial)}>Delete this fee</button>
      )}
    </form>
  );
}

export function HostelForm({ stays, onSave, onCancel }) {
  const nextStay = stays.length ? stays[stays.length - 1].stay : 1;
  const [stay, setStay] = useState(nextStay);
  const [kind, setKind] = useState('monthly');
  const [month, setMonth] = useState(toInputDate(new Date()).slice(0, 7));
  const [amount, setAmount] = useState('');
  const [refundable, setRefundable] = useState(true);
  const [error, setError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const err = validateAmount(amount);
    setError(err);
    if (err) return;
    const s = Number(stay);
    const id = kind === 'monthly' ? `stay${s}-${month}` : `stay${s}-${kind}`;
    onSave({
      stay: s, label: `Hostel ${s}`, kind, month: kind === 'monthly' ? month : null, amount: Number(amount),
      ...(kind === 'deposit' ? { refundable } : {}),
    }, id);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="h-stay" label="Hostel">
        <select id="h-stay" className="field" value={stay} onChange={(e) => setStay(e.target.value)}>
          {[...new Set([...stays.map((s) => s.stay), nextStay + 1])].map((n) => (
            <option key={n} value={n}>{stays.find((s) => s.stay === n)?.label || `Hostel ${n} (new)`}</option>
          ))}
        </select>
      </Field>
      <fieldset>
        <legend className="field-label">Kind</legend>
        <div role="radiogroup" className="flex gap-2 flex-wrap">
          {[['monthly', 'Monthly fee'], ['advance', 'Advance'], ['deposit', 'Deposit']].map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={kind === id} className="chip pl-4" onClick={() => setKind(id)}>{label}</button>
          ))}
        </div>
      </fieldset>
      {kind === 'monthly' && (
        <Field id="h-month" label="Month">
          <input id="h-month" type="month" className="field" value={month} onChange={(e) => setMonth(e.target.value)} />
        </Field>
      )}
      <Field id="h-amount" label="Amount" error={error}>
        <input id="h-amount" {...amountInput(amount, setAmount)} placeholder="0" />
      </Field>
      {kind === 'deposit' && (
        <label className="flex items-center gap-3 font-semibold min-h-[44px]">
          <input type="checkbox" className="w-5 h-5 accent-[rgb(var(--ink))]" checked={refundable} onChange={(e) => setRefundable(e.target.checked)} />
          Refundable when I leave
        </label>
      )}
      <p className="text-sm text-muted">Saving a month that already exists replaces its amount.</p>
      <Actions onCancel={onCancel} label="Save" />
    </form>
  );
}

export function ScholarshipForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toInputDate(new Date()));
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const d = fromInputDate(date);
    const err = { name: name.trim() ? null : 'Enter the scholarship name.', amount: validateAmount(amount), date: d ? null : 'Pick a date.' };
    setErrors(err);
    if (Object.values(err).some(Boolean)) return;
    onSave({ name: name.trim(), amount: Number(amount), date: d });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="s-name" label="Name" error={errors.name}>
        <input id="s-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Egrants" list="s-names" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="s-amount" label="Amount" error={errors.amount}>
          <input id="s-amount" {...amountInput(amount, setAmount)} placeholder="0" />
        </Field>
        <Field id="s-date" label="Received on" error={errors.date}>
          <input id="s-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <p className="text-sm text-muted">This records the scholarship. Add it as income too if you want it in your monthly totals.</p>
      <Actions onCancel={onCancel} label="Add scholarship" />
    </form>
  );
}

export function TemplateForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hostel');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const err = { name: name.trim() ? null : 'Give it a short name.', amount: validateAmount(amount) };
    setErrors(err);
    if (err.name || err.amount) return;
    onSave({ name: name.trim(), category, amount: Number(amount), note: name.trim() });
    setName('');
    setAmount('');
  };

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-[1fr_1fr_8rem_auto] gap-3 items-start max-lg:grid-cols-2">
      <Field id="t-name" label="Name" error={errors.name} className="max-lg:col-span-2">
        <input id="t-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hostel monthly" />
      </Field>
      <Field id="t-cat" label="Category">
        <select id="t-cat" className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_IDS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field id="t-amount" label="Amount" error={errors.amount}>
        <input id="t-amount" {...amountInput(amount, setAmount)} placeholder="0" />
      </Field>
      <div className="pt-[26px] max-lg:pt-1 max-lg:col-span-2">
        <button type="submit" className="btn-primary w-full">Save template</button>
        {onCancel && <button type="button" className="btn-ghost w-full mt-2" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
