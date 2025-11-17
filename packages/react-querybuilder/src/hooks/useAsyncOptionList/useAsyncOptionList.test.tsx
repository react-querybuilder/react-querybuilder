import type { FullField, RuleType } from '@react-querybuilder/core';
import { generateID, standardClassnames } from '@react-querybuilder/core';
import type { EnhancedStore } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { waitABeat } from '@rqb-testing';
import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { QueryBuilderStateContext } from '../../redux';
import {
  asyncOptionListsSlice,
  DEFAULT_CACHE_TTL,
  getOptionListsAsync,
} from '../../redux/asyncOptionListsSlice';
import { queriesSlice } from '../../redux/queriesSlice';
import { warningsSlice } from '../../redux/warningsSlice';
import type { Schema, ValueEditorProps, VersatileSelectorProps } from '../../types';
import { useAsyncOptionList } from './index';
import type { UseAsyncOptionListParams } from './types';

const defaultSchema = {
  suppressStandardClassnames: false,
  classNames: { loading: 'custom-loading' },
} as Schema<FullField, string>;

const createValueSelectorProps = (overrides: Partial<VersatileSelectorProps> = {}) =>
  ({
    handleOnChange: jest.fn(),
    options: [{ name: 'default', value: 'default', label: 'Default' }],
    value: '',
    className: 'test-class',
    schema: defaultSchema,
    ...overrides,
  }) as VersatileSelectorProps;

const createValueEditorProps = (overrides: Partial<ValueEditorProps> = {}) =>
  ({
    handleOnChange: jest.fn(),
    values: [{ name: 'default', value: 'default', label: 'Default' }],
    value: '',
    className: 'test-class',
    schema: defaultSchema,
    ...overrides,
  }) as ValueEditorProps;

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
  it('returns selector props with default values when no async params provided', () => {
    const props = createValueSelectorProps();
    const { result } = renderHook(() => useAsyncOptionList(props), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.options).toBe(props.options);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toBeNull();
    expect(result.current.className).toBe('test-class');
  });

  it('returns editor props with default values when no async params provided', () => {
    const props = createValueEditorProps();
    const { result } = renderHook(() => useAsyncOptionList(props), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.values).toBe(props.values);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toBeNull();
    expect(result.current.className).toBe('test-class');
  });
});

describe('cache key generation', () => {
  it('generates cache key from string property', async () => {
    const field = generateID();
    const rule = createRule({ field });
    const props = createValueSelectorProps({ rule });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: 'field',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), field);
    expect(cached?.data).toEqual(props.options);
  });

  it('generates cache key from array of properties', async () => {
    const field = generateID();
    const operator = generateID();
    const rule = createRule({ field, operator });
    const props = createValueSelectorProps({ rule });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: ['field', 'operator'],
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), `${field}|${operator}`);
    expect(cached?.data).toEqual(props.options);
  });

  it('generates cache key from function', async () => {
    const field = generateID();
    const rule = createRule({ field });
    const props = createValueSelectorProps({ rule });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: props => `custom-${props.rule?.field}`,
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), `custom-${field}`);
    expect(cached?.data).toEqual(props.options);
  });

  it('returns empty string for invalid cache key', async () => {
    const props = createValueSelectorProps();
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: 'nonexistentField',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), '');
    expect(cached?.data).toEqual(props.options);
  });
});

describe('loading states', () => {
  it('forces loading state when isLoading param is true', () => {
    const props = createValueSelectorProps();
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = { isLoading: true };

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('adds both standard and custom loading classes when loading', () => {
    const props = createValueSelectorProps();
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = { isLoading: true };

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toContain(standardClassnames.loading);
    expect(result.current.className).toContain('custom-loading');
  });
});

describe('className handling', () => {
  it('preserves original className when not loading', () => {
    const props = createValueSelectorProps({ className: 'original-class' });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {};

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toBe('original-class');
  });

  it('combines classNames when loading', () => {
    const props = createValueSelectorProps({ className: 'original-class' });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = { isLoading: true };

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toContain('original-class');
    expect(result.current.className).toContain(standardClassnames.loading);
    expect(result.current.className).toContain('custom-loading');
  });

  it('suppresses standard loading class when suppressStandardClassnames is true', () => {
    const schema = { ...defaultSchema, suppressStandardClassnames: true };
    const props = createValueSelectorProps({ className: 'original-class', schema });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = { isLoading: true };

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.className).toContain('original-class');
    expect(result.current.className).not.toContain(standardClassnames.loading);
    expect(result.current.className).toContain('custom-loading');
  });
});

describe('rule and group context', () => {
  it('uses rule when available', async () => {
    const field = generateID();
    const rule = createRule({ field, operator: 'equals' });
    const props = createValueSelectorProps({ rule });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: 'field',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), field);
    expect(cached?.data).toEqual(props.options);
  });

  it('uses ruleGroup when rule is not available', async () => {
    const ruleGroup = { id: 'group1', combinator: 'and', rules: [] };
    const props = createValueSelectorProps({ ruleGroup });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: 'combinator',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), 'and');
    expect(cached?.data).toEqual(props.options);
  });

  it('handles different values with function cache key', async () => {
    const rule = createRule();
    const props = createValueSelectorProps({ value: 'currentValue', rule });
    const props2 = createValueSelectorProps({ value: 'nextValue', rule });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: p => p.value!,
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    const { rerender } = renderHook(p => useAsyncOptionList(p, params), {
      wrapper,
      initialProps: props,
    });
    await waitABeat(200);

    rerender(props2);
    await waitABeat(200);

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
    const props = createValueSelectorProps({
      handleOnChange,
      value: 'test-value',
      className: 'test-class',
    });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {};

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.handleOnChange).toBe(handleOnChange);
    expect(result.current.value).toBe('test-value');
    expect(result.current.options).toBe(props.options);
    expect(result.current.schema).toBe(props.schema);
  });

  it('maintains prop structure with additional async properties', () => {
    const props = createValueSelectorProps();
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {};

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
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
    const props = createValueSelectorProps({ rule });
    const loadOptionList = jest.fn(async () => [
      { name: 'cached', value: 'cached', label: generateID() },
    ]);
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: 'field',
      loadOptionList,
    };
    const { store, wrapper } = getWrapper();

    // First call - should load and cache
    const { rerender, result } = renderHook(p => useAsyncOptionList(p, params), {
      initialProps: props,
      wrapper,
    });
    await waitABeat(200);

    expect(loadOptionList).toHaveBeenCalledTimes(1);

    let cached = selectCacheByKey(store.getState(), field);
    let resultData = result.current.options;
    expect(cached.data).toBe(resultData);

    // Second call (via thunk) with same cache key - should use cache
    await act(async () => {
      store.dispatch(
        getOptionListsAsync({
          cacheKey: field,
          cacheTTL: DEFAULT_CACHE_TTL,
          value: props.value,
          ruleOrGroup: rule,
          loadOptionList,
        })
      );
      await waitABeat(200);
    });

    // Third call (via hook) with same cache key but different props - should use cache
    rerender({ ...props, className: generateID() });
    await waitABeat(200);

    resultData = result.current.options;

    expect(loadOptionList).toHaveBeenCalledTimes(1); // Should not call again
    cached = selectCacheByKey(store.getState(), field);
    expect(cached.data).toBe(resultData);
  });
});

