import {
  Bank, CaretDown, ChartDonut, Gear, MagnifyingGlass, Moon, Plus, Printer, SidebarSimple, SignOut, SquaresFour,
  Sun, Table, Target, Ticket,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import MonthSwitcher from '../components/MonthSwitcher';
import OfflineBanner from '../components/OfflineBanner';
import { Dialog } from '../components/Overlay';
import QuickAddCard from '../components/quickadd/QuickAddCard';
import UpdatePrompt from '../components/UpdatePrompt';
import { useAuth } from '../context/AuthContext';
import { usePeriod } from '../context/PeriodContext';
import { useQuickAdd } from '../context/QuickAddContext';
import { usePreferences } from '../context/ThemeContext';
import { ToastViewport } from '../context/ToastContext';
import { useBudgetAlerts } from '../hooks/useBudgetAlerts';
import { useShortcuts } from '../hooks/useShortcuts';
import { signOut } from '../services/auth.service';

const NAV = [
  { to: '/', label: 'Dashboard', Icon: SquaresFour, end: true, key: 'G D' },
  { to: '/transactions', label: 'Transactions', Icon: Table, key: 'G T' },
  { to: '/stats', label: 'Stats', Icon: ChartDonut, key: 'G S' },
  { to: '/budgets', label: 'Budgets', Icon: Target, key: 'G B' },
  { to: '/fees', label: 'Fees and hostel', Icon: Bank, key: 'G F' },
  { to: '/events', label: 'Events', Icon: Ticket },
  { to: '/reports', label: 'Reports', Icon: Printer, key: 'G R' },
  { to: '/settings', label: 'Settings', Icon: Gear },
];

const COLLAPSE_KEY = 'kharcha.sidebar';

/** Laptop layout: collapsible sidebar, top bar, wide content area. */
export default function DesktopLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const searchRef = useRef(null);
  const quick = useQuickAdd();
  useBudgetAlerts();
  useShortcuts({ focusSearch: useCallback(() => searchRef.current?.focus(), []) });

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      return !c;
    });
  };

  return (
    <div className="min-h-screen flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn-primary">Skip to content</a>
      <aside className={`no-print sticky top-0 h-screen shrink-0 flex flex-col border-r border-line bg-surface transition-[width] duration-200 ${collapsed ? 'w-[84px]' : 'w-[256px]'}`}>
        <div className={`flex items-center h-[76px] ${collapsed ? 'justify-center' : 'px-6'}`}>
          <Logo compact={collapsed} />
        </div>
        <div className={collapsed ? 'px-3' : 'px-4'}>
          <button type="button" onClick={() => quick.openAdd()} className={`btn-primary w-full ${collapsed ? 'px-0' : ''}`} aria-label="Add a transaction (N)">
            <Plus size={20} weight="bold" aria-hidden="true" />{!collapsed && <span>Add</span>}
            {!collapsed && <kbd className="ml-auto text-xs font-bold bg-accent-ink/10 rounded-md px-1.5">N</kbd>}
          </button>
        </div>
        <nav aria-label="Main" className="flex-1 overflow-y-auto mt-4">
          <ul className={`space-y-1 ${collapsed ? 'px-3' : 'px-4'}`}>
            {NAV.map(({ to, label, Icon, end, key }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => `flex items-center gap-3 rounded-control min-h-[44px] font-bold text-[15px] transition-colors duration-150
                    ${collapsed ? 'justify-center' : 'px-4'} ${isActive ? 'bg-forest text-lime dark:bg-lime dark:text-forest' : 'text-ink hover:bg-sunk'}`}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={22} weight={isActive ? 'fill' : 'bold'} aria-hidden="true" />
                      {collapsed ? <span className="sr-only">{label}</span> : <span className="flex-1">{label}</span>}
                      {!collapsed && key && <span className={`text-[11px] font-semibold ${isActive ? 'opacity-70' : 'text-muted'}`} aria-hidden="true">{key}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={`py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
          <button type="button" onClick={toggle} className={`btn-ghost w-full ${collapsed ? 'px-0' : 'justify-start'}`} aria-expanded={!collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <SidebarSimple size={20} weight="bold" aria-hidden="true" />{!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar searchRef={searchRef} />
        <OfflineBanner className="no-print" />
        <main id="main" className="flex-1 px-10 py-8 w-full max-w-[1440px] mx-auto">{children}</main>
      </div>

      <Dialog open={quick.open} onClose={quick.close} title={quick.editing ? 'Edit transaction' : 'Add a transaction'} width={560}>
        {quick.open && <QuickAddCard key={quick.editing?.id || 'new'} editing={quick.editing} preset={quick.preset} onDone={quick.close} idPrefix="dialog" autoFocus bare />}
      </Dialog>
      <ToastViewport className="left-8 bottom-8" />
      <UpdatePrompt />
    </div>
  );
}

function TopBar({ searchRef }) {
  const { month, setMonth } = usePeriod();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');

  // Keep the box in sync when the transactions page changes the query itself.
  useEffect(() => { if (pathname === '/transactions') setQ(params.get('q') || ''); }, [params, pathname]);

  const submit = (value) => navigate(value ? `/transactions?q=${encodeURIComponent(value)}` : '/transactions');

  return (
    <header className="no-print sticky top-0 z-20 bg-bg border-b border-line">
      <div className="flex items-center gap-4 h-[76px] px-10 max-w-[1440px] mx-auto">
        <form role="search" className="flex-1 max-w-[520px]" onSubmit={(e) => { e.preventDefault(); submit(q.trim()); }}>
          <label htmlFor="global-search" className="sr-only">Search notes</label>
          <div className="relative">
            <MagnifyingGlass size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="global-search"
              ref={searchRef}
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (pathname === '/transactions') navigate(`/transactions?q=${encodeURIComponent(e.target.value)}`, { replace: true });
              }}
              placeholder="Search notes and categories"
              className="field pl-12 pr-12 bg-surface"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted border border-line rounded-md px-1.5" aria-hidden="true">/</kbd>
          </div>
        </form>
        <MonthSwitcher value={month} onChange={setMonth} className="ml-auto" />
        <ProfileMenu />
      </div>
    </header>
  );
}

function ProfileMenu() {
  const { user } = useAuth();
  const { resolved, setTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const name = user.displayName || user.email?.split('@')[0] || 'You';

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="flex items-center gap-2 rounded-control pl-1 pr-3 min-h-[44px] hover:bg-sunk" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Avatar user={user} />
        <span className="font-bold text-sm max-w-[120px] truncate">{name}</span>
        <CaretDown size={14} weight="bold" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 card p-2 shadow-lift z-30">
          <div className="px-3 py-2">
            <p className="font-bold truncate">{name}</p>
            <p className="text-sm text-muted truncate">{user.email}</p>
          </div>
          <button role="menuitem" type="button" className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-badge hover:bg-sunk font-semibold" onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}>
            {resolved === 'dark' ? <Sun size={20} weight="bold" aria-hidden="true" /> : <Moon size={20} weight="bold" aria-hidden="true" />}
            {resolved === 'dark' ? 'Light theme' : 'Dark theme'}
          </button>
          <NavLink role="menuitem" to="/settings" onClick={() => setOpen(false)} className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-badge hover:bg-sunk font-semibold">
            <Gear size={20} weight="bold" aria-hidden="true" /> Settings
          </NavLink>
          <button role="menuitem" type="button" className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-badge hover:bg-sunk font-semibold text-expense" onClick={signOut}>
            <SignOut size={20} weight="bold" aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Avatar({ user, size = 36 }) {
  const initial = (user.displayName || user.email || '?').trim()[0].toUpperCase();
  if (user.photoURL) return <img src={user.photoURL} alt="" width={size} height={size} className="rounded-full" referrerPolicy="no-referrer" />;
  return <span className="grid place-items-center rounded-full bg-accent text-accent-ink font-extrabold" style={{ width: size, height: size }} aria-hidden="true">{initial}</span>;
}
