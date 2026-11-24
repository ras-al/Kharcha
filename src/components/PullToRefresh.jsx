import { ArrowsClockwise } from '@phosphor-icons/react';
import { useRef, useState } from 'react';

const TRIGGER = 72;

/** Pull down from the top of the page to force a server refresh. */
export default function PullToRefresh({ onRefresh, children }) {
  const start = useRef(null);
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);

  const onTouchStart = (e) => {
    start.current = window.scrollY <= 0 && !busy ? e.touches[0].clientY : null;
  };
  const onTouchMove = (e) => {
    if (start.current === null) return;
    const d = e.touches[0].clientY - start.current;
    setPull(d > 0 ? Math.min(110, d * 0.5) : 0);
  };
  const onTouchEnd = async () => {
    const go = pull >= TRIGGER;
    start.current = null;
    setPull(go ? TRIGGER : 0);
    if (!go) return;
    setBusy(true);
    try { await onRefresh(); } catch { /* offline: the cached list stays */ }
    setBusy(false);
    setPull(0);
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="grid place-items-center overflow-hidden transition-[height] duration-150" style={{ height: pull }} aria-hidden={!busy}>
        <ArrowsClockwise size={24} weight="bold" className={busy ? 'spin' : ''} style={{ transform: busy ? undefined : `rotate(${pull * 3}deg)` }} />
        {busy && <span className="sr-only" role="status">Refreshing</span>}
      </div>
      {children}
    </div>
  );
}
