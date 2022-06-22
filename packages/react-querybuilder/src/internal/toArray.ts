export const trimIfString = (val: any) => (typeof val === 'string' ? val.trim() : val);

export const toArray = (v: any) =>
  (Array.isArray(v)
    ? v
    : typeof v === 'string'
    ? v.split(',').filter(s => !/^\s*$/.test(s))
    : []
  ).map(trimIfString);
