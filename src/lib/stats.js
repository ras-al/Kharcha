/**
 * Pure statistics over transaction arrays. Every screen (mobile and desktop)
 * goes through these functions via hooks/useStats.js, so a number shown in
 * two places is always computed the same way.
 *
 * A transaction here is { id, date: Date, amount, type, category, ... }.
 */
import { getDay } from 'date-fns';
import { CATEGORY_IDS, FIXED_CATEGORIES } from './categories';
import { dayKey, daysInMonth, monthKey, monthKeysBetween } from './dates';
import { round2 } from './format';

export const isExpense = (t) => t.type === 'expense';
export const isIncome = (t) => t.type === 'income';
export const isCore = (t) => isExpense(t) && !FIXED_CATEGORIES.has(t.category);

const sum = (list) => round2(list.reduce((acc, t) => acc + t.amount, 0));

/** Totals for any slice of transactions. */
export function summarize(txs) {
  const byCategory = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
  let expense = 0;
  let income = 0;
  for (const t of txs) {
    if (isExpense(t)) {
      expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    } else {
      income += t.amount;
    }
  }
  for (const k of Object.keys(byCategory)) byCategory[k] = round2(byCategory[k]);
  const fixed = round2(byCategory.Hostel + byCategory.Academics);
  expense = round2(expense);
  income = round2(income);
  return {
    expense,
    income,
    net: round2(income - expense),
    fixed,
    // "Core spending" replaces the workbook's "Except Hostel & Academics".
    core: round2(expense - fixed),
    // The old Monthly sheet also subtracted income; kept so numbers can be checked against it.
    coreNet: round2(expense - fixed - income),
    byCategory,
    count: txs.length,
  };
}

/** Category slices sorted largest first, without empty categories. */
export function categoryBreakdown(byCategory) {
  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
  return Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .map(([id, value]) => ({ id, value, share: total ? value / total : 0 }))
    .sort((a, b) => b.value - a.value);
}

/** One row per month in [from, to), including empty months. */
export function monthlySeries(txs, from, to) {
  const buckets = new Map(monthKeysBetween(from, to).map((k) => [k, []]));
  for (const t of txs) buckets.get(monthKey(t.date))?.push(t);
  return [...buckets.entries()].map(([key, list]) => ({ key, ...summarize(list) }));
}

/** Map of "yyyy-MM-dd" -> total spend that day. */
export function dailyTotals(txs, { coreOnly = false } = {}) {
  const map = new Map();
  for (const t of txs) {
    if (!isExpense(t) || (coreOnly && !isCore(t))) continue;
    const k = dayKey(t.date);
    map.set(k, round2((map.get(k) || 0) + t.amount));
  }
  return map;
}

export function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Median core spend over days that had any core spending. Fixed costs
 * (hostel, academics) are left out because they are large by nature and
 * would otherwise flag every rent payment.
 */
export function medianDailySpend(txs) {
  return round2(median([...dailyTotals(txs, { coreOnly: true }).values()]));
}

export const LARGE_MULTIPLIER = 3;

export function isLargeExpense(t, medianDaily) {
  return isCore(t) && medianDaily > 0 && t.amount > LARGE_MULTIPLIER * medianDaily;
}

/** Biggest expenses first. */
export function topExpenses(txs, n = 5) {
  return txs.filter(isExpense).sort((a, b) => b.amount - a.amount).slice(0, n);
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Average core spend per weekday across the date range. Days with no
 * spending count as zero, so a weekday is not favoured just by being rare.
 */
export function weekdayPattern(txs, from, to) {
  const totals = Array(7).fill(0);
  const occurrences = Array(7).fill(0);
  const end = to > new Date() ? new Date() : to;
  for (let d = new Date(from); d < end; d.setDate(d.getDate() + 1)) occurrences[getDay(d)] += 1;
  for (const t of txs) if (isCore(t)) totals[getDay(t.date)] += t.amount;
  // Start the week on Monday for display.
  return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
    day: WEEKDAYS[i],
    short: WEEKDAYS[i].slice(0, 3),
    average: occurrences[i] ? round2(totals[i] / occurrences[i]) : 0,
  }));
}

/**
 * Month-end projection. Core spend is extrapolated from the daily pace so
 * far; fixed costs already paid are added as they are (they do not repeat).
 */
export function forecastMonth(txs, key, today = new Date()) {
  const total = daysInMonth(key);
  const isCurrent = monthKey(today) === key;
  const elapsed = isCurrent ? today.getDate() : total;
  const s = summarize(txs);
  const pace = elapsed ? s.core / elapsed : 0;
  const projectedCore = round2(pace * total);
  return {
    isCurrent,
    elapsed,
    total,
    pace: round2(pace),
    projectedCore,
    projectedTotal: round2(projectedCore + s.fixed),
    soFar: s.expense,
  };
}

/** Per-category comparison of two summaries. */
export function compareSummaries(a, b) {
  return CATEGORY_IDS.map((id) => {
    const va = a.byCategory[id] || 0;
    const vb = b.byCategory[id] || 0;
    return { id, a: va, b: vb, diff: round2(va - vb), pct: vb ? ((va - vb) / vb) * 100 : null };
  }).filter((r) => r.a || r.b);
}

/**
 * Plain-language observations. Each insight has a stable id so the UI can key
 * on it. Thresholds keep noise out (tiny bases make huge percentages).
 */
export function buildInsights({ current, previous, window, windowFrom, windowTo }) {
  const out = [];
  const cur = summarize(current);
  const prev = summarize(previous);

  const moves = compareSummaries(cur, prev)
    .filter((r) => !FIXED_CATEGORIES.has(r.id) && r.b >= 200 && r.pct !== null && Math.abs(r.pct) >= 15)
    .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));
  if (moves[0]) {
    const m = moves[0];
    const word = m.pct > 0 ? 'more' : 'less';
    out.push({
      id: `move-${m.id}`,
      tone: m.pct > 0 ? 'up' : 'down',
      text: `You spent ${Math.abs(Math.round(m.pct))}% ${word} on ${m.id} than last month.`,
    });
  }

  if (window.length) {
    const pattern = weekdayPattern(window, windowFrom, windowTo);
    const top = [...pattern].sort((a, b) => b.average - a.average)[0];
    if (top?.average > 0) {
      out.push({ id: 'weekday', tone: 'neutral', text: `${top.day}s are your highest-spend day.` });
    }
  }

  if (prev.core > 0 && cur.core > 0) {
    const pct = ((cur.core - prev.core) / prev.core) * 100;
    if (Math.abs(pct) >= 10) {
      out.push({
        id: 'core',
        tone: pct > 0 ? 'up' : 'down',
        text: `Core spending is ${Math.abs(Math.round(pct))}% ${pct > 0 ? 'higher' : 'lower'} than last month so far.`,
      });
    }
  }
  return out;
}

/** Budget status for one category: ok below 80%, warn from 80%, over from 100%. */
export function budgetStatus(spent, limit) {
  if (!limit) return { ratio: 0, level: 'none' };
  const ratio = spent / limit;
  return { ratio, level: ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warn' : 'ok' };
}

/** Which threshold, if any, an added amount pushed a category across. */
export function crossedThreshold(before, after, limit) {
  if (!limit) return null;
  if (before < limit && after >= limit) return 100;
  if (before < 0.8 * limit && after >= 0.8 * limit) return 80;
  return null;
}
