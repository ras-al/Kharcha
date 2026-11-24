import { Printer } from '@phosphor-icons/react';
import MonthlyReport from '../../components/MonthlyReport';
import { usePeriod } from '../../context/PeriodContext';
import { monthLabel } from '../../lib/dates';

export default function ReportsDesktop() {
  const { month } = usePeriod();
  return (
    <div className="space-y-6 max-w-[900px]">
      <header className="no-print flex items-end justify-between">
        <div>
          <h1 className="text-[40px] leading-tight">Reports</h1>
          <p className="text-muted font-semibold mt-1">Pick the month in the top bar. Printing saves it as a PDF too.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => window.print()}>
          <Printer size={18} weight="bold" aria-hidden="true" /> Print {monthLabel(month, 'MMMM')}
        </button>
      </header>
      <MonthlyReport month={month} />
    </div>
  );
}
