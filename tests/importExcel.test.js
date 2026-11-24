import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseWorkbook, tidyLabel } from '../src/services/importExcel';

const HEADER = ['Date', 'Food', 'Transport', 'Medical', 'Stationary', 'Acedamics', 'Hostel',
  'Workshop/Events', 'Others', 'Income', 'Total Cost', 'Total Expenditure'];

/** Builds a small workbook with the same shape as Expense.xlsx. */
function sampleWorkbook() {
  const wb = XLSX.utils.book_new();
  const jan = XLSX.utils.aoa_to_sheet([
    HEADER,
    [new Date(2025, 0, 1), null, null, null, null, null, null, null, null, null, 0, 0],
    [new Date(2025, 0, 2), 20, null, null, 15, null, null, null, null, 5, 35, 30],
    [new Date(2025, 0, 3), 30, 220, null, null, 200, 5977, 125, 66, 12000, 0, 0],
    [null, 50, 220, 0, 15, 200, 5977, 125, 66, 12005, 0, 0], // totals row
    [],
    [null, null, '75 - tinkerday on sep 13'],
  ], { cellDates: true });
  XLSX.utils.book_append_sheet(wb, jan, 'January25');

  const monthly = XLSX.utils.aoa_to_sheet([['Month', 'Cost'], ['Jan-25', 3231.77]]);
  XLSX.utils.book_append_sheet(wb, monthly, 'Monthly');

  // Collage_Hostel with the same relative layout as the real sheet.
  const rows = [];
  rows[1] = [null, null, null, null, 'Hostel Fees (24500 (Refundable))'];
  rows[2] = [null, null, null, null, 'Month', 'Fee'];
  rows[3] = ['Discription', 'Fees', null, null, 'Advance ', 8000];
  rows[4] = ['Collage Fee', 22750, null, null, new Date(2024, 8, 1), 3406];
  rows[5] = ['KTU 1st Year', null, null, null, 'Total', 11406];
  rows[6] = ['TUITION FEE AIDED', 6300, 12020];
  rows[7] = ['KTU SEM 1 Exam', 2415];
  rows[20] = ['SEM 3', 300];
  rows[21] = ['Total', 31765];
  rows[2][18] = 'Scholorships';
  rows[4][18] = 'Name'; rows[4][19] = 'Amount'; rows[4][20] = 'Date';
  rows[5][18] = 'MCM'; rows[5][19] = 12000; rows[5][20] = new Date(2025, 0, 3);
  rows[6][18] = 'Egrants '; rows[6][19] = 2000; rows[6][20] = new Date(2025, 10, 29);
  rows[7][18] = 'Total'; rows[7][19] = 14000;
  const ch = XLSX.utils.aoa_to_sheet(rows.map((r) => r || []), { cellDates: true });
  XLSX.utils.book_append_sheet(wb, ch, 'Collage_Hostel');

  // Round-trip through a buffer so cells look exactly as they do from a real file.
  return XLSX.read(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }), { type: 'array' });
}

describe('parseWorkbook on a sample workbook', () => {
  const plan = parseWorkbook(sampleWorkbook());

  it('creates one transaction per non-empty category cell with deterministic ids', () => {
    const ids = plan.transactions.map((t) => t.id);
    expect(ids).toContain('2025-01-02_food');
    expect(ids).toContain('2025-01-02_stationery');
    expect(ids).toContain('2025-01-03_workshop-events');
    expect(ids).toContain('2025-01-03_academics');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('maps typo headers and ignores computed columns', () => {
    const cats = new Set(plan.transactions.map((t) => t.category));
    expect(cats.has('Stationery')).toBe(true);
    expect(cats.has('Academics')).toBe(true);
    expect(plan.sheets[0].ignoredHeaders).toEqual(['Total Cost', 'Total Expenditure']);
  });

  it('turns the Income column into income and splits out matching scholarships', () => {
    const sch = plan.transactions.find((t) => t.id === '2025-01-03_income-scholarship');
    expect(sch).toMatchObject({ type: 'income', amount: 12000, source: 'scholarship', note: 'MCM' });
    expect(plan.transactions.find((t) => t.id === '2025-01-03_income')).toBeUndefined();
    expect(plan.totals.income).toBe(12005);
    expect(plan.scholarshipMatches).toBe(1);
  });

  it('uses the totals row only to cross-check, and reports note rows as skipped', () => {
    expect(plan.totals.expense).toBe(20 + 15 + 30 + 220 + 200 + 5977 + 125 + 66);
    expect(plan.sheets[0].mismatches).toEqual([]);
    expect(plan.skipped.some((s) => s.reason.startsWith('Note text'))).toBe(true);
  });

  it('parses fees by year with sections, skips headings and side subtotals', () => {
    expect(plan.fees.map((f) => f.description)).toEqual(['College Fee', 'Tuition Fee Aided', 'KTU SEM 1 Exam', 'SEM 3']);
    expect(plan.fees[1]).toMatchObject({ academicYear: 1, section: 'KTU 1st Year', status: 'paid' });
    expect(plan.fees[2].section).toBeUndefined();
    expect(plan.fees[3].academicYear).toBe(2);
    expect(plan.skipped.some((s) => s.value === '12020')).toBe(true);
  });

  it('parses hostel advance, deposit and monthly fees', () => {
    const kinds = Object.fromEntries(plan.hostel.map((h) => [h.id, [h.kind, h.amount]]));
    expect(kinds).toEqual({
      'stay1-deposit': ['deposit', 24500],
      'stay1-advance': ['advance', 8000],
      'stay1-2024-09': ['monthly', 3406],
    });
  });

  it('cleans scholarship names', () => {
    expect(plan.scholarships.map((s) => s.name)).toEqual(['MCM', 'Egrants']);
    expect(plan.ignoredSheets.map((s) => s.name)).toEqual(['Monthly']);
  });
});

describe('tidyLabel', () => {
  it('softens multi-word capitals but keeps acronyms and names', () => {
    expect(tidyLabel('UNIVERSITY ARTS AND SPORTS FEE')).toBe('University Arts And Sports Fee');
    expect(tidyLabel('WEFI')).toBe('WEFI');
    expect(tidyLabel('Collage Fee')).toBe('College Fee');
  });
});

// Runs only on a machine that has the real workbook next to the project.
const REAL = new URL('../Expense.xlsx', import.meta.url);
describe.skipIf(!existsSync(REAL))('parseWorkbook on Expense.xlsx', () => {
  const plan = parseWorkbook(XLSX.read(readFileSync(REAL), { type: 'buffer' }));

  it('reads all 23 monthly sheets and every block of the fees sheet', () => {
    expect(plan.sheets).toHaveLength(23);
    expect(plan.skipped.filter((s) => s.sheet === 'Sep25').map((s) => s.value)).toEqual(['75 - tinkerday on sep 13', '278 - eyantra sinan kadam']);
    expect(plan.fees.length).toBeGreaterThan(30);
    expect(plan.totals.fees).toBe(69115.62);
    expect(plan.scholarships).toHaveLength(12);
    expect(plan.totals.scholarships).toBe(73217);
    expect(plan.hostel.filter((h) => h.kind === 'deposit').map((h) => h.amount)).toEqual([24500, 14000]);
  });

  it('matches each sheet total row except where the workbook formula range is short', () => {
    for (const s of plan.sheets) {
      for (const m of s.mismatches) expect(m.formula).toBeTruthy();
    }
  });
});
