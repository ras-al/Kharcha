import { lazy } from 'react';

/**
 * Every page has a mobile and a desktop component. The router renders one
 * or the other based on useIsDesktop(); both are code-split. `title` sets
 * the browser tab title; `public` pages are readable without signing in.
 */
const page = (name) => ({
  mobile: lazy(() => import(`./pages/${name}/${name}.mobile.jsx`)),
  desktop: lazy(() => import(`./pages/${name}/${name}.desktop.jsx`)),
});

export const ROUTES = [
  { path: '/', title: 'Home', ...page('Home') },
  { path: '/transactions', title: 'Transactions', ...page('Transactions') },
  { path: '/stats', title: 'Stats', ...page('Stats') },
  { path: '/fees', title: 'Fees and hostel', ...page('Fees') },
  { path: '/budgets', title: 'Budgets', ...page('Budgets') },
  { path: '/debts', title: 'Debts', ...page('Debts') },
  { path: '/events', title: 'Workshops and events', ...page('Events') },
  { path: '/reports', title: 'Monthly report', ...page('Reports') },
  { path: '/settings', title: 'Settings', ...page('Settings') },
  { path: '/settings/import', title: 'Import from Excel', ...page('Import') },
  { path: '/more', title: 'More', ...page('More') },
  { path: '/privacy', title: 'Privacy policy', public: true, ...page('Privacy') },
  { path: '/terms', title: 'Terms of use', public: true, ...page('Terms') },
];

export const LOGIN = page('Login');
export const NOT_FOUND = page('NotFound');
