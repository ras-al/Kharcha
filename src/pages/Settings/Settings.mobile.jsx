import { CaretRight, SignOut, UploadSimple } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import DeleteAccount from '../../components/DeleteAccount';
import ExportPanel from '../../components/ExportPanel';
import LegalLinks from '../../components/LegalLinks';
import Preferences from '../../components/Preferences';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../layouts/DesktopLayout';
import { signOut } from '../../services/auth.service';

export default function SettingsMobile() {
  const { user } = useAuth();
  return (
    <div className="pt-4 space-y-5">
      <h1 className="text-[28px]">Settings</h1>
      <section className="card p-5 flex items-center gap-4">
        <Avatar user={user} size={48} />
        <div className="min-w-0">
          <p className="font-bold truncate">{user.displayName || 'Your account'}</p>
          <p className="text-sm text-muted truncate">{user.email}</p>
        </div>
      </section>
      <section className="card p-5"><Preferences /></section>
      <section className="card p-5 space-y-4">
        <h2 className="text-lg">Your data</h2>
        <Link to="/settings/import" className="flex items-center gap-3 rounded-control bg-sunk px-4 min-h-[56px] font-bold">
          <UploadSimple size={20} weight="bold" aria-hidden="true" /> <span className="flex-1">Import from Excel</span> <CaretRight size={18} weight="bold" aria-hidden="true" />
        </Link>
        <div>
          <p className="field-label">Download everything</p>
          <ExportPanel />
        </div>
      </section>
      <button type="button" className="btn-secondary w-full bg-surface" onClick={signOut}><SignOut size={20} weight="bold" aria-hidden="true" /> Sign out</button>
      <section className="card p-5">
        <h2 className="text-lg">Delete account</h2>
        <p className="text-sm text-muted mt-1 mb-4">Removes all your data and your sign-in account.</p>
        <DeleteAccount />
      </section>
      <LegalLinks className="text-center" />
    </div>
  );
}
