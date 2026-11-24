/**
 * Settings > Import. Four steps: pick file, preview, write, done.
 * Nothing touches the database until the user confirms the preview.
 */
import { CheckCircle, FileXls, UploadSimple, WarningCircle } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOnline } from '../hooks/useOnline';
import { monthLabel } from '../lib/dates';
import { formatINR } from '../lib/format';
import { parseFile, writeImport } from '../services/importExcel';
import ProgressBar from './ProgressBar';

export default function ImportWizard({ compact = false }) {
  const { user } = useAuth();
  const online = useOnline();
  const inputRef = useRef(null);
  const [step, setStep] = useState('pick');
  const [plan, setPlan] = useState(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    if (!/\.(xlsx|xlsm|xls)$/i.test(file.name)) {
      setError('Choose an Excel file (.xlsx).');
      return;
    }
    setFileName(file.name);
    setStep('parsing');
    try {
      const p = await parseFile(file);
      if (!p.transactions.length && !p.fees.length) throw new Error('empty');
      setPlan(p);
      setStep('preview');
    } catch (e) {
      console.error(e);
      setError(e.message === 'empty'
        ? 'No sheets with a "Date" header and no fees table were found in that file.'
        : 'That file could not be read. Is it a valid Excel workbook?');
      setStep('pick');
    }
  }

  async function confirm() {
    setStep('writing');
    setError(null);
    try {
      await writeImport(user.uid, plan, (done, total) => setProgress({ done, total }));
      setStep('done');
    } catch (e) {
      console.error(e);
      setError(e.code === 'permission-denied'
        ? 'The server rejected some rows. Nothing after the failed batch was written; importing again is safe.'
        : 'Writing stopped part way. Importing the same file again is safe and will finish the job.');
      setStep('preview');
    }
  }

  if (step === 'pick' || step === 'parsing') {
    return (
      <div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          className={`rounded-card border-2 border-dashed p-8 text-center transition-colors duration-150 ${dragging ? 'border-ink bg-sunk' : 'border-line'}`}
        >
          <FileXls size={44} weight="duotone" className="mx-auto text-income" aria-hidden="true" />
          <p className="font-bold text-lg mt-3">Import your expense workbook</p>
          <p className="text-muted text-sm mt-1 max-w-md mx-auto">
            The file is read on this device. You will see exactly what will be added before anything is saved.
          </p>
          <input ref={inputRef} type="file" accept=".xlsx,.xlsm,.xls" className="sr-only" id="import-file" onChange={(e) => handleFile(e.target.files[0])} />
          <label htmlFor="import-file" className="btn-primary mt-5 cursor-pointer" aria-disabled={step === 'parsing'}>
            <UploadSimple size={20} weight="bold" aria-hidden="true" />
            {step === 'parsing' ? 'Reading file' : 'Choose Expense.xlsx'}
          </label>
          {!compact && <p className="text-xs text-muted mt-3">or drop it here</p>}
        </div>
        {error && <p role="alert" className="field-error mt-3">{error}</p>}
      </div>
    );
  }

  if (step === 'writing') {
    const pct = progress.total ? progress.done / progress.total : 0;
    return (
      <div className="card p-6" aria-live="polite">
        <p className="font-bold text-lg">Saving to your account</p>
        <p className="text-muted text-sm mt-1 num">{progress.done} of {progress.total || '…'} records</p>
        <ProgressBar ratio={pct} label="Import progress" className="mt-4" height={12} />
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="card p-6 text-center">
        <CheckCircle size={48} weight="fill" className="mx-auto text-income" aria-hidden="true" />
        <p className="font-extrabold text-2xl mt-2">Import finished</p>
        <p className="text-muted mt-1 num">
          {plan.transactions.length} transactions, {plan.fees.length} fees, {plan.hostel.length} hostel records and {plan.scholarships.length} scholarships are in your account.
        </p>
        <button type="button" className="btn-secondary mt-5" onClick={() => { setPlan(null); setStep('pick'); }}>Import another file</button>
      </div>
    );
  }

  return <Preview plan={plan} fileName={fileName} onConfirm={confirm} onCancel={() => { setPlan(null); setStep('pick'); }} error={error} online={online} compact={compact} />;
}

