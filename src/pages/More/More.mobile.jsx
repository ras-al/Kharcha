import { CaretRight, Gear, HandCoins, Printer, SignOut, Target, Ticket, UploadSimple } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import LegalLinks from '../../components/LegalLinks';
import { signOut } from '../../services/auth.service';
import MobileHeader from '../../components/MobileHeader';

const LINKS = [
  { to: '/debts', label: 'Debts', Icon: HandCoins },
  { to: '/budgets', label: 'Budgets and templates', Icon: Target },
  { to: '/events', label: 'Workshops and events', Icon: Ticket },
  { to: '/reports', label: 'Monthly report', Icon: Printer },
  { to: '/settings/import', label: 'Import from Excel', Icon: UploadSimple },
  { to: '/settings', label: 'Settings', Icon: Gear },
];

export default function MoreMobile() {
  return (
    <div className="space-y-4">
      <MobileHeader title="More" />
      <nav aria-label="More" className="card p-2">
        <ul>
          {LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link to={to} className="flex items-center gap-4 px-3 min-h-[60px] rounded-control hover:bg-sunk font-bold">
                <span className="grid place-items-center w-11 h-11 rounded-control bg-sunk"><Icon size={22} weight="bold" aria-hidden="true" /></span>
                <span className="flex-1">{label}</span>
                <CaretRight size={18} weight="bold" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" className="btn-secondary w-full bg-surface text-expense" onClick={signOut}><SignOut size={20} weight="bold" aria-hidden="true" /> Sign out</button>
      <LegalLinks className="text-center" />
    </div>
  );
}
