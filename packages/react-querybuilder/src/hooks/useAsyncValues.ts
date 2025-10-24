import type {
  BaseOption,
  FlexibleOptionListProp,
  FullField,
  FullOptionList,
} from '@react-querybuilder/core';
import { prepareOptionList } from '@react-querybuilder/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseAsyncValuesParams<F extends FullField = FullField> {
  field: string;
  operator: string;
  fieldData: F;
  getValuesAsync?: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => Promise<FlexibleOptionListProp<BaseOption>> | FlexibleOptionListProp<BaseOption>;
  getValuesTrigger?: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => 'field' | 'operator' | 'both' | 'never';
  fallbackValues?: FlexibleOptionListProp<BaseOption>;
  autoSelectValue?: boolean;
  translations?: { values?: { title?: string; placeholderName?: string } };
}

export interface UseAsyncValues {
  values: FullOptionList<BaseOption>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Simple cache to avoid redundant requests
const valuesCache = new Map<string, { values: FullOptionList<BaseOption>; timestamp: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Export for testing
export const clearValuesCache = (): void => valuesCache.clear();

/**
 * Hook for managing async value loading with caching and loading states.
 *
 * @group Hooks
 */
export const useAsyncValues = <F extends FullField = FullField>(
  params: UseAsyncValuesParams<F>
): UseAsyncValues => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [asyncValues, setAsyncValues] = useState<FlexibleOptionListProp<BaseOption> | null>(null);

  // istanbul ignore next
  const {
    field,
    operator,
    fieldData,
    getValuesAsync,
    getValuesTrigger,
    fallbackValues = [],
    autoSelectValue = true,
    translations = {},
  } = params;

  // Keep track of the current request to avoid race conditions
  const currentRequestRef = useRef(0);

  // Determine what should trigger a refetch
  const triggerMode = useMemo(() => {
    if (!getValuesTrigger) return 'both';
    return getValuesTrigger(field, operator, { fieldData });
  }, [field, operator, fieldData, getValuesTrigger]);

  // Generate cache key
  const cacheKey = useMemo(() => `${field}|${operator}`, [field, operator]);

  // Fetch function
  const fetchValues = useCallback(
    async (requestId: number) => {
      // istanbul ignore next
      if (!getValuesAsync) return;

      // Check cache first
      const cached = valuesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        // istanbul ignore else
        if (requestId === currentRequestRef.current) {
          setAsyncValues(cached.values);
          setLoading(false);
          setError(null);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await Promise.resolve(getValuesAsync(field, operator, { fieldData }));

        // Only update if this is still the current request
        // istanbul ignore else
        if (requestId === currentRequestRef.current) {
          const processedValues = prepareOptionList({
            optionList: result,
            placeholder: translations.values,
            autoSelectOption: autoSelectValue,
          }).optionList;

          setAsyncValues(processedValues);

          // Cache the result
          valuesCache.set(cacheKey, {
            values: processedValues,
            timestamp: Date.now(),
          });

          setLoading(false);
        }
      } catch (err) {
        // istanbul ignore else
        if (requestId === currentRequestRef.current) {
          setError(err instanceof Error ? err : /* istanbul ignore next */ new Error(String(err)));
          setLoading(false);
          setAsyncValues(null);
        }
      }
    },
    [getValuesAsync, field, operator, fieldData, cacheKey, autoSelectValue, translations.values]
  );

  // Manual refetch function
  const refetch = useCallback(() => {
    if (getValuesAsync) {
      const requestId = ++currentRequestRef.current;
      fetchValues(requestId);
    }
  }, [fetchValues, getValuesAsync]);

  // Track previous values to avoid duplicate initial triggers
  const prevFieldRef = useRef(field);
  const prevOperatorRef = useRef(operator);
  const hasInitializedRef = useRef(false);

  // Effect to trigger fetching when field changes
  useEffect(() => {
    if (!getValuesAsync || triggerMode === 'never') return;
    if (triggerMode === 'field' || triggerMode === 'both') {
      // Skip on first render for 'field' trigger
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        prevFieldRef.current = field;
        const requestId = ++currentRequestRef.current;
        fetchValues(requestId);
        return;
      }

      // istanbul ignore else
      if (prevFieldRef.current !== field) {
        prevFieldRef.current = field;
        const requestId = ++currentRequestRef.current;
        fetchValues(requestId);
      }
    }
  }, [field, getValuesAsync, fetchValues, triggerMode]);

  // Effect to trigger fetching when operator changes
  useEffect(() => {
    if (!getValuesAsync || triggerMode === 'never') return;
    if (triggerMode === 'operator') {
      // Skip on first render for 'operator' only trigger
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        prevOperatorRef.current = operator;
        const requestId = ++currentRequestRef.current;
        fetchValues(requestId);
        return;
      }

      // istanbul ignore else
      if (prevOperatorRef.current !== operator) {
        prevOperatorRef.current = operator;
        const requestId = ++currentRequestRef.current;
        fetchValues(requestId);
      }
    }
  }, [operator, getValuesAsync, fetchValues, triggerMode]);

  // Determine final values to return
  const finalValues = useMemo(
    () =>
      (asyncValues as FullOptionList<BaseOption>) ??
      // Return fallback values while loading or on error
      prepareOptionList({
        optionList: fallbackValues,
        placeholder: translations.values,
        autoSelectOption: autoSelectValue,
      }).optionList,
    [asyncValues, fallbackValues, autoSelectValue, translations.values]
  );

  return {
    values: finalValues,
    loading,
    error,
    refetch,
  };
};
