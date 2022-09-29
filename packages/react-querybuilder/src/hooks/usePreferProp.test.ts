import { renderHook } from '@testing-library/react';
import { usePreferProp } from './usePreferProp';

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
