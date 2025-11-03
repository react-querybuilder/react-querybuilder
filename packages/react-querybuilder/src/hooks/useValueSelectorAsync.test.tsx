import type { FullField, RuleType } from '@react-querybuilder/core';
import { generateID, standardClassnames } from '@react-querybuilder/core';
import type { EnhancedStore } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { waitABeat } from '@rqb-testing';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { QueryBuilderStateContext } from '../redux';
import { asyncOptionListsSlice, DEFAULT_CACHE_TTL } from '../redux/asyncOptionListsSlice';
import { queriesSlice } from '../redux/queriesSlice';
import { warningsSlice } from '../redux/warningsSlice';
import type { Schema, VersatileSelectorProps } from '../types';
import type { UseValueSelectorAsyncParams } from './useValueSelectorAsync';
import { useValueSelectorAsync } from './useValueSelectorAsync';

const defaultSchema = {
  suppressStandardClassnames: false,
  classNames: { loading: 'custom-loading' },
} as unknown as Schema<FullField, string>;

const createDefaultProps = (overrides: Partial<VersatileSelectorProps> = {}) =>
  ({
    handleOnChange: jest.fn(),
    options: [{ name: 'default', value: 'default', label: 'Default' }],
    value: '',
    className: 'test-class',
    schema: defaultSchema,
    ...overrides,
  }) as VersatileSelectorProps;

const createRule = (overrides: Partial<RuleType> = {}): RuleType => ({
  id: 'test-rule',
  field: 'testField',
  operator: 'testOperator',
  value: 'testValue',
  ...overrides,
});

const createTestStore = () =>
  configureStore({
    reducer: {
      queries: queriesSlice.reducer,
      warnings: warningsSlice.reducer,
      asyncOptionLists: asyncOptionListsSlice.reducer,
    },
    preloadedState: {
      queries: queriesSlice.getInitialState(),
      warnings: warningsSlice.getInitialState(),
      asyncOptionLists: asyncOptionListsSlice.getInitialState(),
    },
  });

const ReduxWrapper = ({
  children,
  store: storeProp,
}: {
  children: React.ReactNode;
  store?: EnhancedStore;
}) => {
  const [store] = React.useState(() => storeProp ?? createTestStore());
  return (
    <Provider store={store} context={QueryBuilderStateContext}>
      {children}
    </Provider>
  );
};

const getWrapper = () => {
  const store = createTestStore();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ReduxWrapper store={store}>{children}</ReduxWrapper>
  );

  return { store, wrapper };
};

const { selectCacheByKey, selectErrorByKey } = asyncOptionListsSlice.selectors;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('basic functionality', () => {
  it('returns props with default values when no async params provided', () => {
    const props = createDefaultProps();
    const { result } = renderHook(() => useValueSelectorAsync(props), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.options).toBe(props.options);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toBeNull();
    expect(result.current.className).toBe('test-class');
  });
});

describe('cache key generation', () => {
  it('generates cache key from string property', async () => {
    const rule = createRule({ field: 'testField' });
    const props = createDefaultProps({ rule });
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: 'field',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), 'testField');
    expect(cached?.data).toEqual(props.options);
  });

  it('generates cache key from array of properties', async () => {
    const rule = createRule({ field: 'testField', operator: 'testOperator' });
    const props = createDefaultProps({ rule });
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: ['field', 'operator'],
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), 'testField|testOperator');
    expect(cached?.data).toEqual(props.options);
  });

  it('generates cache key from function', async () => {
    const rule = createRule({ field: 'testField' });
    const props = createDefaultProps({ rule });
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: props => `custom-${props.rule?.field}`,
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), 'custom-testField');
    expect(cached?.data).toEqual(props.options);
  });

  it('returns empty string for invalid cache key', async () => {
    const props = createDefaultProps();
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: 'nonexistentField',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), '');
    expect(cached?.data).toEqual(props.options);
  });
});

