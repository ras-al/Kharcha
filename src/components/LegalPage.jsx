import { CaretLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LegalLinks from './LegalLinks';
import Logo from './Logo';

export const LEGAL_UPDATED = '25 November 2026';

/**
 * Shell for the privacy policy and terms. Readable whether or not the
 * visitor is signed in, so it can be linked from the sign-in screen.
 */
export default function LegalPage({ title, children, wide = false }) {
  const { user } = useAuth();
  return (
    <div className={user ? 'pt-4' : 'min-h-screen px-5 py-8'}>
      <article className={`mx-auto ${wide ? 'max-w-[760px]' : 'max-w-2xl'}`}>
        {!user && (
          <div className="flex items-center justify-between mb-8">
            <Link to="/" aria-label="Kharcha home"><Logo /></Link>
            <Link to="/" className="inline-flex items-center gap-1 font-bold text-sm min-h-[44px]"><CaretLeft size={16} weight="bold" aria-hidden="true" /> Sign in</Link>
          </div>
        )}
        <h1 className={wide ? 'text-[40px] leading-tight' : 'text-[30px] leading-tight'}>{title}</h1>
        <p className="text-muted font-semibold mt-1">Last updated {LEGAL_UPDATED}</p>
        <div className="card p-6 mt-6 space-y-6 text-[16px] leading-relaxed [&_h2]:text-xl [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
        <LegalLinks className="text-center mt-6 mb-4" />
      </article>
    </div>
  );
}

export function PrivacyContent() {
  return (
    <>
      <section>
        <p>Kharcha is a personal expense tracker. This page explains what it stores about you, where, and how to remove it.</p>
      </section>
      <section>
        <h2>What is stored</h2>
        <ul>
          <li><b>Your account:</b> your email address and, if you sign in with Google, your name and profile photo.</li>
          <li><b>What you enter:</b> expenses, income, notes, budgets, recurring templates, college fees, hostel payments and scholarships.</li>
          <li><b>Display settings:</b> your theme and layout choice.</li>
        </ul>
      </section>
      <section>
        <h2>Where it is stored</h2>
        <p>Data is kept in Google Firebase (Authentication and Cloud Firestore). Database rules allow only your signed-in account to read or change your records. A copy is also cached in your browser so the app works offline.</p>
        <p>The person who runs this copy of Kharcha administers the Firebase project and could technically view the database through the Firebase console. They do not look at your records unless you ask for help.</p>
      </section>
      <section>
        <h2>Excel files</h2>
        <p>When you import a workbook, it is read inside your browser. The file itself is never uploaded. Only the rows you confirm in the preview are saved to your account.</p>
      </section>
      <section>
        <h2>Cookies, analytics and ads</h2>
        <p>Kharcha uses no analytics, no advertising and no tracking cookies. Firebase keeps your sign-in session in your browser's storage. That is needed for the app to work, so there is nothing to opt in or out of.</p>
      </section>
      <section>
        <h2>Sharing</h2>
        <p>Your data is not sold or shared with anyone. Google processes it only to run Firebase.</p>
      </section>
      <section>
        <h2>Your control</h2>
        <ul>
          <li><b>Download:</b> Settings, Your data, Excel workbook or CSV, at any time.</li>
          <li><b>Delete:</b> Settings, Delete account. This removes every record and your sign-in account straight away, and cannot be undone.</li>
        </ul>
      </section>
      <section>
        <h2>Changes</h2>
        <p>If this policy changes, the date at the top changes too. Big changes will be mentioned in the app.</p>
      </section>
    </>
  );
}

export function TermsContent() {
  return (
    <>
      <section>
        <p>Kharcha is a small personal project shared with friends. By creating an account you agree to the points below.</p>
      </section>
      <section>
        <h2>Using Kharcha</h2>
        <ul>
          <li>Use your own account and keep your password to yourself.</li>
          <li>Do not try to read or change anyone else's data, or overload the service.</li>
          <li>You are responsible for the accuracy of what you enter and import.</li>
        </ul>
      </section>
      <section>
        <h2>Not financial advice</h2>
        <p>Totals, forecasts, budgets and observations are calculated from your own entries to help you keep track. They are not financial, tax or legal advice.</p>
      </section>
      <section>
        <h2>No guarantees</h2>
        <p>Kharcha is provided as it is, free of charge, without any warranty. It may have bugs, change, or be switched off. Download a copy of your data from Settings now and then so you always have a backup.</p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>As far as the law allows, the person running Kharcha is not liable for any loss caused by using it, including lost or incorrect data.</p>
      </section>
      <section>
        <h2>Leaving</h2>
        <p>You can stop using Kharcha at any time and delete your account from Settings. Accounts that misuse the service may be removed.</p>
      </section>
      <section>
        <p>Read the <Link to="/privacy">privacy policy</Link> to see what is stored and how to remove it.</p>
      </section>
    </>
  );
}
