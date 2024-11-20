export const isISOStringDateOnly = (
  date: unknown
): date is `${number}${number}${number}${number}-${number}${number}-${number}${number}` =>
  typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
