// Applies `fn` only outside quoted values ('...', with '' as an escaped quote)
const mapUnquoted = (output: string, fn: (segment: string) => string) =>
  output
    .split(/('(?:[^']|'')*')/u)
    .map((segment, i) => (i % 2 ? segment : fn(segment)))
    .join('');

// y → e before /i/, o → u before /o/
export const nlPostProcessor = (output: string): string =>
  mapUnquoted(output, s =>
    s.replace(/ y (?=h?[iíIÍ](?![aeouáéóú]))/gu, ' e ').replace(/ o (?=h?[oóOÓ])/gu, ' u ')
  );
