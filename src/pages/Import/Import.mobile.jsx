import { CaretLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import ImportWizard from '../../components/ImportWizard';

export default function ImportMobile() {
  return (
    <div className="pt-4 space-y-5">
      <Link to="/settings" className="inline-flex items-center gap-1 font-bold text-sm min-h-[44px] -ml-1"><CaretLeft size={16} weight="bold" aria-hidden="true" /> Settings</Link>
      <h1 className="text-[28px] -mt-2">Import</h1>
      <ImportWizard compact />
    </div>
  );
}
