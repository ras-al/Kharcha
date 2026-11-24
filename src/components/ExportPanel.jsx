import { DownloadSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCollection } from '../hooks/useCollection';
import { downloadCsv, downloadWorkbook } from '../services/exportExcel';
import { fetchRange } from '../services/transactions.service';

const ALL_TIME = { from: new Date(2000, 0, 1), to: new Date(2100, 0, 1) };

/** Full backup as Excel (all sheets) or CSV (transactions only). */
export default function ExportPanel() {
  const { user } = useAuth();
  const toast = useToast();
  const fees = useCollection('fees').data;
  const hostel = useCollection('hostel').data;
  const scholarships = useCollection('scholarships').data;
  const [busy, setBusy] = useState(null);

  async function run(kind) {
    setBusy(kind);
    try {
      const transactions = await fetchRange(user.uid, ALL_TIME);
      if (kind === 'xlsx') downloadWorkbook({ transactions, fees, hostel, scholarships });
      else downloadCsv(transactions);
      toast(`Exported ${transactions.length} transactions`);
    } catch (e) {
      console.error(e);
      toast('Export failed. Try again.', { tone: 'error' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" className="btn-secondary" disabled={Boolean(busy)} onClick={() => run('xlsx')}>
        <DownloadSimple size={20} weight="bold" aria-hidden="true" />{busy === 'xlsx' ? 'Preparing' : 'Excel workbook'}
      </button>
      <button type="button" className="btn-secondary" disabled={Boolean(busy)} onClick={() => run('csv')}>
        <DownloadSimple size={20} weight="bold" aria-hidden="true" />{busy === 'csv' ? 'Preparing' : 'CSV'}
      </button>
    </div>
  );
}
