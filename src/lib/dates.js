import {
  addMonths, endOfMonth, format, isSameDay, isValid, parse, startOfDay, startOfMonth, subDays,
} from 'date-fns';

/** "2026-11" for a Date. Month keys are how the app addresses a month everywhere. */
export const monthKey = (d) => format(d, 'yyyy-MM');

export const parseMonthKey = (key) => parse(key, 'yyyy-MM', new Date());

/** Inclusive start and exclusive end for a month key. */
export function monthRange(key) {
  const from = startOfMonth(parseMonthKey(key));
  return { from, to: startOfMonth(addMonths(from, 1)) };
}

/** Range covering `count` months ending with (and including) `key`. */
export function trailingMonths(key, count) {
  const end = parseMonthKey(key);
  return { from: startOfMonth(addMonths(end, -(count - 1))), to: startOfMonth(addMonths(end, 1)) };
}

export const shiftMonth = (key, delta) => monthKey(addMonths(parseMonthKey(key), delta));

export function monthKeysBetween(from, to) {
  const keys = [];
  for (let d = startOfMonth(from); d < to; d = addMonths(d, 1)) keys.push(monthKey(d));
  return keys;
}

export const dayKey = (d) => format(d, 'yyyy-MM-dd');
export const monthLabel = (key, pattern = 'MMMM yyyy') => format(parseMonthKey(key), pattern);
export const daysInMonth = (key) => endOfMonth(parseMonthKey(key)).getDate();

/** "Today", "Yesterday" or "Mon, 3 Nov" for list section headers. */
export function dayHeading(d, now = new Date()) {
  if (isSameDay(d, now)) return 'Today';
  if (isSameDay(d, subDays(now, 1))) return 'Yesterday';
  const pattern = d.getFullYear() === now.getFullYear() ? 'EEE, d MMM' : 'EEE, d MMM yyyy';
  return format(d, pattern);
}

/** Value for <input type="date">. */
export const toInputDate = (d) => format(d, 'yyyy-MM-dd');

export function fromInputDate(value) {
  const d = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(d) ? startOfDay(d) : null;
}
