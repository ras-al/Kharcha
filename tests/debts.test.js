import { describe, expect, it } from 'vitest';
import { buildDebtExpense, debtDirection, debtExpenseNote, groupDebtsByPerson, summarizeDebts } from '../src/lib/debts';
import { validateDebt } from '../src/lib/validation';

describe('validateDebt', () => {
  it('accepts valid owed and given debt entries', () => {
    expect(validateDebt({
      direction: 'owed',
      person: 'Harun',
      amount: 10,
      category: 'Food',
      date: new Date(2026, 10, 25),
      note: 'Tea',
    })).toEqual({});

    expect(validateDebt({
      direction: 'given',
      person: 'Arjun',
      amount: 50,
      category: null,
      date: new Date(2026, 10, 25),
      note: 'Auto share',
    })).toEqual({});
  });

  it('rejects missing person, invalid amount, or unknown category for owed debts', () => {
    const errors = validateDebt({
      direction: 'owed',
      person: '   ',
      amount: 0,
      category: 'Snacks',
      date: new Date('invalid'),
      note: 'x'.repeat(201),
    });
    expect(errors.person).toBe('Enter who you owe.');
    expect(errors.amount).toBeTruthy();
    expect(errors.category).toBeTruthy();
    expect(errors.date).toBeTruthy();
    expect(errors.note).toBeTruthy();
  });
});

describe('debt completion expense payload', () => {
  it('formats note with friend name and category on the completion date', () => {
    const debt = { direction: 'owed', person: 'Harun', amount: 10, category: 'Food', note: 'Tea' };
    const completedOn = new Date(2026, 10, 28, 15, 45);
    const tx = buildDebtExpense(debt, completedOn);

    expect(tx.type).toBe('expense');
    expect(tx.amount).toBe(10);
    expect(tx.category).toBe('Food');
    expect(tx.origin).toBe('debt');
    expect(tx.note).toBe('Tea (paid to Harun)');
    expect(tx.date.getFullYear()).toBe(2026);
    expect(tx.date.getMonth()).toBe(10);
    expect(tx.date.getDate()).toBe(28);
    expect(tx.date.getHours()).toBe(0);
    expect(tx.date.getMinutes()).toBe(0);
  });

  it('falls back to a clear note when note is empty and defaults legacy debts to owed', () => {
    expect(debtExpenseNote({ person: 'Harun', note: '' })).toBe('Debt paid to Harun');
    expect(debtDirection({})).toBe('owed');
    expect(debtDirection({ direction: 'given' })).toBe('given');
  });
});

describe('groupDebtsByPerson & summarizeDebts', () => {
  it('tracks owed and given debts separately per person and computes net debt', () => {
    const items = [
      { id: '1', direction: 'owed', person: 'Harun', amount: 10, category: 'Food', date: new Date(2026, 10, 24), status: 'pending' },
      { id: '2', direction: 'given', person: 'harun', amount: 50, category: 'Transport', date: new Date(2026, 10, 25), status: 'pending' },
      { id: '3', direction: 'owed', person: 'Arjun', amount: 25, category: 'Food', date: new Date(2026, 10, 23), status: 'pending' },
      { id: '4', direction: 'given', person: 'Arjun', amount: 80, category: 'Others', date: new Date(2026, 10, 22), status: 'completed', completedDate: new Date(2026, 10, 25) },
    ];
    const summary = summarizeDebts(items);
    expect(summary.pending).toHaveLength(3);
    expect(summary.owedPending).toHaveLength(2);
    expect(summary.givenPending).toHaveLength(1);
    expect(summary.completed).toHaveLength(1);
    expect(summary.owedTotal).toBe(35);
    expect(summary.givenTotal).toBe(50);
    expect(summary.netDebt).toBe(15);
    expect(summary.completedTotal).toBe(80);
    expect(groupDebtsByPerson(items)).toEqual([
      { key: 'harun', name: 'Harun', owed: 10, given: 50, net: 40, count: 2 },
      { key: 'arjun', name: 'Arjun', owed: 25, given: 0, net: -25, count: 1 },
    ]);
  });
});
