import { act, renderHook, type RenderHookResult } from '@testing-library/react';
import type { UseReactDnD } from '../../types';
import { useReactDnD } from './useReactDnD';

const timeoutWait = 500;

jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  jest.resetModules();
});

it('works', async () => {
  let hookResult: RenderHookResult<UseReactDnD | null, UseReactDnD | undefined>;
  await act(async () => {
    hookResult = renderHook(() => useReactDnD());
    await new Promise(r => setTimeout(r, timeoutWait));
    hookResult.rerender();
    await new Promise(r => setTimeout(r, timeoutWait));
  });
  expect(hookResult!.result.current).toHaveProperty('useDrag');
  expect(hookResult!.result.current).toHaveProperty('useDrop');
  expect(hookResult!.result.current).toHaveProperty('HTML5Backend');
});

it('returns the provided DnD', async () => {
  const existingDnD = {
    ...(await import('react-dnd')),
    ...(await import('react-dnd-html5-backend')),
  };

  let hookResult: RenderHookResult<UseReactDnD | null, UseReactDnD | undefined>;
  await act(async () => {
    hookResult = renderHook(() => useReactDnD(existingDnD));
    await new Promise(r => setTimeout(r, timeoutWait));
    hookResult.rerender();
    await new Promise(r => setTimeout(r, timeoutWait));
  });
  expect(hookResult!.result.current).toBe(existingDnD);
});

it('fails gracefully', async () => {
  jest.doMock('react-dnd', () => {
    throw new Error('react-dnd');
  });
  jest.doMock('react-dnd-html5-backend', () => {
    throw new Error('react-dnd-html5-backend');
  });

  let hookResult: RenderHookResult<UseReactDnD | null, UseReactDnD | undefined>;
  await act(async () => {
    hookResult = renderHook(() => useReactDnD());
    await new Promise(r => setTimeout(r, timeoutWait));
    hookResult.rerender();
    await new Promise(r => setTimeout(r, timeoutWait));
  });
  expect(hookResult!.result.current).toBeNull();
});
