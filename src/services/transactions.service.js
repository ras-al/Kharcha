/**
 * Transactions live at users/{uid}/transactions/{id}. Dates are stored as
 * Timestamps at local midnight; the app always queries by date range.
 */
import { startOfDay } from 'date-fns';
import {
  collection, deleteDoc, doc, getDocs, getDocsFromServer, onSnapshot, orderBy, query, serverTimestamp,
  setDoc, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { INCOME_CATEGORY } from '../lib/categories';
import { round2 } from '../lib/format';
import { db } from './db';
import { track } from './firebase';

export const BATCH_LIMIT = 400;

const txCol = (uid) => collection(db, 'users', uid, 'transactions');

/** Firestore document -> plain object with JS Dates. */
export function fromDoc(snap) {
  const d = snap.data();
  return {
    id: snap.id,
    ...d,
    date: d.date.toDate(),
    createdAt: d.createdAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
    pending: snap.metadata.hasPendingWrites,
  };
}

/** Form/app object -> the exact shape the security rules accept. */
export function toDoc(tx) {
  const isIncome = tx.type === 'income';
  const out = {
    date: Timestamp.fromDate(startOfDay(tx.date)),
    amount: round2(Number(tx.amount)),
    type: isIncome ? 'income' : 'expense',
    category: isIncome ? INCOME_CATEGORY : tx.category,
    note: (tx.note || '').trim(),
    tags: tx.tags || [],
    origin: tx.origin || 'manual',
  };
  if (isIncome) out.source = tx.source || 'other';
  if (!isIncome && tx.category === 'Workshop/Events') out.reimbursement = tx.reimbursement || 'none';
  return out;
}

function rangeQuery(uid, { from, to }) {
  return query(
    txCol(uid),
    where('date', '>=', Timestamp.fromDate(from)),
    where('date', '<', Timestamp.fromDate(to)),
    orderBy('date', 'desc'),
  );
}

/** Live listener for a date range. Returns the unsubscribe function. */
export function subscribeRange(uid, range, onData, onError) {
  return onSnapshot(
    rangeQuery(uid, range),
    { includeMetadataChanges: true },
    (snap) => onData(snap.docs.map(fromDoc), { fromCache: snap.metadata.fromCache }),
    onError,
  );
}

/** Forces a round trip to the server (pull to refresh). */
export async function refreshRange(uid, range) {
  const snap = await getDocsFromServer(rangeQuery(uid, range));
  return snap.docs.map(fromDoc);
}

/** One-off read (export). Uses the cache when offline. */
export async function fetchRange(uid, range) {
  const snap = await getDocs(rangeQuery(uid, range));
  return snap.docs.map(fromDoc);
}

/** Creates a transaction and returns its id immediately (works offline). */
export function addTransaction(uid, tx) {
  const ref = doc(txCol(uid));
  track(setDoc(ref, { ...toDoc(tx), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  return ref.id;
}

export function updateTransaction(uid, id, tx) {
  return track(updateDoc(doc(txCol(uid), id), { ...toDoc(tx), updatedAt: serverTimestamp() }));
}

/** Partial update for single fields such as reimbursement status. */
export function patchTransaction(uid, id, patch) {
  return track(updateDoc(doc(txCol(uid), id), { ...patch, updatedAt: serverTimestamp() }));
}

export function deleteTransaction(uid, id) {
  return track(deleteDoc(doc(txCol(uid), id)));
}

/** Puts a deleted transaction back under its old id (used by Undo). */
export function restoreTransaction(uid, tx) {
  return track(setDoc(doc(txCol(uid), tx.id), {
    ...toDoc(tx),
    createdAt: tx.createdAt ? Timestamp.fromDate(tx.createdAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

/** Runs `apply(batch, item)` over items in batches of BATCH_LIMIT, reporting progress. */
export async function commitInBatches(items, apply, onProgress) {
  let done = 0;
  for (let i = 0; i < items.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + BATCH_LIMIT);
    chunk.forEach((item) => apply(batch, item));
    await batch.commit();
    done += chunk.length;
    onProgress?.(done, items.length);
  }
}

export function bulkDelete(uid, txs) {
  return track(commitInBatches(txs, (b, t) => b.delete(doc(txCol(uid), t.id))));
}

export function bulkRestore(uid, txs) {
  return track(commitInBatches(txs, (b, t) => b.set(doc(txCol(uid), t.id), {
    ...toDoc(t),
    createdAt: t.createdAt ? Timestamp.fromDate(t.createdAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  })));
}

/** Moves expenses to another category. Income rows are left alone. */
export function bulkRecategorize(uid, txs, category) {
  const expenses = txs.filter((t) => t.type === 'expense');
  // A full set (not merge) so a stale reimbursement field is dropped when leaving Workshop/Events.
  return track(commitInBatches(expenses, (b, t) => b.set(doc(txCol(uid), t.id), {
    ...toDoc({ ...t, category }),
    createdAt: t.createdAt ? Timestamp.fromDate(t.createdAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  })));
}

export const transactionRef = (uid, id) => doc(txCol(uid), id);
