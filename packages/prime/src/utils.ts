/* v8 ignore file -- @preserve */

import { parseNumber } from 'react-querybuilder';

// oxlint-disable-next-line typescript/no-explicit-any
export const toNumberInputValue = (val: number | string): any => {
  if (typeof val === 'number') return val;
  const valParsed = parseNumber(val, { parseNumbers: 'native' });
  if (!Number.isNaN(valParsed)) return valParsed;
  return '';
};

// Format date as YYYY-MM-DD
export const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Format datetime as YYYY-MM-DD HH:mm:ss
export const formatDateTime = (d: Date): string => {
  const date = formatDate(d);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${date} ${h}:${min}:${s}`;
};

// Format time as HH:mm:ss
export const formatTime = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${min}:${s}`;
};

// Parse date or datetime string to Date; handles both space and T separators
export const parseDate = (v: string): Date | null => {
  if (!v) return null;
  const d = new Date(v.includes(' ') ? v.replace(' ', 'T') : v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Parse time string "HH:mm:ss" or "HH:mm" to Date
export const parseTime = (v: string): Date | null => {
  if (!v) return null;
  const parts = v.split(':');
  if (parts.length < 2) return null;
  const d = new Date();
  d.setHours(
    Number.parseInt(parts[0], 10),
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2] ?? '0', 10),
    0
  );
  return Number.isNaN(d.getTime()) ? null : d;
};
