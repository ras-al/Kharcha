import { CaretLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import ImportWizard from '../../components/ImportWizard';
import MobileHeader from '../../components/MobileHeader';

export default function ImportMobile() {
  return (
    <div className="space-y-4">
      <MobileHeader
        eyebrow={<Link to="/settings" className="inline-flex items-center gap-1 font-bold min-h-[32px]"><CaretLeft size={14} weight="bold" aria-hidden="true" /> Settings</Link>}
        title="Import"
      />
      <ImportWizard compact />
    </div>
  );
}
