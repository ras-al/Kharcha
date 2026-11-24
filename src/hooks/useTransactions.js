import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import { monthRange } from '../lib/dates';
import { refreshRange, subscribeRange } from '../services/transactions.service';
import { liveSource } from './liveStore';

const EMPTY = [];

/**
 * Live transactions for a date range [from, to). Ranges are always bounded
 * so the app never loads the whole history at once.
 */
export function useTransactions(range) {
  const { user } = useAuth();
  const uid = user?.uid;
  const from = range?.from?.getTime();
  const to = range?.to?.getTime();
  const key = uid && from && to ? `tx|${uid}|${from}|${to}` : null;

  const source = useMemo(
    () => liveSource(key, (onData, onError) => subscribeRange(uid, { from: new Date(from), to: new Date(to) }, onData, onError), EMPTY),
    [key, uid, from, to],
  );
  const state = useSyncExternalStore(source.subscribe, source.getSnapshot);

  const refresh = useCallback(
    () => (uid && from ? refreshRange(uid, { from: new Date(from), to: new Date(to) }) : Promise.resolve()),
    [uid, from, to],
  );

  return { ...state, refresh };
}

export function useMonthTransactions(key) {
  const range = useMemo(() => monthRange(key), [key]);
  return useTransactions(range);
}
