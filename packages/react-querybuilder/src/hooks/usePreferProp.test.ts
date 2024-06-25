import { usePreferAnyProp, usePreferProp } from './usePreferProp';

describe('usePreferProp', () => {
  it('prefers the prop with default true', async () => {
    expect(usePreferProp(true)).toBe(true);
    expect(usePreferProp(true, true)).toBe(true);
    expect(usePreferProp(true, false)).toBe(false);
    expect(usePreferProp(true, undefined, true)).toBe(true);
    expect(usePreferProp(true, undefined, false)).toBe(false);
    expect(usePreferProp(true, true, true)).toBe(true);
    expect(usePreferProp(true, false, false)).toBe(false);
    expect(usePreferProp(true, false, true)).toBe(false);
    expect(usePreferProp(true, true, false)).toBe(true);
  });

  it('prefers the prop with default false', async () => {
    expect(usePreferProp(false)).toBe(false);
    expect(usePreferProp(false, true)).toBe(true);
    expect(usePreferProp(false, false)).toBe(false);
    expect(usePreferProp(false, undefined, true)).toBe(true);
    expect(usePreferProp(false, undefined, false)).toBe(false);
    expect(usePreferProp(false, true, true)).toBe(true);
    expect(usePreferProp(false, false, false)).toBe(false);
    expect(usePreferProp(false, false, true)).toBe(false);
    expect(usePreferProp(false, true, false)).toBe(true);
  });
});

describe('usePreferAnyProp', () => {
  it('prefers the prop with default undefined', async () => {
    expect(usePreferAnyProp(undefined)).toBeUndefined();
    expect(usePreferAnyProp(undefined, true)).toBe(true);
    expect(usePreferAnyProp(undefined, false)).toBe(false);
    expect(usePreferAnyProp(undefined, undefined, true)).toBe(true);
    expect(usePreferAnyProp(undefined, undefined, false)).toBe(false);
    expect(usePreferAnyProp(undefined, true, true)).toBe(true);
    expect(usePreferAnyProp(undefined, false, false)).toBe(false);
    expect(usePreferAnyProp(undefined, false, true)).toBe(false);
    expect(usePreferAnyProp(undefined, true, false)).toBe(true);
  });

  it('prefers the prop with default true', async () => {
    expect(usePreferAnyProp(true)).toBe(true);
    expect(usePreferAnyProp(true, true)).toBe(true);
    expect(usePreferAnyProp(true, false)).toBe(false);
    expect(usePreferAnyProp(true, undefined, true)).toBe(true);
    expect(usePreferAnyProp(true, undefined, false)).toBe(false);
    expect(usePreferAnyProp(true, true, true)).toBe(true);
    expect(usePreferAnyProp(true, false, false)).toBe(false);
    expect(usePreferAnyProp(true, false, true)).toBe(false);
    expect(usePreferAnyProp(true, true, false)).toBe(true);
  });

  it('prefers the prop with default false', async () => {
    expect(usePreferAnyProp(false)).toBe(false);
    expect(usePreferAnyProp(false, true)).toBe(true);
    expect(usePreferAnyProp(false, false)).toBe(false);
    expect(usePreferAnyProp(false, undefined, true)).toBe(true);
    expect(usePreferAnyProp(false, undefined, false)).toBe(false);
    expect(usePreferAnyProp(false, true, true)).toBe(true);
    expect(usePreferAnyProp(false, false, false)).toBe(false);
    expect(usePreferAnyProp(false, false, true)).toBe(false);
    expect(usePreferAnyProp(false, true, false)).toBe(true);
  });
});
