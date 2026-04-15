import { renderHook } from '@testing-library/react';
import * as React from 'react';
import type { RuleGroupType } from 'react-querybuilder';
import { DragPreviewContext } from './DragPreviewContext';
import type { DragPreviewState } from './types';
import { useShadowQuery } from './useShadowQuery';

describe('useShadowQuery', () => {
  it('returns undefined when no drag preview is active', () => {
    const { result } = renderHook(() => useShadowQuery());
    expect(result.current).toBeUndefined();
  });

  it('returns the shadow query when drag preview is active', () => {
    const shadowQuery: RuleGroupType = { combinator: 'and', rules: [] };
    const previewState: DragPreviewState = {
      shadowQuery,
      originalQuery: { combinator: 'and', rules: [] },
      draggedPath: [0],
      previewPath: [1],
      dropEffect: 'move',
      groupItems: false,
      qbId: 'test-qb',
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DragPreviewContext.Provider
        value={{
          dragPreviewState: previewState,
          updatePreviewPosition: () => {},
          commitDrag: () => {},
          cancelDrag: () => {},
        }}>
        {children}
      </DragPreviewContext.Provider>
    );

    const { result } = renderHook(() => useShadowQuery(), { wrapper });
    expect(result.current).toBe(shadowQuery);
  });
});
