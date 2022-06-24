/**
 * If the value is a string, trims it. Otherwise returns value as-is.
 */
export const trimIfString = (val: any) => (typeof val === 'string' ? val.trim() : val);

/**
 * Splits strings by comma and trims each element; returns arrays as-is.
 */
export const toArray = (v: any) =>
  (Array.isArray(v)
    ? v
    : typeof v === 'string'
    ? v.split(',').filter(s => !/^\s*$/.test(s))
    : []
  ).map(trimIfString);
