import { motion, useReducedMotion } from 'framer-motion';

const LEVEL_CLASS = { ok: 'bg-income', warn: 'bg-warn', over: 'bg-expense', none: 'bg-muted' };

/** Budget style bar: green below 80%, amber from 80%, red from 100%. */
export default function ProgressBar({ ratio, level = 'ok', label, className = '', height = 10 }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      className={`w-full rounded-[3px] bg-sunk overflow-hidden ${className}`}
      style={{ height }}
    >
      <motion.div
        className={`h-full rounded-[3px] ${LEVEL_CLASS[level]}`}
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  );
}
