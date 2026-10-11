import { escapeRegexLiteral, regexToStringMatch, unescapeRegexLiteral } from './regexLiteral';

describe('escapeRegexLiteral/unescapeRegexLiteral', () => {
  it('round-trips', () => {
    const s = String.raw`a.b*c+d?e^f$g|h(i)j[k]l{m}n\o-p/q`;
    expect(unescapeRegexLiteral(escapeRegexLiteral(s))).toBe(s);
  });

  it('handles JSONata escapes', () => {
    expect(unescapeRegexLiteral(String.raw`a\x2db\/c\-d`)).toBe('a-b/c-d');
  });

  it('returns null for regex syntax', () => {
    expect(unescapeRegexLiteral('a.b')).toBeNull();
    expect(unescapeRegexLiteral(String.raw`\d`)).toBeNull();
    expect(unescapeRegexLiteral('a\\')).toBeNull();
  });
});

describe('regexToStringMatch', () => {
  it('full-match templates', () => {
    expect(regexToStringMatch('.*a.*', 'full')).toEqual({ operator: 'contains', value: 'a' });
    expect(regexToStringMatch('^a.*', 'full')).toEqual({ operator: 'beginsWith', value: 'a' });
    expect(regexToStringMatch('.*a$', 'full')).toEqual({ operator: 'endsWith', value: 'a' });
    expect(regexToStringMatch('^a$', 'full')).toEqual({ operator: '=', value: 'a' });
    expect(regexToStringMatch('a', 'full')).toEqual({ operator: '=', value: 'a' });
    // Escaped `.` before `*` isn't the `.*` suffix
    expect(regexToStringMatch(String.raw`.*a\.*`, 'full')).toEqual({
      operator: '=',
      value: String.raw`.*a\.*`,
    });
  });

  it('find templates', () => {
    expect(regexToStringMatch('a', 'find')).toEqual({ operator: 'contains', value: 'a' });
    expect(regexToStringMatch('^a', 'find')).toEqual({ operator: 'beginsWith', value: 'a' });
    expect(regexToStringMatch('a$', 'find')).toEqual({ operator: 'endsWith', value: 'a' });
    expect(regexToStringMatch(String.raw`a\$`, 'find')).toEqual({
      operator: 'contains',
      value: 'a$',
    });
  });
});
