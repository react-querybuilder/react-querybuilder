// oxlint-disable no-standalone-expect

import { act, renderHook, waitFor } from '@testing-library/react';
import { clearValuesCache, useAsyncValues } from './useAsyncValues';

const mockFieldData = { name: 'test', value: 'test', label: 'Test Field' };

beforeEach(() => {
  // Clear cache between tests
  clearValuesCache();
  jest.clearAllMocks();
});

describe('sync behavior', () => {
  it('should return fallback values when no async function provided', () => {
    const fallbackValues = [
      { name: 'opt1', value: 'option1', label: 'Option 1' },
      { name: 'opt2', value: 'option2', label: 'Option 2' },
    ];

    const { result } = renderHook(() =>
      useAsyncValues({
        field: 'testField',
        operator: 'equals',
        fieldData: mockFieldData,
        fallbackValues,
      })
    );

    expect(result.current.values).toEqual(fallbackValues);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    result.current.refetch();

    expect(result.current.values).toEqual(fallbackValues);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});

describe('async behavior', () => {
  it('should load async values successfully', async () => {
    const mockAsyncValues = [
      { name: 'async1', value: 'async1', label: 'Async Option 1' },
      { name: 'async2', value: 'async2', label: 'Async Option 2' },
    ];

    const getValuesAsync = jest.fn().mockResolvedValue(mockAsyncValues);

    const { result } = renderHook(() =>
      useAsyncValues({
        field: 'testField',
        operator: 'equals',
        fieldData: mockFieldData,
        getValuesAsync,
        fallbackValues: [],
      })
    );

    // Initially should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.values).toEqual([]);

    // Wait for async resolution
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.values).toEqual(mockAsyncValues);
    expect(result.current.error).toBe(null);
    expect(getValuesAsync).toHaveBeenCalledWith('testField', 'equals', {
      fieldData: mockFieldData,
    });
  });

  it('should handle async errors gracefully', async () => {
    const mockError = new Error('Failed to load values');
    const getValuesAsync = jest.fn().mockRejectedValue(mockError);
    const fallbackValues = [{ name: 'fallback', value: 'fallback', label: 'Fallback' }];

    const { result } = renderHook(() =>
      useAsyncValues({
        field: 'testField',
        operator: 'equals',
        fieldData: mockFieldData,
        getValuesAsync,
        fallbackValues,
      })
    );

    // Wait for error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.values).toEqual(fallbackValues);
  });

  it('should support sync values from async function', async () => {
    const syncValues = [{ name: 'sync', value: 'sync', label: 'Sync Value' }];
    const getValuesAsync = jest.fn().mockReturnValue(syncValues);

    const { result } = renderHook(() =>
      useAsyncValues({
        field: 'testField',
        operator: 'equals',
        fieldData: mockFieldData,
        getValuesAsync,
        fallbackValues: [],
      })
    );

    // Should resolve immediately with sync values
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.values).toEqual(syncValues);
    expect(result.current.error).toBe(null);
  });
});

describe('trigger behavior', () => {
  it('should trigger on field change when trigger is "field"', async () => {
    const getValuesAsync = jest.fn().mockResolvedValue([]);
    const getValuesTrigger = jest.fn().mockReturnValue('field');

    const { result, rerender } = renderHook(
      ({ field }) =>
        useAsyncValues({
          field,
          operator: 'equals',
          fieldData: mockFieldData,
          getValuesAsync,
          getValuesTrigger,
          fallbackValues: [],
        }),
      { initialProps: { field: 'field1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getValuesAsync).toHaveBeenCalledTimes(1);

    // Change field
    rerender({ field: 'field2' });

    await waitFor(() => {
      expect(getValuesAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('should trigger on operator change when trigger is "operator"', async () => {
    const getValuesAsync = jest.fn().mockResolvedValue([]);
    const getValuesTrigger = jest.fn().mockReturnValue('operator');

    const { result, rerender } = renderHook(
      ({ operator }) =>
        useAsyncValues({
          field: 'testField',
          operator,
          fieldData: mockFieldData,
          getValuesAsync,
          getValuesTrigger,
          fallbackValues: [],
        }),
      { initialProps: { operator: 'equals' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getValuesAsync).toHaveBeenCalledTimes(1);

    // Change operator
    rerender({ operator: 'not_equals' });

    await waitFor(() => {
      expect(getValuesAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('should not auto-trigger when trigger is "never"', async () => {
    const getValuesAsync = jest.fn().mockResolvedValue([]);
    const getValuesTrigger = jest.fn().mockReturnValue('never');

    const { result } = renderHook(() =>
      useAsyncValues({
        field: 'testField',
        operator: 'equals',
        fieldData: mockFieldData,
        getValuesAsync,
        getValuesTrigger,
        fallbackValues: [],
      })
    );

    // Should not trigger automatically
    expect(result.current.loading).toBe(false);
    expect(getValuesAsync).not.toHaveBeenCalled();
  });

  it('should support manual refetch', async () => {
    const getValuesAsync = jest.fn().mockResolvedValue([]);
    const getValuesTrigger = jest.fn().mockReturnValue('never');

    const { result } = renderHook(() =>
      useAsyncValues({
        field: 'testField',
        operator: 'equals',
        fieldData: mockFieldData,
        getValuesAsync,
        getValuesTrigger,
        fallbackValues: [],
      })
    );

    expect(getValuesAsync).not.toHaveBeenCalled();

    // Manual refetch
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getValuesAsync).toHaveBeenCalledTimes(1);
  });
});

describe('caching', () => {
  it('should cache results and avoid duplicate requests on refetch', async () => {
    const mockValues = [{ name: 'cached', value: 'cached', label: 'Cached Value' }];
    const getValuesAsync = jest.fn().mockResolvedValue(mockValues);

    const { result } = renderHook(() =>
      useAsyncValues({
        field: 'testField',
        operator: 'equals',
        fieldData: mockFieldData,
        getValuesAsync,
        fallbackValues: [],
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getValuesAsync).toHaveBeenCalledTimes(1);
    expect(result.current.values).toEqual(mockValues);

    // Manual refetch - should use cache and not call function again
    act(() => {
      result.current.refetch();
    });

    // Should resolve immediately from cache without another function call
    expect(result.current.loading).toBe(false);
    expect(result.current.values).toEqual(mockValues);
    expect(getValuesAsync).toHaveBeenCalledTimes(1); // Still only called once due to cache
  });
});
