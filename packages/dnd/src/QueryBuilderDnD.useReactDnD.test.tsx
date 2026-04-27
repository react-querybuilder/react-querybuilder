import { consoleMocks, waitABeat } from '@rqb-testing';
import type { RenderHookResult } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import { useReactDnD } from './QueryBuilderDnD';
import type { DndProp, UseReactDnD } from './types';

const timeoutWait = 1000;

consoleMocks();

beforeEach(() => {
  vi.resetModules();
});

// Helper that renders useReactDnD and waits for async state updates
// using separate act() blocks (Vitest processes state updates between
// act() calls, unlike Jest which batched them within a single act()).
async function renderUseReactDnD(dndParam?: DndProp) {
  let hookResult!: RenderHookResult<UseReactDnD | null, DndProp | undefined>;
  await act(async () => {
    hookResult = renderHook(() => useReactDnD(dndParam));
  });
  await act(async () => {
    await waitABeat(timeoutWait);
  });
  await act(async () => {
    hookResult.rerender();
  });
  return hookResult;
}

it('returns the react-dnd exports', async () => {
  const hookResult = await renderUseReactDnD();
  expect(hookResult.result.current).toHaveProperty('useDrag');
  expect(hookResult.result.current).toHaveProperty('useDrop');
  expect(hookResult.result.current).toHaveProperty('HTML5Backend');
  expect(hookResult.result.current).toHaveProperty('TouchBackend');
  expect(hookResult.result.current).toHaveProperty('ReactDndBackend');
});

describe('returns the provided backend', () => {
  it('returns the provided HTML5 backend', async () => {
    const existingDnD: DndProp = {
      ...(await import('react-dnd')),
      ...(await import('react-dnd-html5-backend')),
    };

    const hookResult = await renderUseReactDnD(existingDnD);
    expect(hookResult.result.current).toBe(existingDnD);
    expect(existingDnD).toHaveProperty('ReactDndBackend', existingDnD.HTML5Backend);
  });

  it('returns the provided touch backend', async () => {
    const existingDnD: DndProp = {
      ...(await import('react-dnd')),
      ...(await import('react-dnd-touch-backend')),
    };

    const hookResult = await renderUseReactDnD(existingDnD);
    expect(hookResult.result.current).toBe(existingDnD);
    expect(existingDnD).toHaveProperty('ReactDndBackend', existingDnD.TouchBackend);
  });
});

it('falls back to touch backend', async () => {
  vi.doMock('react-dnd-html5-backend', () => {
    throw new Error('react-dnd-html5-backend');
  });

  const tBe = await import('react-dnd-touch-backend');

  const hookResult = await renderUseReactDnD();
  expect(hookResult.result.current).toHaveProperty('ReactDndBackend', tBe.TouchBackend);
});

it('fails gracefully', async () => {
  vi.doMock('react-dnd', () => {
    throw new Error('react-dnd');
  });
  vi.doMock('react-dnd-html5-backend', () => {
    throw new Error('react-dnd-html5-backend');
  });
  vi.doMock('react-dnd-touch-backend', () => {
    throw new Error('react-dnd-touch-backend');
  });

  const hookResult = await renderUseReactDnD();
  expect(hookResult.result.current).toBeNull();
});
