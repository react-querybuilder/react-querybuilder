import type { RenderHookResult } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import { consoleMocks } from '@rqb-testing';
import type { DndProp, UseReactDnD } from './types';
import { useReactDnD } from './QueryBuilderDnD';

const timeoutWait = 500;

consoleMocks();

beforeEach(() => {
  jest.resetModules();
});

it('returns the react-dnd exports', async () => {
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
  expect(hookResult!.result.current).toHaveProperty('TouchBackend');
  expect(hookResult!.result.current).toHaveProperty('ReactDndBackend');
});

describe('returns the provided backend', () => {
  it('returns the provided HTML5 backend', async () => {
    const existingDnD: DndProp = {
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
    expect(existingDnD).toHaveProperty('ReactDndBackend', existingDnD.HTML5Backend);
  });

  it('returns the provided touch backend', async () => {
    const existingDnD: DndProp = {
      ...(await import('react-dnd')),
      ...(await import('react-dnd-touch-backend')),
    };

    let hookResult: RenderHookResult<UseReactDnD | null, UseReactDnD | undefined>;
    await act(async () => {
      hookResult = renderHook(() => useReactDnD(existingDnD));
      await new Promise(r => setTimeout(r, timeoutWait));
      hookResult.rerender();
      await new Promise(r => setTimeout(r, timeoutWait));
    });
    expect(hookResult!.result.current).toBe(existingDnD);
    expect(existingDnD).toHaveProperty('ReactDndBackend', existingDnD.TouchBackend);
  });
});

it('falls back to touch backend', async () => {
  jest.doMock('react-dnd-html5-backend', () => {
    throw new Error('react-dnd-html5-backend');
  });

  const tBe = await import('react-dnd-touch-backend');

  let hookResult: RenderHookResult<UseReactDnD | null, DndProp | undefined>;
  await act(async () => {
    hookResult = renderHook(() => useReactDnD());
    await new Promise(r => setTimeout(r, timeoutWait));
    hookResult.rerender();
    await new Promise(r => setTimeout(r, timeoutWait));
  });
  expect(hookResult!.result.current).toHaveProperty('ReactDndBackend', tBe.TouchBackend);
});

it('fails gracefully', async () => {
  jest.doMock('react-dnd', () => {
    throw new Error('react-dnd');
  });
  jest.doMock('react-dnd-html5-backend', () => {
    throw new Error('react-dnd-html5-backend');
  });
  jest.doMock('react-dnd-touch-backend', () => {
    throw new Error('react-dnd-touch-backend');
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
