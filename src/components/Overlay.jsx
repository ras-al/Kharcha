/**
 * Modal surfaces: a bottom sheet for mobile, a centred dialog and a right
 * drawer for desktop. All trap focus, close on Escape and restore focus.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function useModalBehaviour(open, onClose, panelRef) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => [...panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled);
    (panel.querySelector('[data-autofocus]') || focusables()[0])?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose, panelRef]);
}

function Backdrop({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-[#0E0F0C]/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

export function Sheet({ open, onClose, title, children, full = false }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useModalBehaviour(open, onClose, ref);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <Backdrop onClose={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`absolute inset-x-0 bottom-0 bg-surface rounded-t-[14px] shadow-lift flex flex-col ${full ? 'top-safe-t mt-3' : 'max-h-[92vh]'}`}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag={reduce ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onClose(); }}
          >
            <div className="pt-2.5 pb-1 grid place-items-center cursor-grab" aria-hidden="true">
              <span className="w-10 h-1.5 rounded-full bg-line" />
            </div>
            <div className="flex items-center justify-between px-5 pb-1">
              <h2 className="text-xl">{title}</h2>
              <button type="button" className="icon-btn -mr-2" aria-label="Close" onClick={onClose}><X size={22} weight="bold" /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Dialog({ open, onClose, title, children, width = 520 }) {
  const ref = useRef(null);
  useModalBehaviour(open, onClose, ref);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center p-6">
          <Backdrop onClose={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full bg-surface rounded-card shadow-lift p-7 max-h-[90vh] overflow-y-auto"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl">{title}</h2>
              <button type="button" className="icon-btn -mr-2" aria-label="Close" onClick={onClose}><X size={22} weight="bold" /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useModalBehaviour(open, onClose, ref);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <Backdrop onClose={onClose} />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute right-0 top-0 bottom-0 w-[440px] bg-surface shadow-lift flex flex-col"
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 360 }}
          >
            <div className="flex items-center justify-between px-7 pt-6 pb-2">
              <h2 className="text-2xl">{title}</h2>
              <button type="button" className="icon-btn -mr-2" aria-label="Close" onClick={onClose}><X size={22} weight="bold" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-7 pb-7">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Small yes/no confirmation built on Dialog. */
export function Confirm({ open, onClose, onConfirm, title, children, confirmLabel = 'Delete', tone = 'danger' }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} width={420}>
      <div className="text-muted">{children}</div>
      <div className="flex justify-end gap-2 mt-6">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className={tone === 'danger' ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Dialog>
  );
}
