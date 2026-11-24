import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Opens the add/edit form from anywhere (FAB, keyboard shortcut, swipe to
 * edit). Each layout renders its own presentation of the same form.
 */
const QuickAddContext = createContext(null);

export function QuickAddProvider({ children }) {
  const [state, setState] = useState({ open: false, editing: null, preset: null });
  const openAdd = useCallback((preset = null) => setState({ open: true, editing: null, preset }), []);
  const openEdit = useCallback((tx) => setState({ open: true, editing: tx, preset: null }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ ...state, openAdd, openEdit, close }), [state, openAdd, openEdit, close]);
  return <QuickAddContext.Provider value={value}>{children}</QuickAddContext.Provider>;
}

export const useQuickAdd = () => useContext(QuickAddContext);
