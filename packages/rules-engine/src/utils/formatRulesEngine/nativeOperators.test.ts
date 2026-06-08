import { getFactValue, inRange, nativeOperators } from './nativeOperators';

// NOTE: This file is a `.test.ts` and therefore runs under BOTH `bun test` and Vitest. It must not
// use `vi`/Vitest-only globals.

describe('nativeOperators', () => {
  const op = (name: string) => nativeOperators[name];

  it('= / !=', () => {
    expect(op('=')('a', 'a')).toBe(true);
    expect(op('=')('a', 'b')).toBe(false);
    expect(op('!=')('a', 'b')).toBe(true);
    expect(op('!=')('a', 'a')).toBe(false);
  });

  it('< / <= / > / >=', () => {
    expect(op('<')(1, 2)).toBe(true);
    expect(op('<')(2, 1)).toBe(false);
    expect(op('<=')(2, 2)).toBe(true);
    expect(op('<=')(3, 2)).toBe(false);
    expect(op('>')(2, 1)).toBe(true);
    expect(op('>')(1, 2)).toBe(false);
    expect(op('>=')(2, 2)).toBe(true);
    expect(op('>=')(1, 2)).toBe(false);
  });

  it('contains / doesNotContain', () => {
    expect(op('contains')('foobar', 'oob')).toBe(true);
    expect(op('contains')('foobar', 'xyz')).toBe(false);
    expect(op('doesNotContain')('foobar', 'xyz')).toBe(true);
    expect(op('doesNotContain')('foobar', 'oob')).toBe(false);
  });

  it('beginsWith / doesNotBeginWith', () => {
    expect(op('beginsWith')('foobar', 'foo')).toBe(true);
    expect(op('beginsWith')('foobar', 'bar')).toBe(false);
    expect(op('doesNotBeginWith')('foobar', 'bar')).toBe(true);
    expect(op('doesNotBeginWith')('foobar', 'foo')).toBe(false);
  });

  it('endsWith / doesNotEndWith', () => {
    expect(op('endsWith')('foobar', 'bar')).toBe(true);
    expect(op('endsWith')('foobar', 'foo')).toBe(false);
    expect(op('doesNotEndWith')('foobar', 'foo')).toBe(true);
    expect(op('doesNotEndWith')('foobar', 'bar')).toBe(false);
  });

  it('null / notNull', () => {
    expect(op('null')(null, undefined)).toBe(true);
    expect(op('null')(undefined, undefined)).toBe(true);
    expect(op('null')(0, undefined)).toBe(false);
    expect(op('notNull')(0, undefined)).toBe(true);
    expect(op('notNull')(null, undefined)).toBe(false);
    expect(op('notNull')(undefined, undefined)).toBe(false);
  });

  it('in / notIn (strict and loose membership)', () => {
    expect(op('in')('a', ['a', 'b'])).toBe(true); // strict
    expect(op('in')(1, ['1', '2'])).toBe(true); // loose (stringified)
    expect(op('in')('c', ['a', 'b'])).toBe(false);
    expect(op('notIn')('c', ['a', 'b'])).toBe(true);
    expect(op('notIn')('a', ['a', 'b'])).toBe(false);
  });

  it('between / notBetween', () => {
    expect(op('between')(5, [1, 10])).toBe(true);
    expect(op('between')(15, [1, 10])).toBe(false);
    expect(op('notBetween')(15, [1, 10])).toBe(true);
    expect(op('notBetween')(5, [1, 10])).toBe(false);
  });

  it('returns false for unknown operators (none registered)', () => {
    expect(nativeOperators['noSuchOperator']).toBeUndefined();
  });
});

describe('inRange', () => {
  it('numeric bounds supplied out of order are reordered ascending', () => {
    expect(inRange(5, [10, 1])).toBe(true);
    expect(inRange(15, [10, 1])).toBe(false);
  });

  it('comma-separated string bounds', () => {
    expect(inRange(5, '1,10')).toBe(true);
    expect(inRange(11, '1,10')).toBe(false);
  });

  it('non-numeric bounds compare lexicographically in given order', () => {
    expect(inRange('m', ['a', 'z'])).toBe(true);
    expect(inRange('A', ['a', 'z'])).toBe(false); // 'A' < 'a'
  });

  it('fewer than two bounds → null', () => {
    expect(inRange(5, [1])).toBeNull();
    expect(inRange(5, '5')).toBeNull();
  });

  it('invalid (empty-string) bounds → null', () => {
    expect(inRange(5, ',10')).toBeNull(); // first bound empty
    expect(inRange(5, '1,')).toBeNull(); // second bound empty
  });
});

describe('getFactValue', () => {
  it('an exact key match wins, even for keys containing dots', () => {
    expect(getFactValue({ 'profile.age': 42 }, 'profile.age')).toBe(42);
  });

  it('traverses a dot-separated path into nested objects', () => {
    expect(getFactValue({ profile: { age: 7 } }, 'profile.age')).toBe(7);
  });

  it('returns undefined when an intermediate segment is not an object', () => {
    expect(getFactValue({ profile: 5 }, 'profile.age')).toBeUndefined();
  });

  it('returns undefined for a missing top-level key', () => {
    expect(getFactValue({}, 'missing')).toBeUndefined();
  });

  it('returns undefined when facts is null', () => {
    expect(getFactValue(null, 'anything')).toBeUndefined();
  });

  it('returns undefined when facts is not an object', () => {
    expect(getFactValue('not-an-object', 'anything')).toBeUndefined();
  });
});
