import { Printer } from '@phosphor-icons/react';
import MonthlyReport from '../../components/MonthlyReport';
import MonthSwitcher from '../../components/MonthSwitcher';
import { usePeriod } from '../../context/PeriodContext';

export default function ReportsMobile() {
  const { month, setMonth } = usePeriod();
  return (
    <div className="pt-4 space-y-4">
      <header className="no-print">
        <h1 className="text-[28px]">Report</h1>
        <div className="flex items-center justify-between mt-2">
          <MonthSwitcher value={month} onChange={setMonth} pattern="MMM yyyy" />
          <button type="button" className="btn-primary btn-sm" onClick={() => window.print()}><Printer size={16} weight="bold" aria-hidden="true" /> Print</button>
        </div>
      </header>
      <div className="-mx-2 overflow-x-auto"><MonthlyReport month={month} /></div>
    </div>
  );
}
