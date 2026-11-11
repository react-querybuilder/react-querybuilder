// Applies `fn` only outside quoted values ('...', with '' as an escaped quote)
const mapUnquoted = (output: string, fn: (segment: string) => string) =>
  output
    .split(/('(?:[^']|'')*')/u)
    .map((segment, i) => (i % 2 ? segment : fn(segment)))
    .join('');

// Drops spaces around 以上 and before ではない
export const nlPostProcessor = (output: string): string =>
  mapUnquoted(output, s => s.replace(/ ?以上 ?/gu, '以上').replace(/\) ではない/gu, ')ではない'));
