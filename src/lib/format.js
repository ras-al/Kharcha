/** Money and number formatting for INR in the Indian grouping system (₹1,05,941). */

const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const paise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** ₹1,05,941 for whole rupees, ₹1,003.54 when there are paise. `whole` rounds paise away. */
export function formatINR(value, { signed = false, whole: roundWhole = false } = {}) {
  const n = roundWhole ? Math.round(value || 0) : round2(value || 0);
  const body = Number.isInteger(n) ? whole.format(Math.abs(n)) : paise.format(Math.abs(n));
  if (n < 0) return `−${body}`;
  if (signed && n > 0) return `+${body}`;
  return body;
}

/** ₹1.2L style for chart axes. */
export function formatCompact(value) {
  return compact.format(value || 0);
}

export function formatNumber(value) {
  return plain.format(value || 0);
}

/** "12%" with a sign, for deltas. */
export function formatPct(value, { signed = true } = {}) {
  if (!Number.isFinite(value)) return '–';
  const r = Math.round(value);
  if (r < 0) return `−${Math.abs(r)}%`;
  return `${signed && r > 0 ? '+' : ''}${r}%`;
}