describe('edge cases', () => {
  it('handles empty cache key array', () => {
    const props = createValueSelectorProps({ rule: createRule() });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = { getCacheKey: [] };

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current).toBeDefined();
    expect(result.current.options).toBe(props.options);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles cache key array with undefined rule', () => {
    const props = createValueSelectorProps(); // No rule or ruleGroup
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: ['field', 'operator'],
    };

    const { result } = renderHook(() => useAsyncOptionList(props, params), {
      wrapper: ReduxWrapper,
    });

    expect(result.current).toBeDefined();
    expect(result.current.options).toBe(props.options);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles default cacheTTL when not specified', async () => {
    const field = generateID();
    const props = createValueSelectorProps({ rule: createRule({ field }) });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      loadOptionList: jest.fn().mockResolvedValue([]),
      getCacheKey: 'field',
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), field);
    expect(cached && cached.validUntil - cached.timestamp).toBe(DEFAULT_CACHE_TTL);
  });

  it('handles custom cacheTTL', async () => {
    const customTTL = 5000; // 5 seconds
    const field = generateID();
    const props = createValueSelectorProps({ rule: createRule({ field }) });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      loadOptionList: jest.fn().mockResolvedValue([]),
      getCacheKey: 'field',
      cacheTTL: customTTL,
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), field);
    expect(cached && cached.validUntil - cached.timestamp).toBe(customTTL);
  });

  // This test is flaky in React 18
  // oxlint-disable no-standalone-expect
  (React.version.startsWith('18.') ? it.skip : it)(
    'handles zero cacheTTL (no caching)',
    async () => {
      const field = generateID();
      const props = createValueSelectorProps({ rule: createRule({ field }) });
      const loadOptionList = jest.fn().mockResolvedValue([]);
      const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
        loadOptionList,
        getCacheKey: 'field',
        cacheTTL: 0,
      };
      const { wrapper } = getWrapper();

      const { rerender } = renderHook(() => useAsyncOptionList(props, params), { wrapper });
      await waitABeat(200);

      const calls = loadOptionList.mock.calls.length;

      expect(calls >= 1).toBe(true);

      // With zero TTL, cache should be invalid immediately, so second call should trigger new load
      rerender();
      await waitABeat(200);

      expect(loadOptionList.mock.calls.length > calls).toBe(true);
    }
  );
  // oxlint-enable no-standalone-expect

  it('handles rejected promises', async () => {
    const field = generateID();
    const props = createValueSelectorProps({ rule: createRule({ field }) });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      loadOptionList: async () => {
        throw new Error('fake error');
      },
      getCacheKey: 'field',
    };
    const { store, wrapper } = getWrapper();

    renderHook(() => useAsyncOptionList(props, params), { wrapper });
    await waitABeat(100);

    const err = selectErrorByKey(store.getState(), field);
    expect(err).toBe('fake error');
  });

  it('retrieves cached values', async () => {
    const field = generateID();
    const rule = createRule({ field });
    const props = createValueSelectorProps({ rule });
    const props2 = createValueSelectorProps({ rule: { ...rule, valueSource: 'field' } });
    const params: UseAsyncOptionListParams<VersatileSelectorProps> = {
      getCacheKey: 'field',
      loadOptionList: async () => props.options,
    };
    const { store, wrapper } = getWrapper();

    const { rerender } = renderHook(p => useAsyncOptionList(p, params), {
      wrapper,
      initialProps: props,
    });
    await waitABeat(200);

    rerender(props2);
    await waitABeat(200);

    const cached = selectCacheByKey(store.getState(), field);
    expect(cached?.data).toEqual(props.options);
  });
});
