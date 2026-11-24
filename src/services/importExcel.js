/**
 * Expense.xlsx importer. Parsing is pure (workbook in, plan out) so it can be
 * previewed before anything is written, and unit-tested without Firebase.
 *
 * Monthly sheets: any sheet whose A1 is "Date". Every numeric cell in a
 * category column becomes one transaction; the Income column becomes an
 * income transaction. Computed columns and the totals row are ignored, but
 * the totals row is used to cross-check the parsed sums.
 *
 * Fees/hostel sheet ("Collage_Hostel"): three blocks found by their header
 * text rather than fixed cell addresses, so moving a block does not break it.
 */
import * as XLSX from 'xlsx';
import { doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { categorySlug, INCOME_CATEGORY } from '../lib/categories';
import { dayKey } from '../lib/dates';
import { round2 } from '../lib/format';
import { db } from './db';
import { commitInBatches } from './transactions.service';

/* ---------- header and label normalisation ---------- */

// Workbook header -> app category. Typos from the workbook are mapped here.
const COLUMN_MAP = {
  food: 'Food',
  transport: 'Transport',
  medical: 'Medical',
  stationary: 'Stationery',
  stationery: 'Stationery',
  acedamics: 'Academics',
  academics: 'Academics',
  hostel: 'Hostel',
  'workshop/events': 'Workshop/Events',
  workshops: 'Workshop/Events',
  events: 'Workshop/Events',
  others: 'Others',
  other: 'Others',
  income: INCOME_CATEGORY,
};

const norm = (v) => String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

const ACRONYMS = new Set(['KTU', 'PD', 'MOOC', 'GATE', 'CD', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']);

/** "TUITION FEE AIDED" -> "Tuition Fee Aided"; fixes the "Collage" typo. */
export function tidyLabel(raw) {
  let s = String(raw).trim().replace(/\s+/g, ' ').replace(/\bcollage\b/gi, 'College');
  // Only multi-word shouting is softened; single words like "WEFI" or "GATE" are names.
  if (s.includes(' ') && s === s.toUpperCase() && /[A-Z]{4,}/.test(s)) {
    s = s.split(' ').map((w) => (ACRONYMS.has(w) ? w : w.charAt(0) + w.slice(1).toLowerCase())).join(' ');
  }
  return s;
}

/* ---------- cell helpers ---------- */

const cellAt = (sheet, r, c) => sheet[XLSX.utils.encode_cell({ r, c })];
const addr = (r, c) => XLSX.utils.encode_cell({ r, c });

function excelDate(cell) {
  if (!cell) return null;
  if (cell.v instanceof Date) return new Date(cell.v.getFullYear(), cell.v.getMonth(), cell.v.getDate());
  if (cell.t === 'n' && cell.v > 20000 && cell.v < 80000) {
    const p = XLSX.SSF.parse_date_code(cell.v);
    return p ? new Date(p.y, p.m - 1, p.d) : null;
  }
  if (cell.t === 's') {
    const m = cell.v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // M/D/YYYY, as Excel shows it
    if (m) {
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      return new Date(y, Number(m[1]) - 1, Number(m[2]));
    }
  }
  return null;
}

const isNum = (cell) => cell && cell.t === 'n' && Number.isFinite(cell.v);
const isText = (cell) => cell && cell.t === 's' && cell.v.trim() !== '';

function findCells(sheet, test) {
  const out = [];
  for (const key of Object.keys(sheet)) {
    if (key[0] === '!') continue;
    const cell = sheet[key];
    if (isText(cell) && test(norm(cell.v))) out.push({ ...XLSX.utils.decode_cell(key), cell });
  }
  return out.sort((a, b) => a.r - b.r || a.c - b.c);
}

/* ---------- monthly sheets ---------- */

function parseMonthlySheet(name, sheet, ctx) {
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const columns = []; // { c, category }
  const ignoredHeaders = [];
  for (let c = 1; c <= range.e.c; c++) {
    const h = cellAt(sheet, 0, c);
    if (!isText(h)) continue;
    const category = COLUMN_MAP[norm(h.v)];
    if (category) columns.push({ c, category, header: h.v.trim() });
    else ignoredHeaders.push(h.v.trim());
  }

  const report = {
    name, rows: 0, transactions: 0, expense: 0, income: 0, mismatches: [], ignoredHeaders, firstDate: null,
  };
  const colSums = Object.fromEntries(columns.map((col) => [col.c, 0]));

  for (let r = 1; r <= range.e.r; r++) {
    const a = cellAt(sheet, r, 0);
    const date = excelDate(a);

    if (!date) {
      const values = columns.map((col) => ({ col, cell: cellAt(sheet, r, col.c) })).filter((x) => isNum(x.cell));
      // Free text anywhere on an undated row (notes typed under the table) is reported, not imported.
      const notes = [];
      for (let c = 0; c <= range.e.c; c++) {
        const cell = cellAt(sheet, r, c);
        if (isText(cell)) notes.push({ sheet: name, cell: addr(r, c), value: cell.v.trim(), reason: 'Note text, not a dated row' });
      }
      if (notes.length) {
        ctx.skipped.push(...notes);
      } else if (values.length && !a) {
        // Totals row: compare against our own column sums.
        for (const { col, cell } of values) {
          const ours = round2(colSums[col.c]);
          if (Math.abs(ours - round2(cell.v)) > 0.009) {
            report.mismatches.push({ column: col.category, sheetTotal: round2(cell.v), rowSum: ours, cell: addr(r, col.c), formula: cell.f || null });
          }
        }
        ctx.totalsRows += 1;
      }
      continue;
    }

    report.rows += 1;
    if (!report.firstDate) report.firstDate = date;
    const day = dayKey(date);

    for (const col of columns) {
      const cell = cellAt(sheet, r, col.c);
      if (!cell || cell.v === '' || cell.v == null) continue;
      if (!isNum(cell)) {
        ctx.skipped.push({ sheet: name, cell: addr(r, col.c), value: String(cell.v), reason: 'Not a number' });
        continue;
      }
      if (cell.v === 0) continue;
      if (cell.v < 0) {
        ctx.skipped.push({ sheet: name, cell: addr(r, col.c), value: String(cell.v), reason: 'Negative amount' });
        continue;
      }
      const amount = round2(cell.v);
      colSums[col.c] += amount;
      const isIncome = col.category === INCOME_CATEGORY;
      const id = `${day}_${isIncome ? 'income' : categorySlug(col.category)}`;
      const existing = ctx.transactions.get(id);
      if (existing) {
        // Same day and category on two sheets: keep one transaction with the combined amount.
        existing.amount = round2(existing.amount + amount);
        ctx.warnings.push(`${day} ${col.category} appears twice (${existing.sheet} and ${name}); amounts were added together.`);
      } else {
        ctx.transactions.set(id, {
          id, date, amount, sheet: name,
          type: isIncome ? 'income' : 'expense',
          category: col.category,
          ...(isIncome ? { source: 'other' } : {}),
          ...(col.category === 'Workshop/Events' ? { reimbursement: 'none' } : {}),
        });
      }
      report.transactions += 1;
      if (isIncome) report.income += amount;
      else report.expense += amount;
    }
  }
  report.expense = round2(report.expense);
  report.income = round2(report.income);
  return report;
}

/* ---------- fees / hostel / scholarships sheet ---------- */

const DEFAULT_YEAR_ROWS = { 1: [5, 20], 2: [21, 33], 3: [34, 45] }; // 1-based rows, from the brief

/** Reads "1st Year | =SUM(B5:B20)" rows so year ranges follow the workbook if rows move. */
function yearRanges(sheet) {
  const found = {};
  for (const { r, c, cell } of findCells(sheet, (t) => /^[1-4](st|nd|rd|th) year$/.test(t))) {
    const year = Number(cell.v.trim()[0]);
    const f = cellAt(sheet, r, c + 1)?.f;
    const m = f && f.match(/SUM\(\$?[A-Z]+\$?(\d+):\$?[A-Z]+\$?(\d+)\)/i);
    if (m) found[year] = [Number(m[1]), Number(m[2])];
  }
  return Object.keys(found).length ? found : DEFAULT_YEAR_ROWS;
}

function parseFees(name, sheet, ctx) {
  const header = findCells(sheet, (t) => t === 'discription' || t === 'description')[0];
  if (!header) {
    ctx.warnings.push(`${name}: no "Description" header found, so no college fees were imported.`);
    return;
  }
  const descCol = header.c;
  let amountCol = descCol + 1;
  for (let c = descCol + 1; c <= descCol + 3; c++) {
    if (/^fees?$/.test(norm(cellAt(sheet, header.r, c)?.v))) { amountCol = c; break; }
  }
  const years = yearRanges(sheet);
  const yearOf = (row1) => Number(Object.keys(years).find((y) => row1 >= years[y][0] && row1 <= years[y][1])) || null;

  let section = null;
  const lastRow = XLSX.utils.decode_range(sheet['!ref']).e.r;
  for (let r = header.r + 1; r <= lastRow; r++) {
    const d = cellAt(sheet, r, descCol);
    const amt = cellAt(sheet, r, amountCol);
    if (!d && !amt) continue;
    const label = isText(d) ? d.v.trim() : '';
    if (/^total$/i.test(label)) break;

    // Stray subtotals typed next to the table (e.g. 12020 beside a block).
    const side = cellAt(sheet, r, amountCol + 1);
    if (isNum(side)) ctx.skipped.push({ sheet: name, cell: addr(r, amountCol + 1), value: String(side.v), reason: 'Subtotal beside the fee table' });

    if (label && !isNum(amt)) {
      // A heading row such as "KTU 1st Year". Following ALL-CAPS rows belong to it.
      section = tidyLabel(label);
      continue;
    }
    if (!isNum(amt) || amt.v <= 0) continue;
    if (section && label !== label.toUpperCase()) section = null;

    const row1 = r + 1;
    const year = yearOf(row1);
    if (!year) {
      ctx.skipped.push({ sheet: name, cell: addr(r, descCol), value: label, reason: 'Row is outside every year range' });
      continue;
    }
    ctx.fees.push({
      id: `y${year}-r${row1}`,
      academicYear: year,
      description: tidyLabel(label || 'Fee'),
      ...(section ? { section } : {}),
      amount: round2(amt.v),
      status: 'paid',
      paidDate: null,
      order: row1,
    });
  }
}

function parseHostel(name, sheet, ctx) {
  const titles = findCells(sheet, (t) => /^hostel fees?\b/.test(t));
  titles.forEach(({ r, c, cell }, index) => {
    const stay = index + 1;
    const title = cell.v.trim();
    const label = `Hostel ${stay}`;
    const depositAmount = Number((title.match(/(\d[\d,]{2,})/) || [])[1]?.replace(/,/g, ''));
    if (depositAmount > 0) {
      ctx.hostel.push({
        id: `stay${stay}-deposit`, stay, label, kind: 'deposit', month: null, amount: depositAmount,
        refundable: /refundable|cd\b|caution/i.test(title),
      });
    }

    // Header row ("Month | Fee") is within a few rows of the title.
    let headerRow = -1;
    for (let rr = r + 1; rr <= r + 3; rr++) if (norm(cellAt(sheet, rr, c)?.v) === 'month') { headerRow = rr; break; }
    if (headerRow < 0) {
      ctx.warnings.push(`${name}: "${title}" has no Month/Fee header, so its rows were skipped.`);
      return;
    }
    for (let rr = headerRow + 1; rr < headerRow + 100; rr++) {
      const m = cellAt(sheet, rr, c);
      const fee = cellAt(sheet, rr, c + 1);
      if (!m) break;
      if (/^total$/i.test(String(m.v).trim())) break;
      if (!isNum(fee) || fee.v <= 0) continue;
      if (isText(m) && /advance/i.test(m.v)) {
        ctx.hostel.push({ id: `stay${stay}-advance`, stay, label, kind: 'advance', month: null, amount: round2(fee.v) });
        continue;
      }
      const date = excelDate(m);
      if (!date) {
        ctx.skipped.push({ sheet: name, cell: addr(rr, c), value: String(m.v), reason: 'Hostel row without a month' });
        continue;
      }
      const month = dayKey(date).slice(0, 7);
      const id = `stay${stay}-${month}`;
      const existing = ctx.hostel.find((h) => h.id === id);
      if (existing) existing.amount = round2(existing.amount + fee.v);
      else ctx.hostel.push({ id, stay, label, kind: 'monthly', month, amount: round2(fee.v) });
    }
  });
}

function parseScholarships(name, sheet, ctx) {
  const header = findCells(sheet, (t) => t === 'name').find(({ r, c }) => norm(cellAt(sheet, r, c + 1)?.v) === 'amount');
  if (!header) return;
  const used = new Set();
  for (let r = header.r + 1; r < header.r + 200; r++) {
    const n = cellAt(sheet, r, header.c);
    if (!isText(n)) break;
    if (/^total$/i.test(n.v.trim())) break;
    const amt = cellAt(sheet, r, header.c + 1);
    const date = excelDate(cellAt(sheet, r, header.c + 2));
    if (!isNum(amt) || amt.v <= 0 || !date) {
      ctx.skipped.push({ sheet: name, cell: addr(r, header.c), value: n.v.trim(), reason: 'Scholarship row missing amount or date' });
      continue;
    }
    const nameClean = tidyLabel(n.v);
    let id = `${dayKey(date)}_${categorySlug(nameClean)}`;
    for (let k = 2; used.has(id); k++) id = `${dayKey(date)}_${categorySlug(nameClean)}-${k}`;
    used.add(id);
    ctx.scholarships.push({ id, name: nameClean, amount: round2(amt.v), date });
  }
}

/**
 * Scholarships are also in the monthly Income column. When an income entry
 * falls on the same day as a scholarship and covers its amount, split that
 * part out as source "scholarship" so income can be broken down by source.
 */
function tagScholarshipIncome(ctx) {
  let matched = 0;
  for (const s of ctx.scholarships) {
    const day = dayKey(s.date);
    const base = ctx.transactions.get(`${day}_income`);
    if (!base || base.amount + 0.005 < s.amount) continue;
    const id = `${day}_income-scholarship`;
    const existing = ctx.transactions.get(id);
    if (existing) {
      existing.amount = round2(existing.amount + s.amount);
      existing.note = `${existing.note}, ${s.name}`;
    } else {
      ctx.transactions.set(id, { ...base, id, amount: s.amount, source: 'scholarship', note: s.name });
    }
    base.amount = round2(base.amount - s.amount);
    if (base.amount <= 0) ctx.transactions.delete(base.id);
    matched += 1;
  }
  return matched;
}

/* ---------- public API ---------- */

/** Parses a SheetJS workbook into an import plan. Nothing is written. */
export function parseWorkbook(wb) {
  const ctx = { transactions: new Map(), fees: [], hostel: [], scholarships: [], skipped: [], warnings: [], totalsRows: 0 };
  const sheets = [];
  const ignoredSheets = [];

  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet['!ref']) continue;
    if (norm(cellAt(sheet, 0, 0)?.v) === 'date') {
      sheets.push(parseMonthlySheet(name, sheet, ctx));
    } else if (findCells(sheet, (t) => t === 'discription' || t === 'description' || /^hostel fees?\b/.test(t)).length) {
      parseFees(name, sheet, ctx);
      parseHostel(name, sheet, ctx);
      parseScholarships(name, sheet, ctx);
    } else {
      ignoredSheets.push({ name, reason: /monthly/i.test(name) ? 'Summary sheet. Kharcha computes this itself.' : 'Not a recognised layout' });
    }
  }

  const scholarshipMatches = tagScholarshipIncome(ctx);
  const transactions = [...ctx.transactions.values()].sort((a, b) => a.date - b.date);
  const expense = round2(transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  const income = round2(transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0));

  return {
    sheets,
    ignoredSheets,
    transactions,
    fees: ctx.fees,
    hostel: ctx.hostel,
    scholarships: ctx.scholarships,
    skipped: ctx.skipped,
    warnings: ctx.warnings,
    scholarshipMatches,
    totals: {
      expense,
      income,
      transactions: transactions.length,
      fees: round2(ctx.fees.reduce((s, f) => s + f.amount, 0)),
      hostel: round2(ctx.hostel.filter((h) => h.kind !== 'deposit').reduce((s, h) => s + h.amount, 0)),
      scholarships: round2(ctx.scholarships.reduce((s, x) => s + x.amount, 0)),
    },
  };
}

/** Reads an uploaded File into a plan. */
export async function parseFile(file) {
  const buf = await file.arrayBuffer();
  return parseWorkbook(XLSX.read(buf, { type: 'array' }));
}

/**
 * Writes a plan with deterministic ids, so importing the same file twice
 * updates the same documents instead of duplicating them. Notes, tags and
 * reimbursement status that were edited in the app are kept (merge).
 */
export async function writeImport(uid, plan, onProgress) {
  const userDoc = (name, id) => doc(db, 'users', uid, name, id);
  const ops = [
    ...plan.transactions.map((t) => ({ ref: userDoc('transactions', t.id), data: txData(t) })),
    ...plan.fees.map(({ id, ...f }) => ({ ref: userDoc('fees', id), data: f })),
    ...plan.hostel.map(({ id, ...h }) => ({ ref: userDoc('hostel', id), data: h })),
    ...plan.scholarships.map(({ id, ...s }) => ({ ref: userDoc('scholarships', id), data: { ...s, date: Timestamp.fromDate(s.date) } })),
  ];
  await commitInBatches(ops, (batch, op) => batch.set(op.ref, op.data, { merge: true }), onProgress);
  return ops.length;
}

function txData(t) {
  const data = {
    date: Timestamp.fromDate(t.date),
    amount: t.amount,
    type: t.type,
    category: t.category,
    origin: 'import',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (t.source) data.source = t.source;
  if (t.note) data.note = t.note;
  return data;
}
