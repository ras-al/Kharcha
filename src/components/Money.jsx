import { useCountUp } from '../hooks/useCountUp';
import { formatINR } from '../lib/format';

/**
 * Formatted rupee amount. `animate` counts up from the previous value.
 * `tone` colours by meaning: expense red, income green.
 */
export default function Money({ value, animate = false, tone, signed = false, whole = false, className = '' }) {
  const shown = useCountUp(animate ? value : 0);
  const v = animate ? shown : value;
  const color = tone === 'expense' ? 'text-expense' : tone === 'income' ? 'text-income' : '';
  return <span className={`num ${color} ${className}`}>{formatINR(v, { signed, whole })}</span>;
}

/** Signed amount for a transaction row: −₹120 for spending, +₹500 for income. */
export function TxAmount({ tx, className = '' }) {
  const income = tx.type === 'income';
  return (
    <span className={`num font-bold ${income ? 'text-income' : 'text-ink'} ${className}`}>
      {income ? '+' : '−'}{formatINR(tx.amount)}
    </span>
  );
}
