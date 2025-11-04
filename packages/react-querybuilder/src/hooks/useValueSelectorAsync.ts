import type {
  FullOption,
  FullOptionList,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import { clsx, standardClassnames } from '@react-querybuilder/core';
import { useEffect, useMemo } from 'react';
import {
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderSelector,
} from '../redux/_internal';
import { asyncOptionListsSlice, getOptionListsAsync } from '../redux/asyncOptionListsSlice';
import type { ValueSelectorProps, VersatileSelectorProps } from '../types';

export interface UseValueSelectorAsyncParams {
  /**
   * Cache "time to live"—milliseconds after initial retrieval for which the cache is valid.
   *
   * To avoid caching, set this to zero. (Loaded option lists will always be cached, but
   * a cache with zero TTL will be immediately invalidated, effectively disabling caching.)
   *
   * @default 1_800_000 // 30 minutes
   */
  cacheTTL?: number;
  /**
   * List of rule/group attributes to use as the cache key, or a function that generates
   * the cache key based on the rule/group.
   *
   * **IMPORTANT**: If providing an array of property names, do NOT include the property
   * that `value` represents unless you are generating an auto-complete component. For example,
   * if the value selector will be assigned as `fieldSelector`, do not include 'field' in this
   * array. Same for 'operator' and `operatorSelector`, etc.
   *
   * @default ''
   */
  getCacheKey?: string | string[] | ((props: VersatileSelectorProps) => string);
  /**
   * Returns a promise for the set of options to be used.
   */
  loadOptionList?: (
    /** Current value of the selector. */
    value: string | undefined,
    meta: { ruleOrGroup?: RuleType | RuleGroupTypeAny }
  ) => Promise<FullOptionList<FullOption>>;
  /**
   * Forces "loading" state, even if the selector is not currently waiting for `loadOptionList` to resolve.
   */
  isLoading?: boolean;
}

export interface UseValueSelectorAsync extends ValueSelectorProps {
  /**
   * Whether the selector is currently loading options.
   */
  isLoading: boolean;
  /**
   * Error messages of rejected `loadOptionList` promises.
   */
  errors: string | null;
}

/**
 * Generates a cache key given the same props and params as {@link useValueSelectorAsync}.
 *
 * @group Hooks
 */
export const useAsyncCacheKey = (
  props: VersatileSelectorProps,
  // istanbul ignore next
  { getCacheKey }: UseValueSelectorAsyncParams = {}
): string => {
  const ruleOrGroup = props.rule ?? props.ruleGroup;

  return useMemo(
    () =>
      typeof getCacheKey === 'string'
        ? String(ruleOrGroup?.[getCacheKey as 'id'] ?? '')
        : typeof getCacheKey === 'function'
          ? getCacheKey(props)
          : Array.isArray(getCacheKey) && getCacheKey.length > 0 && ruleOrGroup
            ? getCacheKey.map(ck => `${ruleOrGroup[ck as 'id']}`).join('|')
            : '',
    [
      getCacheKey,
      // Spread all properties of `props`—in alphabetical order—to allow passing `props`
      // to `getCacheKey` function without having `props` in the dependency array.
      // oxlint-disable exhaustive-deps
      ...Object.keys(props)
        .toSorted()
        .map(k => props[k as keyof VersatileSelectorProps]),
      // oxlint-enable exhaustive-deps
    ]
  );
};

/**
 * Augments a {@link ValueSelectorProps} object with async option loading.
 *
 * @group Hooks
 */
export const useValueSelectorAsync = (
  props: VersatileSelectorProps,
  params: UseValueSelectorAsyncParams = {}
): UseValueSelectorAsync => {
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const { cacheTTL, loadOptionList } = params;
  const { options: optionsProp, value } = props;

  const ruleOrGroup = props.rule ?? props.ruleGroup;

  const cacheKey = useAsyncCacheKey(props, params);

  const cached = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectCacheByKey(s, cacheKey)
  );

  const cacheIsValid = !!cached && Date.now() <= cached.validUntil;

  const options = cached?.data ?? optionsProp;

  const isLoading =
    params.isLoading ||
    useRQB_INTERNAL_QueryBuilderSelector(s =>
      asyncOptionListsSlice.selectors.selectIsLoadingByKey(s, cacheKey)
    );

  const errors = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectErrorByKey(s, cacheKey)
  );

  const className = useMemo(
    () =>
      clsx(
        props.className,
        isLoading && [
          props.schema.suppressStandardClassnames || standardClassnames.loading,
          props.schema.classNames.loading,
        ]
      ),
    [
      props.schema.suppressStandardClassnames,
      isLoading,
      props.className,
      props.schema.classNames.loading,
    ]
  );

  useEffect(() => {
    if (
      !isLoading &&
      (!cacheIsValid || !cached) &&
      !errors &&
      typeof loadOptionList === 'function'
    ) {
      queryBuilderDispatch(
        getOptionListsAsync({ cacheKey, cacheTTL, value, ruleOrGroup, loadOptionList })
      );
    }
  }, [
    cacheKey,
    cacheIsValid,
    cacheTTL,
    isLoading,
    loadOptionList,
    cached,
    queryBuilderDispatch,
    ruleOrGroup,
    value,
    errors,
  ]);

  return {
    ...props,
    options,
    className,
    isLoading,
    errors,
  };
};
