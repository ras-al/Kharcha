/**
 * Toasts for confirmations, undo and errors. Announced through an
 * aria-live region. Each layout renders <ToastViewport/> where it fits
 * (above the tab bar on mobile, bottom-left on desktop).
 */
import { AnimatePresence, motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onWriteError } from '../services/firebase';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback((message, { tone = 'neutral', action, duration = action ? 6000 : 3500 } = {}) => {
    const id = nextId++;
    setToasts((list) => [...list.slice(-2), { id, message, tone, action }]);
    timers.current.set(id, setTimeout(() => dismiss(id), duration));
    return id;
  }, [dismiss]);

  useEffect(() => onWriteError((err) => {
    const denied = err?.code === 'permission-denied';
    toast(denied ? 'That change was rejected by the server. Check the values and try again.' : 'Could not save a change. It will retry when you are back online.', { tone: 'error' });
  }), [toast]);

  const value = useMemo(() => ({ toast, dismiss, toasts }), [toast, dismiss, toasts]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext).toast;

export function ToastViewport({ className = '', style }) {
  const { toasts, dismiss } = useContext(ToastContext);
  return (
    <div aria-live="polite" role="status" style={style} className={`pointer-events-none fixed z-50 flex flex-col gap-2 ${className}`}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-center gap-3 rounded-control pl-5 pr-2 py-2 min-h-[56px] shadow-lift max-w-[420px]
              ${t.tone === 'error' ? 'bg-expense text-on-expense' : 'bg-accent text-accent-ink'}`}
          >
            <p className="flex-1 text-[15px] font-semibold">{t.message}</p>
            {t.action && (
              <button
                type="button"
                className="rounded-badge px-4 min-h-[40px] font-bold text-accent-ink underline underline-offset-2 hover:bg-accent-ink/10"
                onClick={() => { t.action.onClick(); dismiss(t.id); }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" aria-label="Dismiss" className="rounded-badge w-10 h-10 grid place-items-center hover:bg-accent-ink/10" onClick={() => dismiss(t.id)}>
              <X size={18} weight="bold" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
