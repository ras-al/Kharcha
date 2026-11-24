import { startOfDay } from 'date-fns';
import { round2 } from './format';

/** Normalizes legacy records without `direction` to `'owed'` (money I owe). */
export function debtDirection(debt) {
  return debt?.direction === 'given' ? 'given' : 'owed';
}

/** Formats the note stored on the expense auto-created when an owed debt is completed. */
export function debtExpenseNote(debt) {
  const person = (debt.person || '').trim();
  const note = (debt.note || '').trim();
  if (note && person) return `${note} (paid to ${person})`;
  if (person) return `Debt paid to ${person}`;
  return note || 'Debt settled';
}

/** Builds the expense payload generated when completing an owed debt on `completedDate`. */
export function buildDebtExpense(debt, completedDate = new Date()) {
  return {
    type: 'expense',
    amount: round2(Number(debt.amount)),
    category: debt.category,
    date: startOfDay(completedDate),
    note: debtExpenseNote(debt),
    origin: 'debt',
  };
}

/** Groups pending debts by person (case-insensitive) tracking owed, given, and net. */
export function groupDebtsByPerson(debts) {
  const map = new Map();
  for (const d of debts) {
    if (d.status === 'completed') continue;
    const raw = (d.person || '').trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    const cur = map.get(key) || { key, name: raw, owed: 0, given: 0, net: 0, count: 0 };
    if (debtDirection(d) === 'given') cur.given = round2(cur.given + d.amount);
    else cur.owed = round2(cur.owed + d.amount);
    cur.net = round2(cur.given - cur.owed);
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => Math.max(b.owed, b.given) - Math.max(a.owed, a.given) || a.name.localeCompare(b.name));
}

/** Splits and sorts debt records into pending and completed lists with directional totals. */
export function summarizeDebts(items) {
  const pending = items
    .filter((d) => d.status !== 'completed')
    .sort((a, b) => b.date - a.date || (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const completed = items
    .filter((d) => d.status === 'completed')
    .sort((a, b) => (b.completedDate || b.date) - (a.completedDate || a.date) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  const owedPending = pending.filter((d) => debtDirection(d) === 'owed');
  const givenPending = pending.filter((d) => debtDirection(d) === 'given');
  const owedTotal = round2(owedPending.reduce((s, d) => s + d.amount, 0));
  const givenTotal = round2(givenPending.reduce((s, d) => s + d.amount, 0));
  const netDebt = round2(givenTotal - owedTotal);
  const completedTotal = round2(completed.reduce((s, d) => s + d.amount, 0));
  const byPerson = groupDebtsByPerson(pending);
  const people = [...new Set(items.map((d) => (d.person || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return {
    pending,
    completed,
    owedPending,
    givenPending,
    owedTotal,
    givenTotal,
    netDebt,
    completedTotal,
    byPerson,
    people,
  };
}
