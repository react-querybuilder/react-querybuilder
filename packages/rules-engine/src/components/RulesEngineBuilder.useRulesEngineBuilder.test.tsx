// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { QueryBuilderStateContext, queryBuilderStore } from 'react-querybuilder';
import { Provider } from 'react-redux';
import { useRulesEngineBuilder } from './RulesEngineBuilder.useRulesEngineBuilder';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={queryBuilderStore} context={QueryBuilderStateContext}>
    {children}
  </Provider>
);

describe('useRulesEngineBuilder memoization', () => {
  it('keeps merged translations referentially stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useRulesEngineBuilder(), { wrapper });
    const first = result.current.schema.translations;
    rerender();
    expect(result.current.schema.translations).toBe(first);
  });

  it('keeps merged classnames referentially stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useRulesEngineBuilder(), { wrapper });
    const first = result.current.classnames;
    rerender();
    expect(result.current.classnames).toBe(first);
  });
});
