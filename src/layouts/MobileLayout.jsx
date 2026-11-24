import {
  Bank, ChartDonut, DotsThreeOutline, House, ListBullets, Plus,
} from '@phosphor-icons/react';
import { NavLink, useLocation } from 'react-router-dom';
import OfflineBanner from '../components/OfflineBanner';
import QuickAddSheet from '../components/quickadd/QuickAddSheet';
import UpdatePrompt from '../components/UpdatePrompt';
import { useQuickAdd } from '../context/QuickAddContext';
import { ToastViewport } from '../context/ToastContext';
import { useBudgetAlerts } from '../hooks/useBudgetAlerts';

const TABS = [
  { to: '/', label: 'Home', Icon: House, end: true },
  { to: '/transactions', label: 'Transactions', Icon: ListBullets },
  { to: '/stats', label: 'Stats', Icon: ChartDonut },
  { to: '/fees', label: 'Fees', Icon: Bank },
  { to: '/more', label: 'More', Icon: DotsThreeOutline },
];

const MORE_PATHS = ['/more', '/debts', '/budgets', '/events', '/reports', '/settings'];

/** Phone layout: content, a floating add button and a bottom tab bar. */
export default function MobileLayout({ children }) {
  const { openAdd } = useQuickAdd();
  const { pathname } = useLocation();
  const showFab = pathname === '/' || pathname === '/transactions';
  useBudgetAlerts();

  return (
    <div className="min-h-screen pt-safe-t overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn-primary">Skip to content</a>
      <OfflineBanner className="no-print" />
      <main id="main" className="px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto min-w-0">{children}</main>

      {showFab && <button
        type="button"
        onClick={() => openAdd()}
        aria-label="Add a transaction"
        className="no-print fixed right-4 z-30 grid place-items-center w-14 h-14 rounded-[14px] bg-accent text-accent-ink shadow-lift active:scale-95 transition-transform duration-100"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        <Plus size={26} weight="bold" />
      </button>}

      <nav aria-label="Main" className="no-print fixed inset-x-0 bottom-0 z-30 bg-surface border-t border-line pb-safe-b">
        <ul className="grid grid-cols-5 max-w-2xl mx-auto">
          {TABS.map(({ to, label, Icon, end }) => {
            const moreActive = to === '/more' && MORE_PATHS.some((p) => pathname.startsWith(p));
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 min-h-[64px] text-[11px] font-bold
                    ${isActive || moreActive ? 'text-ink' : 'text-muted'}`}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`grid place-items-center w-14 h-8 rounded-badge transition-colors duration-150 ${isActive || moreActive ? 'bg-accent text-accent-ink' : ''}`}>
                        <Icon size={22} weight={isActive || moreActive ? 'fill' : 'bold'} aria-hidden="true" />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <QuickAddSheet />
      <ToastViewport className="inset-x-4 items-center" style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }} />
      <UpdatePrompt />
    </div>
  );
}
