import { isCategory, INCOME_CATEGORY } from './categories';

/**
 * Validates the transaction form. Returns a map of field -> message;
 * an empty object means the input is valid.
 */
export function validateTransaction({ amount, category, date, type, note }) {
  const errors = {};
  const n = Number(amount);
  if (amount === '' || amount == null || Number.isNaN(n)) errors.amount = 'Enter an amount.';
  else if (n <= 0) errors.amount = 'Amount must be more than zero.';
  else if (n >= 1e8) errors.amount = 'That amount is too large.';
  else if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) errors.amount = 'Use at most two decimal places.';

  if (type !== 'expense' && type !== 'income') errors.type = 'Choose expense or income.';
  if (type === 'expense' && !isCategory(category)) errors.category = 'Pick a category.';
  if (type === 'income' && category && category !== INCOME_CATEGORY) errors.category = 'Income has no category.';

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) errors.date = 'Pick a date.';
  if (note && note.length > 500) errors.note = 'Keep the note under 500 characters.';
  return errors;
}

export function validateAmount(amount) {
  const n = Number(amount);
  if (amount === '' || amount == null || Number.isNaN(n)) return 'Enter an amount.';
  if (n <= 0) return 'Amount must be more than zero.';
  return null;
}
