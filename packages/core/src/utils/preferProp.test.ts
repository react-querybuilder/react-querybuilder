import { queryBuilderFlagDefaults } from '../defaults';
import { objectKeys } from './objectUtils';
import { preferAnyProp, preferFlagProps, preferProp } from './preferProp';

describe('preferProp', () => {
  it('prefers the prop with default true', async () => {
    expect(preferProp(true)).toBe(true);
    expect(preferProp(true, true)).toBe(true);
    expect(preferProp(true, false)).toBe(false);
    expect(preferProp(true, undefined, true)).toBe(true);
    expect(preferProp(true, undefined, false)).toBe(false);
    expect(preferProp(true, true, true)).toBe(true);
    expect(preferProp(true, false, false)).toBe(false);
    expect(preferProp(true, false, true)).toBe(false);
    expect(preferProp(true, true, false)).toBe(true);
  });

  it('prefers the prop with default false', async () => {
    expect(preferProp(false)).toBe(false);
    expect(preferProp(false, true)).toBe(true);
    expect(preferProp(false, false)).toBe(false);
    expect(preferProp(false, undefined, true)).toBe(true);
    expect(preferProp(false, undefined, false)).toBe(false);
    expect(preferProp(false, true, true)).toBe(true);
    expect(preferProp(false, false, false)).toBe(false);
    expect(preferProp(false, false, true)).toBe(false);
    expect(preferProp(false, true, false)).toBe(true);
  });

  it('does not finalize the prop with default true', async () => {
    expect(preferProp(true, undefined, undefined, true)).toBeUndefined();
    expect(preferProp(true, true, undefined, true)).toBe(true);
    expect(preferProp(true, undefined, true, true)).toBe(true);
  });

  it('does not finalize the prop with default false', async () => {
    expect(preferProp(false, undefined, undefined, true)).toBeUndefined();
    expect(preferProp(false, true, undefined, true)).toBe(true);
    expect(preferProp(false, undefined, true, true)).toBe(true);
  });
});

describe('preferAnyProp', () => {
  it('prefers the prop with default undefined', async () => {
    expect(preferAnyProp()).toBeUndefined();
    expect(preferAnyProp(undefined, true)).toBe(true);
    expect(preferAnyProp(undefined, false)).toBe(false);
    expect(preferAnyProp(undefined, undefined, true)).toBe(true);
    expect(preferAnyProp(undefined, undefined, false)).toBe(false);
    expect(preferAnyProp(undefined, true, true)).toBe(true);
    expect(preferAnyProp(undefined, false, false)).toBe(false);
    expect(preferAnyProp(undefined, false, true)).toBe(false);
    expect(preferAnyProp(undefined, true, false)).toBe(true);
  });

  it('prefers the prop with default true', async () => {
    expect(preferAnyProp(true)).toBe(true);
    expect(preferAnyProp(true, true)).toBe(true);
    expect(preferAnyProp(true, false)).toBe(false);
    expect(preferAnyProp(true, undefined, true)).toBe(true);
    expect(preferAnyProp(true, undefined, false)).toBe(false);
    expect(preferAnyProp(true, true, true)).toBe(true);
    expect(preferAnyProp(true, false, false)).toBe(false);
    expect(preferAnyProp(true, false, true)).toBe(false);
    expect(preferAnyProp(true, true, false)).toBe(true);
  });

  it('prefers the prop with default false', async () => {
    expect(preferAnyProp(false)).toBe(false);
    expect(preferAnyProp(false, true)).toBe(true);
    expect(preferAnyProp(false, false)).toBe(false);
    expect(preferAnyProp(false, undefined, true)).toBe(true);
    expect(preferAnyProp(false, undefined, false)).toBe(false);
    expect(preferAnyProp(false, true, true)).toBe(true);
    expect(preferAnyProp(false, false, false)).toBe(false);
    expect(preferAnyProp(false, false, true)).toBe(false);
    expect(preferAnyProp(false, true, false)).toBe(true);
  });
});

describe('preferFlagProps', () => {
  it('prefers the default values', async () => {
    expect(preferFlagProps()).toEqual(
      Object.fromEntries(objectKeys(queryBuilderFlagDefaults).map(k => [k, undefined]))
    );
  });
  it('finalizes with default values', async () => {
    expect(preferFlagProps(undefined, undefined, true)).toEqual(queryBuilderFlagDefaults);
  });
});
