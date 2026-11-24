import { useMemo, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeCollection } from '../services/records.service';
import { liveSource } from './liveStore';

const EMPTY = [];

/** Live array of a small per-user collection (fees, hostel, scholarships...). */
export function useCollection(name) {
  const { user } = useAuth();
  const uid = user?.uid;
  const key = uid ? `col|${uid}|${name}` : null;
  const source = useMemo(
    () => liveSource(key, (onData, onError) => subscribeCollection(uid, name, onData, onError), EMPTY),
    [key, uid, name],
  );
  return useSyncExternalStore(source.subscribe, source.getSnapshot);
}
