import { CircleNotch, GoogleLogo } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  authErrorMessage, resetPassword, signInWithEmail, signInWithGoogle, signUpWithEmail,
} from '../services/auth.service';

/** Google and email sign-in, sign-up and password reset in one form. */
export default function LoginForm() {
  const [mode, setMode] = useState('signin'); // signin | signup | reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  async function run(fn) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await fn();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return setError('Enter your email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('That email address does not look right.');
    if (mode === 'reset') {
      return run(async () => {
        await resetPassword(email);
        setInfo('Check your inbox for a reset link.');
        setMode('signin');
      });
    }
    if (password.length < 6) return setError('Use at least 6 characters for the password.');
    return run(() => (mode === 'signup' ? signUpWithEmail(name, email, password) : signInWithEmail(email, password)));
  }

  return (
    <div>
      <button type="button" className="btn-secondary w-full min-h-[52px]" disabled={busy} onClick={() => run(signInWithGoogle)}>
        <GoogleLogo size={20} weight="bold" aria-hidden="true" /> Continue with Google
      </button>

      <div className="flex items-center gap-3 my-6 text-sm text-muted font-semibold" aria-hidden="true">
        <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="name" className="field-label">Name</label>
            <input id="name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" type="email" className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {mode !== 'reset' && (
          <div>
            <div className="flex justify-between items-baseline">
              <label htmlFor="password" className="field-label">Password</label>
              {mode === 'signin' && (
                <button type="button" className="text-sm font-bold underline underline-offset-2" onClick={() => { setMode('reset'); setError(null); }}>
                  Forgot it?
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              className="field"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        )}

        {error && <p role="alert" className="field-error">{error}</p>}
        {info && <p role="status" className="text-sm font-semibold text-income">{info}</p>}
        {mode === 'signup' && <p className="text-sm text-muted">By creating an account you agree to the terms of use.</p>}

        <button type="submit" className="btn-primary w-full min-h-[52px] text-base" disabled={busy}>
          {busy && <CircleNotch size={20} weight="bold" className="spin" aria-hidden="true" />}
          {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm mt-6">
        {mode === 'signup' ? 'Already have an account?' : mode === 'reset' ? 'Remembered it?' : 'New here?'}{' '}
        <button
          type="button"
          className="font-bold underline underline-offset-2"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
        >
          {mode === 'signin' ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
