/**
 * Cloud Firestore, kept apart from firebase.js so it is only downloaded once
 * someone signs in (every importer of this file is behind the sign-in).
 * Offline-first: reads come from IndexedDB and writes queue until the network returns.
 */
import {
  connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';
import { app, useEmulators } from './firebase';

export const db = app
  ? initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
  : null;

if (db && useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080);