describe('loading states', () => {
  it('forces loading state when isLoading param is true', () => {
    const props = createDefaultProps();
    const params: UseValueSelectorAsyncParams = { isLoading: true };

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('adds both standard and custom loading classes when loading', () => {
    const props = createDefaultProps();
    const params: UseValueSelectorAsyncParams = { isLoading: true };

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toContain(standardClassnames.loading);
    expect(result.current.className).toContain('custom-loading');
  });
});

describe('className handling', () => {
  it('preserves original className when not loading', () => {
    const props = createDefaultProps({ className: 'original-class' });
    const params: UseValueSelectorAsyncParams = {};

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toBe('original-class');
  });

  it('combines classNames when loading', () => {
    const props = createDefaultProps({ className: 'original-class' });
    const params: UseValueSelectorAsyncParams = { isLoading: true };

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toContain('original-class');
    expect(result.current.className).toContain(standardClassnames.loading);
    expect(result.current.className).toContain('custom-loading');
  });

  it('suppresses standard loading class when suppressStandardClassnames is true', () => {
    const schema = { ...defaultSchema, suppressStandardClassnames: true };
    const props = createDefaultProps({ className: 'original-class', schema });
    const params: UseValueSelectorAsyncParams = { isLoading: true };

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toContain('original-class');
    expect(result.current.className).not.toContain(standardClassnames.loading);
    expect(result.current.className).toContain('custom-loading');
  });
});

describe('rule and group context', () => {
  it('uses rule when available', async () => {
    const rule = createRule({ field: 'testRuleField', operator: 'equals' });
    const props = createDefaultProps({ rule });
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: 'field',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), 'testRuleField');
    expect(cached?.data).toEqual(props.options);
  });

  it('uses ruleGroup when rule is not available', async () => {
    const ruleGroup = { id: 'group1', combinator: 'and', rules: [] };
    const props = createDefaultProps({ ruleGroup });
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: 'combinator',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), 'and');
    expect(cached?.data).toEqual(props.options);
  });

  it('handles different values with function cache key', async () => {
    const rule = createRule();
    const props = createDefaultProps({ value: 'currentValue', rule });
    const props2 = createDefaultProps({ value: 'nextValue', rule });
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: p => p.value!,
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    const { rerender } = renderHook(p => useValueSelectorAsync(p, params), {
      wrapper,
      initialProps: props,
    });
    await waitABeat();

    rerender(props2);
    await waitABeat();

    const state = store.getState();
    const cached = selectCacheByKey(state, 'currentValue');
    const cached2 = selectCacheByKey(state, 'nextValue');
    expect(cached?.data).toEqual(props.options);
    expect(cached2?.data).toEqual(props.options);
  });
});

describe('prop passing', () => {
  it('passes through all original props', () => {
    const handleOnChange = jest.fn();
    const props = createDefaultProps({
      handleOnChange,
      value: 'test-value',
      className: 'test-class',
    });
    const params: UseValueSelectorAsyncParams = {};

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.handleOnChange).toBe(handleOnChange);
    expect(result.current.value).toBe('test-value');
    expect(result.current.options).toBe(props.options);
    expect(result.current.schema).toBe(props.schema);
  });

  it('maintains prop structure with additional async properties', () => {
    const props = createDefaultProps();
    const params: UseValueSelectorAsyncParams = {};

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    // Check that async-specific properties are added
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('errors');

    // Check original props are preserved
    expect(result.current).toHaveProperty('handleOnChange');
    expect(result.current).toHaveProperty('options');
    expect(result.current).toHaveProperty('value');
    expect(result.current).toHaveProperty('schema');
  });
});

