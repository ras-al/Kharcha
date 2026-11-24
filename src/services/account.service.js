/**
 * Deletes everything a user owns, then the sign-in account itself.
 * Firebase requires a recent sign-in to delete an account, so the caller
 * re-authenticates first (password or Google popup).
 */
import {
  deleteUser, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup,
} from 'firebase/auth';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from './db';
import { auth } from './firebase';
import { RECORD_COLLECTIONS } from './records.service';
import { commitInBatches } from './transactions.service';

const COLLECTIONS = ['transactions', ...RECORD_COLLECTIONS, 'settings'];

export const usesPassword = (user) => user.providerData.some((p) => p.providerId === 'password');

export function reauthenticate(user, password) {
  if (usesPassword(user)) {
    return reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  }
  return reauthenticateWithPopup(user, new GoogleAuthProvider());
}

/** Removes every document under users/{uid}. Reports progress as (done, total). */
export async function deleteAllData(uid, onProgress) {
  const refs = [];
  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, 'users', uid, name));
    snap.forEach((d) => refs.push(doc(db, 'users', uid, name, d.id)));
  }
  await commitInBatches(refs, (batch, ref) => batch.delete(ref), onProgress);
  return refs.length;
}

export async function deleteAccount(password) {
  const user = auth.currentUser;
  await reauthenticate(user, password);
  await deleteAllData(user.uid);
  await deleteUser(user);
}
