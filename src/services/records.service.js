/**
 * Everything that is not a transaction: fees, hostel, scholarships,
 * budgets, recurring templates and the profile settings document.
 */
import {
  collection, deleteDoc, doc, onSnapshot, setDoc, Timestamp,
} from 'firebase/firestore';
import { round2 } from '../lib/format';
import { db } from './db';
import { track } from './firebase';

export const RECORD_COLLECTIONS = ['fees', 'hostel', 'scholarships', 'templates', 'budgets', 'debts'];

const col = (uid, name) => collection(db, 'users', uid, name);

const toJs = (data) => Object.fromEntries(
  Object.entries(data).map(([k, v]) => [k, v instanceof Timestamp ? v.toDate() : v]),
);

/** Live listener for a whole (small) collection. */
export function subscribeCollection(uid, name, onData, onError) {
  return onSnapshot(
    col(uid, name),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...toJs(d.data()) }))),
    onError,
  );
}

const toFirestore = (data) => Object.fromEntries(
  Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, v instanceof Date ? Timestamp.fromDate(v) : v]),
);

/** Creates (no id) or replaces (with id) a record. Returns the id. */
export function saveRecord(uid, name, data, id) {
  const ref = id ? doc(col(uid, name), id) : doc(col(uid, name));
  const clean = { ...data };
  if ('amount' in clean) clean.amount = round2(Number(clean.amount));
  track(setDoc(ref, toFirestore(clean)));
  return ref.id;
}

export function deleteRecord(uid, name, id) {
  return track(deleteDoc(doc(col(uid, name), id)));
}

export function setBudget(uid, category, monthlyLimit) {
  const ref = doc(col(uid, 'budgets'), category.replace('/', '|'));
  if (!monthlyLimit) return track(deleteDoc(ref));
  return track(setDoc(ref, { monthlyLimit: round2(Number(monthlyLimit)) }));
}

/** Budget doc ids cannot contain "/", so Workshop/Events is stored as Workshop|Events. */
export const budgetCategory = (docId) => docId.replace('|', '/');

export function subscribeProfile(uid, onData, onError) {
  return onSnapshot(doc(db, 'users', uid, 'settings', 'profile'), (s) => onData(s.exists() ? s.data() : {}), onError);
}

export function saveProfile(uid, patch) {
  return track(setDoc(doc(db, 'users', uid, 'settings', 'profile'), patch, { merge: true }));
}

export const recordRef = (uid, name, id) => doc(col(uid, name), id);