describe('cache behavior', () => {
  it('returns cached data when cache is still valid', async () => {
    const field = generateID();
    const rule = createRule({ field });
    const props = createDefaultProps({ rule });
    const loadOptionList = jest.fn(async () => [
      { name: 'cached', value: 'cached', label: generateID() },
    ]);
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: 'field',
      loadOptionList,
    };
    const { store, wrapper } = getWrapper();

    // First call - should load and cache
    const { rerender, result } = renderHook(p => useValueSelectorAsync(p, params), {
      initialProps: props,
      wrapper,
    });
    await waitABeat();

    expect(loadOptionList).toHaveBeenCalledTimes(1);

    let cached = selectCacheByKey(store.getState(), field);
    let resultData = result.current.options;
    expect(cached.data).toBe(resultData);

    // Second call with same cache key but different props - should use cache
    rerender({ ...props, className: generateID() });
    await waitABeat();

    resultData = result.current.options;

    expect(loadOptionList).toHaveBeenCalledTimes(1); // Should not call again
    cached = selectCacheByKey(store.getState(), field);
    expect(cached.data).toBe(resultData);
  });
});

describe('edge cases', () => {
  it('handles empty cache key array', () => {
    const props = createDefaultProps({ rule: createRule() });
    const params: UseValueSelectorAsyncParams = { getCacheKey: [] };

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current).toBeDefined();
    expect(result.current.options).toBe(props.options);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles cache key array with undefined rule', () => {
    const props = createDefaultProps(); // No rule or ruleGroup
    const params: UseValueSelectorAsyncParams = { getCacheKey: ['field', 'operator'] };

    const { result } = renderHook(() => useValueSelectorAsync(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current).toBeDefined();
    expect(result.current.options).toBe(props.options);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles default cacheTTL when not specified', async () => {
    const field = generateID();
    const props = createDefaultProps({ rule: createRule({ field }) });
    const params: UseValueSelectorAsyncParams = {
      loadOptionList: jest.fn().mockResolvedValue([]),
      getCacheKey: 'field',
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), field);
    expect(cached && cached.validUntil - cached.timestamp).toBe(DEFAULT_CACHE_TTL);
  });

  it('handles custom cacheTTL', async () => {
    const customTTL = 5000; // 5 seconds
    const field = generateID();
    const props = createDefaultProps({ rule: createRule({ field }) });
    const params: UseValueSelectorAsyncParams = {
      loadOptionList: jest.fn().mockResolvedValue([]),
      getCacheKey: 'field',
      cacheTTL: customTTL,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), field);
    expect(cached && cached.validUntil - cached.timestamp).toBe(customTTL);
  });

  it('handles zero cacheTTL (no caching)', async () => {
    const props = createDefaultProps({ rule: createRule({ field: 'noCacheField' }) });
    const loadOptionList = jest.fn().mockResolvedValue([]);
    const params: UseValueSelectorAsyncParams = {
      loadOptionList,
      getCacheKey: 'field',
      cacheTTL: 0,
    };
    const { wrapper } = getWrapper();

    const { rerender } = renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat();

    const calls = loadOptionList.mock.calls.length;

    expect(calls >= 1).toBe(true);

    // With zero TTL, cache should be invalid immediately, so second call should trigger new load
    rerender();
    await waitABeat();

    expect(loadOptionList.mock.calls.length > calls).toBe(true);
  });

  it('handles rejected promises', async () => {
    const field = generateID();
    const props = createDefaultProps({ rule: createRule({ field }) });
    const params: UseValueSelectorAsyncParams = {
      loadOptionList: async () => {
        throw new Error('fake error');
      },
      getCacheKey: 'field',
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useValueSelectorAsync(props, params), { wrapper });
    await waitABeat(100);

    const err = selectErrorByKey(store.getState(), field);
    expect(err).toBe('fake error');
  });

  it('retrieves cached values', async () => {
    const rule = createRule();
    const props = createDefaultProps({ rule });
    const props2 = createDefaultProps({ rule: { ...rule, valueSource: 'field' } });
    const params: UseValueSelectorAsyncParams = {
      getCacheKey: 'field',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    const { rerender } = renderHook(p => useValueSelectorAsync(p, params), {
      wrapper,
      initialProps: props,
    });
    await waitABeat();

    rerender(props2);
    await waitABeat();

    const cached = selectCacheByKey(store.getState(), 'testField');
    expect(cached?.data).toEqual(props.options);
  });
});
