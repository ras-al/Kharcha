import { createContext, useContext, useMemo, useState } from 'react';
import { monthKey } from '../lib/dates';

/** The month every dashboard and report is looking at. Shared by both layouts. */
const PeriodContext = createContext(null);

export function PeriodProvider({ children }) {
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const value = useMemo(() => ({ month, setMonth, isCurrent: month === monthKey(new Date()) }), [month]);
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export const usePeriod = () => useContext(PeriodContext);
