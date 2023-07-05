import { renderHook } from '@testing-library/react';
import { usePreferAnyProp, usePreferProp } from './usePreferProp';

describe('usePreferProp', () => {
  it('prefers the prop with default true', async () => {
    expect(renderHook(() => usePreferProp(true)).result.current).toBe(true);
    expect(renderHook(() => usePreferProp(true, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferProp(true, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(true, undefined, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferProp(true, undefined, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(true, true, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferProp(true, false, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(true, false, true)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(true, true, false)).result.current).toBe(true);
  });

  it('prefers the prop with default false', async () => {
    expect(renderHook(() => usePreferProp(false)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(false, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferProp(false, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(false, undefined, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferProp(false, undefined, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(false, true, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferProp(false, false, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(false, false, true)).result.current).toBe(false);
    expect(renderHook(() => usePreferProp(false, true, false)).result.current).toBe(true);
  });
});

describe('usePreferAnyProp', () => {
  it('prefers the prop with default undefined', async () => {
    expect(renderHook(() => usePreferAnyProp(undefined)).result.current).toBeUndefined();
    expect(renderHook(() => usePreferAnyProp(undefined, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(undefined, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(undefined, undefined, true)).result.current).toBe(
      true
    );
    expect(renderHook(() => usePreferAnyProp(undefined, undefined, false)).result.current).toBe(
      false
    );
    expect(renderHook(() => usePreferAnyProp(undefined, true, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(undefined, false, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(undefined, false, true)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(undefined, true, false)).result.current).toBe(true);
  });

  it('prefers the prop with default true', async () => {
    expect(renderHook(() => usePreferAnyProp(true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(true, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(true, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(true, undefined, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(true, undefined, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(true, true, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(true, false, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(true, false, true)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(true, true, false)).result.current).toBe(true);
  });

  it('prefers the prop with default false', async () => {
    expect(renderHook(() => usePreferAnyProp(false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(false, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(false, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(false, undefined, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(false, undefined, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(false, true, true)).result.current).toBe(true);
    expect(renderHook(() => usePreferAnyProp(false, false, false)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(false, false, true)).result.current).toBe(false);
    expect(renderHook(() => usePreferAnyProp(false, true, false)).result.current).toBe(true);
  });
});
