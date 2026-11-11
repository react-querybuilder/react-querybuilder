const digitBatchim: Record<string, 'none' | 'rieul' | 'other'> = {
  '0': 'other',
  '1': 'rieul',
  '2': 'none',
  '3': 'other',
  '4': 'none',
  '5': 'none',
  '6': 'other',
  '7': 'rieul',
  '8': 'rieul',
  '9': 'none',
};

// Final consonant (batchim) of a character's Korean reading: 'none' | 'rieul' (ㄹ) | 'other'.
// Null when unknown (e.g. multi-letter Latin words, whose pronunciation is ambiguous).
const getBatchim = (text: string): 'none' | 'rieul' | 'other' | null => {
  const t = text.replace(/[\s'")\]]+$/u, '');
  const ch = t.at(-1);
  if (!ch) return null;
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    return jong === 0 ? 'none' : jong === 8 ? 'rieul' : 'other';
  }
  // Digit readings: 영 일 이 삼 사 오 육 칠 팔 구 (multi-digit ending in 0 → 십/백/천/만)
  const digit = digitBatchim[ch];
  if (digit) return digit;
  if (/[a-z]/i.test(ch) && !/[a-z]/i.test(t.at(-2) ?? '')) {
    // Single letter, read by its name (엘, 엠, 엔, 알, ...)
    return /[lr]/i.test(ch) ? 'rieul' : /[mn]/i.test(ch) ? 'other' : 'none';
  }
  return null;
};

// Resolves dual-form Korean particles (이(가), 을(를), 과(와), (으)로) against the preceding word.
// Unresolvable ones keep the dual form, per Korean UI convention. Quoted values are left as-is.
export const nlPostProcessor = (output: string): string => {
  const segments = output.split(/('(?:[^']|'')*')/u);
  let prefix = '';
  return segments
    .map((segment, i) => {
      const resolved =
        i % 2
          ? segment
          : segment.replace(
              /\s*(이\(가\)|을\(를\)|과\(와\)|\(으\)로)/gu,
              (_m, particle: string, offset: number) => {
                const b = getBatchim(prefix + segment.slice(0, offset));
                if (b === null) return particle;
                const hasFinal = b !== 'none';
                switch (particle) {
                  case '이(가)':
                    return hasFinal ? '이' : '가';
                  case '을(를)':
                    return hasFinal ? '을' : '를';
                  case '과(와)':
                    return hasFinal ? '과' : '와';
                  default:
                    return b === 'other' ? '으로' : '로';
                }
              }
            );
      prefix += segment;
      return resolved;
    })
    .join('');
};
