import ExportPanel from '../../components/ExportPanel';
import ImportWizard from '../../components/ImportWizard';

export default function ImportDesktop() {
  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-8 space-y-6">
        <header>
          <h1 className="text-[40px] leading-tight">Import from Excel</h1>
          <p className="text-muted font-semibold mt-1">Monthly sheets become transactions. The College and Hostel sheet becomes fees, hostel payments and scholarships.</p>
        </header>
        <ImportWizard />
      </div>
      <aside className="col-span-4 card p-6 mt-[104px] space-y-4 text-[15px]">
        <h2 className="text-lg">What gets read</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Every sheet whose first cell is <b>Date</b>. Each filled amount becomes one entry.</li>
          <li>The <b>Income</b> column becomes income.</li>
          <li>Total Cost, Total Expenditure and the totals row are skipped. Kharcha adds things up itself.</li>
          <li>Fees by year, both hostel blocks with their deposits, and the scholarship list.</li>
        </ul>
        <h2 className="text-lg pt-2">Export</h2>
        <ExportPanel />
      </aside>
    </div>
  );
}
