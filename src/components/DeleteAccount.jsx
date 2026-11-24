import { Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteAccount, usesPassword } from '../services/account.service';
import { authErrorMessage } from '../services/auth.service';
import { Dialog } from './Overlay';

/** Permanently removes every record and the sign-in account. Asks twice. */
export default function DeleteAccount() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const needsPassword = usesPassword(user);

  const close = () => { if (!busy) { setOpen(false); setTyped(''); setPassword(''); setError(null); } };

  async function confirm(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(password);
      // onAuthStateChanged returns the app to the sign-in screen.
    } catch (err) {
      console.error(err);
      setError(err.code?.startsWith('auth/') ? authErrorMessage(err) || 'Sign-in was cancelled.' : 'Could not delete everything. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="btn-secondary text-expense" onClick={() => setOpen(true)}>
        <Trash size={18} weight="bold" aria-hidden="true" /> Delete account
      </button>
      <Dialog open={open} onClose={close} title="Delete your account?" width={460}>
        <form onSubmit={confirm} noValidate className="space-y-4">
          <p className="text-muted">Every transaction, fee, hostel record, scholarship, budget and setting is removed, then your sign-in account. This cannot be undone. Download a copy from Settings first if you might want it.</p>
          <div>
            <label htmlFor="del-confirm" className="field-label">Type DELETE to confirm</label>
            <input id="del-confirm" className="field" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
          </div>
          {needsPassword ? (
            <div>
              <label htmlFor="del-password" className="field-label">Your password</label>
              <input id="del-password" type="password" className="field" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          ) : (
            <p className="text-sm text-muted">Google will ask you to sign in once more.</p>
          )}
          {error && <p role="alert" className="field-error">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={close} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-danger" disabled={busy || typed !== 'DELETE' || (needsPassword && !password)}>
              {busy ? 'Deleting' : 'Delete everything'}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
