import { Printer } from '@phosphor-icons/react';
import MonthlyReport from '../../components/MonthlyReport';
import MonthSwitcher from '../../components/MonthSwitcher';
import { usePeriod } from '../../context/PeriodContext';
import MobileHeader from '../../components/MobileHeader';

export default function ReportsMobile() {
  const { month, setMonth } = usePeriod();
  return (
    <div className="space-y-4">
      <div className="no-print">
        <MobileHeader title="Report" action={<MonthSwitcher value={month} onChange={setMonth} narrow />} />
        <button type="button" className="btn-primary w-full mt-3" onClick={() => window.print()}><Printer size={18} weight="bold" aria-hidden="true" /> Print or save as PDF</button>
      </div>
      <div className="-mx-2 overflow-x-auto"><MonthlyReport month={month} /></div>
    </div>
  );
}
