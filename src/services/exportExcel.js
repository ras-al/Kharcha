/**
 * Excel and CSV export. Builds a clean workbook (one row per transaction plus
 * fees, hostel and scholarship sheets) rather than recreating the old layout.
 */
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { monthKey } from '../lib/dates';
import { summarize } from '../lib/stats';

const txRow = (t) => ({
  Date: format(t.date, 'yyyy-MM-dd'),
  Type: t.type === 'income' ? 'Income' : 'Expense',
  Category: t.type === 'income' ? '' : t.category,
  Amount: t.amount,
  Note: t.note || '',
  Source: t.source || '',
  Reimbursement: t.reimbursement && t.reimbursement !== 'none' ? t.reimbursement : '',
});

function monthlyRows(transactions) {
  const byMonth = new Map();
  for (const t of transactions) {
    const k = monthKey(t.date);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(t);
  }
  return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, list]) => {
    const s = summarize(list);
    return { Month: k, ...s.byCategory, 'Total spent': s.expense, Income: s.income, 'Core spending': s.core, Net: s.net };
  });
}

export function buildWorkbook({ transactions, fees = [], hostel = [], scholarships = [] }) {
  const wb = XLSX.utils.book_new();
  const sorted = [...transactions].sort((a, b) => a.date - b.date);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sorted.map(txRow)), 'Transactions');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyRows(sorted)), 'Monthly');
  if (fees.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fees.map((f) => ({
      Year: f.academicYear, Section: f.section || '', Description: f.description, Amount: f.amount, Status: f.status,
      'Paid on': f.paidDate ? format(f.paidDate, 'yyyy-MM-dd') : '',
    }))), 'College fees');
  }
  if (hostel.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hostel.map((h) => ({
      Hostel: h.label || `Hostel ${h.stay}`, Kind: h.kind, Month: h.month || '', Amount: h.amount, Refundable: h.refundable ? 'yes' : '',
    }))), 'Hostel');
  }
  if (scholarships.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scholarships.map((s) => ({
      Name: s.name, Amount: s.amount, Date: format(s.date, 'yyyy-MM-dd'),
    }))), 'Scholarships');
  }
  return wb;
}

export function downloadWorkbook(data, filename = `kharcha-${format(new Date(), 'yyyy-MM-dd')}.xlsx`) {
  XLSX.writeFile(buildWorkbook(data), filename);
}

/** CSV of transactions only; used by the transactions table export too. */
export function downloadCsv(transactions, filename = `kharcha-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`) {
  const sheet = XLSX.utils.json_to_sheet([...transactions].sort((a, b) => a.date - b.date).map(txRow));
  const csv = XLSX.utils.sheet_to_csv(sheet);
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTransactionsXlsx(transactions, filename) {
  downloadWorkbook({ transactions }, filename);
}
