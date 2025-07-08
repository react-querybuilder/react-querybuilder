import { parseNumber } from './parseNumber';

const emptyObject = {};
const emptyArray = [] as const;

describe('no-ops when parseNumbers is false', () => {
  it.each([[emptyObject], [emptyArray], [''], ['0'], ['1'], ['1abc'], [0]])('%p', v => {
    expect(parseNumber(v)).toBe(v);
    expect(parseNumber(v, { parseNumbers: false })).toBe(v);
  });
});

// Default/strict parser
for (const pn of [true, 'strict'] as const) {
  it(`parses numbers with ${pn === true ? 'default' : pn} parser`, () => {
    expect(parseNumber(emptyObject, { parseNumbers: pn })).toBe(emptyObject);
    expect(parseNumber(emptyArray, { parseNumbers: pn })).toBe(emptyArray);
    expect(parseNumber('', { parseNumbers: pn })).toBe('');
    expect(parseNumber('0', { parseNumbers: pn })).toBe(0);
    expect(parseNumber('1', { parseNumbers: pn })).toBe(1);
    expect(parseNumber('1abc', { parseNumbers: pn })).toBe('1abc');
  });
}

it('parses numbers with native parser', () => {
  expect(parseNumber(emptyObject, { parseNumbers: 'native' })).toBeNaN();
  expect(parseNumber(emptyArray, { parseNumbers: 'native' })).toBeNaN();
  expect(parseNumber('', { parseNumbers: 'native' })).toBeNaN();
  expect(parseNumber('0', { parseNumbers: 'native' })).toBe(0);
  expect(parseNumber('1', { parseNumbers: 'native' })).toBe(1);
  expect(parseNumber('1abc', { parseNumbers: 'native' })).toBe(1);
});

it('parses numbers with enhanced parser', () => {
  expect(parseNumber(emptyObject, { parseNumbers: 'enhanced' })).toBe(emptyObject);
  expect(parseNumber(emptyArray, { parseNumbers: 'enhanced' })).toBe(emptyArray);
  expect(parseNumber('', { parseNumbers: 'enhanced' })).toBe('');
  expect(parseNumber('0', { parseNumbers: 'enhanced' })).toBe(0);
  expect(parseNumber('1', { parseNumbers: 'enhanced' })).toBe(1);
  expect(parseNumber('1abc', { parseNumbers: 'enhanced' })).toBe(1);
});

it('parses numbers as bigints', () => {
  expect(parseNumber('9007199254740991', { parseNumbers: true, bigIntOnOverflow: true })).toBe(
    9_007_199_254_740_991
  );
  expect(parseNumber('9007199254740992', { parseNumbers: true, bigIntOnOverflow: true })).toBe(
    9_007_199_254_740_992n
  );
});
