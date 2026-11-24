import { Compass } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/** Shown for any address the app does not know. */
export default function NotFoundBody() {
  const { pathname } = useLocation();

  // The host answers every path with the app, so tell crawlers this one is a dead end.
  useEffect(() => {
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' });
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="flex flex-col items-center text-center px-6 py-20">
      <span className="grid place-items-center w-16 h-16 rounded-[14px] bg-sunk mb-5"><Compass size={32} weight="bold" aria-hidden="true" /></span>
      <p className="eyebrow">Error 404</p>
      <h1 className="text-[34px] leading-tight mt-1">This page does not exist</h1>
      <p className="text-muted mt-2 max-w-md">Nothing lives at <code className="font-bold text-ink break-all">{pathname}</code>. The link may be old or mistyped.</p>
      <Link to="/" className="btn-primary mt-6">Back to Kharcha</Link>
    </div>
  );
}