function Preview({ plan, fileName, onConfirm, onCancel, error, online, compact }) {
  const mismatchCount = plan.sheets.reduce((n, s) => n + s.mismatches.length, 0);
  const stats = [
    ['Transactions', plan.totals.transactions.toLocaleString('en-IN')],
    ['Total spent', formatINR(plan.totals.expense)],
    ['Total income', formatINR(plan.totals.income)],
    ['College fees', `${plan.fees.length} rows, ${formatINR(plan.totals.fees)}`],
    ['Hostel', `${plan.hostel.length} rows`],
    ['Scholarships', `${plan.scholarships.length}, ${formatINR(plan.totals.scholarships)}`],
  ];

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <p className="eyebrow">Preview of {fileName}</p>
        <dl className={`grid gap-4 mt-3 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {stats.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-muted font-semibold">{k}</dt>
              <dd className="num font-extrabold text-lg">{v}</dd>
            </div>
          ))}
        </dl>
        {plan.scholarshipMatches > 0 && (
          <p className="text-sm text-muted mt-4">
            {plan.scholarshipMatches} scholarship payments were found in the Income column on the same day and will be tagged as scholarship income.
          </p>
        )}
      </div>

      <section className="card p-6">
        <h3 className="text-lg mb-3">Per sheet</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th scope="col" className="py-2 pr-3 font-semibold">Sheet</th>
                <th scope="col" className="py-2 px-3 font-semibold text-right">Days</th>
                <th scope="col" className="py-2 px-3 font-semibold text-right">Entries</th>
                <th scope="col" className="py-2 px-3 font-semibold text-right">Spent</th>
                <th scope="col" className="py-2 pl-3 font-semibold text-right">Income</th>
              </tr>
            </thead>
            <tbody>
              {plan.sheets.map((s) => (
                <tr key={s.name} className="border-t border-line">
                  <th scope="row" className="py-2 pr-3 text-left font-semibold">
                    {s.name}
                    {s.firstDate && <span className="block text-xs text-muted font-normal">{monthLabel(`${s.firstDate.getFullYear()}-${String(s.firstDate.getMonth() + 1).padStart(2, '0')}`)}</span>}
                    {s.mismatches.length > 0 && <span className="block text-xs text-warn font-bold">Totals row differs</span>}
                  </th>
                  <td className="py-2 px-3 text-right num">{s.rows}</td>
                  <td className="py-2 px-3 text-right num">{s.transactions}</td>
                  <td className="py-2 px-3 text-right num">{formatINR(s.expense)}</td>
                  <td className="py-2 pl-3 text-right num">{formatINR(s.income)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(plan.skipped.length > 0 || plan.ignoredSheets.length > 0 || plan.warnings.length > 0 || mismatchCount > 0) && (
        <section className="card p-6">
          <h3 className="text-lg mb-1">Skipped and checked</h3>
          <p className="text-sm text-muted mb-3">These cells are not imported. Nothing here needs action unless it looks wrong.</p>
          <ul className="space-y-2 text-sm">
            {plan.ignoredSheets.map((s) => <li key={s.name}><b>{s.name}</b>: {s.reason}</li>)}
            <li><b>Computed columns</b> (Total Cost, Total Expenditure, Except Hostel & Academics) and totals rows are recalculated by Kharcha.</li>
            {plan.skipped.map((s) => <li key={`${s.sheet}!${s.cell}`}><b>{s.sheet} {s.cell}</b> “{s.value}”: {s.reason}</li>)}
            {plan.sheets.flatMap((s) => s.mismatches.map((m) => (
              <li key={`${s.name}-${m.cell}`} className="text-warn">
                <b>{s.name} {m.cell}</b>: the sheet total for {m.column} is {formatINR(m.sheetTotal)} but the rows add up to {formatINR(m.rowSum)}. The rows are imported.
              </li>
            )))}
            {plan.warnings.map((w) => <li key={w} className="text-warn">{w}</li>)}
          </ul>
        </section>
      )}

      {!online && (
        <p className="flex items-center gap-2 text-sm font-semibold text-warn"><WarningCircle size={18} weight="fill" aria-hidden="true" /> You are offline. Connect before importing so the progress can be confirmed.</p>
      )}
      {error && <p role="alert" className="field-error">{error}</p>}
      <p className="text-sm text-muted">Importing the same file again updates these records instead of duplicating them. Notes you add in Kharcha are kept.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" disabled={!online} onClick={onConfirm}>
          Import {plan.totals.transactions + plan.fees.length + plan.hostel.length + plan.scholarships.length} records
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Choose another file</button>
      </div>
    </div>
  );
}
