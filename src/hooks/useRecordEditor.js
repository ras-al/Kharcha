import { useCallback, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../lib/format';
import { useFees, useHostel, useScholarships } from './useRecords';

/**
 * Data and editing state for the Fees screen (college fees, hostel,
 * scholarships). Both the mobile and desktop page render from this.
 */
export function useRecordEditor() {
  const toast = useToast();
  const fees = useFees();
  const hostel = useHostel();
  const scholarships = useScholarships();
  const [form, setForm] = useState(null); // { kind: 'fee' | 'hostel' | 'scholarship', year?, initial? }

  const close = useCallback(() => setForm(null), []);
  const openFee = useCallback((year = 1, initial = null) => setForm({ kind: 'fee', year, initial }), []);
  const openHostel = useCallback(() => setForm({ kind: 'hostel' }), []);
  const openScholarship = useCallback(() => setForm({ kind: 'scholarship' }), []);

  const saveFee = useCallback((data) => {
    fees.save(data, form?.initial?.id);
    toast(form?.initial ? 'Fee updated' : `Fee of ${formatINR(data.amount)} added`);
    close();
  }, [fees, form, toast, close]);

  const saveHostel = useCallback((data, id) => {
    hostel.save(data, id);
    toast(`${data.label} ${data.kind === 'monthly' ? data.month : data.kind} saved`);
    close();
  }, [hostel, toast, close]);

  const saveScholarship = useCallback((data) => {
    scholarships.save(data);
    toast(`${data.name} ${formatINR(data.amount)} added`);
    close();
  }, [scholarships, toast, close]);

  const deleteScholarship = useCallback((s) => {
    scholarships.remove(s.id);
    const { id, ...rest } = s;
    toast(`Deleted ${s.name}`, { action: { label: 'Undo', onClick: () => scholarships.save(rest, id) } });
  }, [scholarships, toast]);

  const loading = fees.loading || hostel.loading || scholarships.loading;
  const error = fees.error || hostel.error || scholarships.error;
  const empty = !loading && !fees.fees.length && !hostel.stays.length && !scholarships.items.length;

  return {
    fees, hostel, scholarships, form, close, openFee, openHostel, openScholarship,
    saveFee, saveHostel, saveScholarship, deleteScholarship, loading, error, empty,
  };
}

export const FEE_TABS = [
  { id: 'college', label: 'College fees' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'scholarships', label: 'Scholarships' },
];
