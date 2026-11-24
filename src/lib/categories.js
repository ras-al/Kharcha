/**
 * The fixed category list. Colours are mid-tones chosen to read on both the
 * light (#F2F4EF) and dark (forest) surfaces. Icons are mapped separately in
 * components/CategoryIcon.jsx so this file stays plain data.
 */
export const CATEGORIES = [
  { id: 'Food', color: '#E39A2B', group: 'daily' },
  { id: 'Transport', color: '#3C8BDC', group: 'daily' },
  { id: 'Medical', color: '#E0524A', group: 'daily' },
  { id: 'Stationery', color: '#9D7BE6', group: 'daily' },
  { id: 'Academics', color: '#27A396', group: 'fixed' },
  { id: 'Hostel', color: '#5FAE32', group: 'fixed' },
  { id: 'Workshop/Events', color: '#E26AA3', group: 'events' },
  { id: 'Others', color: '#8A9488', group: 'daily' },
];

export const INCOME_CATEGORY = 'Income';
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const FIXED_CATEGORIES = new Set(['Hostel', 'Academics']);

export const GROUPS = {
  daily: { label: 'Daily', ids: ['Food', 'Transport', 'Medical', 'Stationery', 'Others'] },
  fixed: { label: 'Fixed', ids: ['Hostel', 'Academics'] },
  events: { label: 'Events', ids: ['Workshop/Events'] },
};

export const INCOME_SOURCES = [
  { id: 'other', label: 'Other' },
  { id: 'scholarship', label: 'Scholarship' },
  { id: 'refund', label: 'Refund' },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export function categoryColor(id) {
  if (id === INCOME_CATEGORY) return 'rgb(var(--income))';
  return byId[id]?.color ?? '#8A9488';
}

export function isCategory(id) {
  return Boolean(byId[id]);
}

/** Short label for tight spaces such as chart axes. */
export function shortLabel(id) {
  return id === 'Workshop/Events' ? 'Events' : id;
}

/** URL- and doc-id-safe slug, e.g. "Workshop/Events" -> "workshop-events". */
export function categorySlug(id) {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
