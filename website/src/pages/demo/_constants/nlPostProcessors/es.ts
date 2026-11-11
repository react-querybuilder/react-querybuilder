// Applies `fn` only outside quoted values ('...', with '' as an escaped quote). `fn` also gets
// the next quoted value's content for lookahead, and must preserve the segment's length.
const mapUnquoted = (output: string, fn: (text: string) => string) => {
  const segments = output.split(/('(?:[^']|'')*')/u);
  return segments
    .map((segment, i) =>
      i % 2 ? segment : fn(segment + (segments[i + 1]?.slice(1) ?? '')).slice(0, segment.length)
    )
    .join('');
};

// y → e before /i/, o → u before /o/
export const nlPostProcessor = (output: string): string =>
  mapUnquoted(output, s =>
    s.replace(/ y (?=h?[iíIÍ](?![aeouáéóú]))/gu, ' e ').replace(/ o (?=h?[oóOÓ])/gu, ' u ')
  );
