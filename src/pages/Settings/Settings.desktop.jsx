import { SignOut, UploadSimple } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import DeleteAccount from '../../components/DeleteAccount';
import ExportPanel from '../../components/ExportPanel';
import LegalLinks from '../../components/LegalLinks';
import Preferences from '../../components/Preferences';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../layouts/DesktopLayout';
import { signOut } from '../../services/auth.service';

const SHORTCUTS = [
  ['N', 'Add a transaction'],
  ['/', 'Search'],
  ['G then D', 'Dashboard'],
  ['G then T', 'Transactions'],
  ['G then S', 'Stats'],
  ['G then B', 'Budgets'],
  ['G then F', 'Fees and hostel'],
  ['G then R', 'Reports'],
];

export default function SettingsDesktop() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-[1100px]">
      <h1 className="text-[40px] leading-tight">Settings</h1>
      <div className="grid grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <section className="card p-6 flex items-center gap-4">
            <Avatar user={user} size={56} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate">{user.displayName || 'Your account'}</p>
              <p className="text-muted truncate">{user.email}</p>
            </div>
            <button type="button" className="btn-secondary" onClick={signOut}><SignOut size={18} weight="bold" aria-hidden="true" /> Sign out</button>
          </section>
          <section className="card p-6"><h2 className="text-lg mb-5">Appearance</h2><Preferences /></section>
          <section className="card p-6">
            <h2 className="text-lg">Delete account</h2>
            <p className="text-sm text-muted mt-1 mb-4">Removes every record and your sign-in account. Download a copy first if you might need it.</p>
            <DeleteAccount />
          </section>
          <LegalLinks />
        </div>
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg">Your data</h2>
            <p className="text-sm text-muted mt-1 mb-4">Bring in the old workbook, or download a full copy as Excel or CSV.</p>
            <Link to="/settings/import" className="btn-primary"><UploadSimple size={18} weight="bold" aria-hidden="true" /> Import from Excel</Link>
            <div className="mt-5"><ExportPanel /></div>
          </section>
          <section className="card p-6">
            <h2 className="text-lg mb-3">Keyboard shortcuts</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
              {SHORTCUTS.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt><kbd className="font-bold text-sm border border-line rounded-md px-2 py-0.5 bg-sunk">{k}</kbd></dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
