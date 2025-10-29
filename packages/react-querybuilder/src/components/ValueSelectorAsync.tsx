import {
  prepareOptionList,
  type FullOption,
  type FullOptionList,
  type RuleGroupTypeAny,
  type RuleType,
} from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import {
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderSelector,
} from '../redux/_internal';
import { asyncOptionListsSlice, getOptionListsAsync } from '../redux/asyncOptionListsSlice';
import type { ValueSelectorProps, VersatileSelectorProps } from '../types';

export interface GenerateValueSelectorAsyncParams {
  /**
   * The default set of options to show before the user starts searching. When
   * set to `true`, the results for `loadOptionList('', { ruleOrGroup }, <callback>)`
   * will be autoloaded.
   */
  // defaultOptions?: FullOptionList<FullOption> | boolean;
  /**
   * Milliseconds after initial retrieval for which the cache is valid.
   *
   * To avoid caching, set this to zero.
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
   */
  getCacheKey?: string[] | ((ruleOrGroup?: RuleType | RuleGroupTypeAny) => string);
  /**
   * Must return a promise for the set of options to be used.
   */
  loadOptionList?: (
    /** Current value of the selector. */
    value: string | undefined,
    meta: { ruleOrGroup?: RuleType | RuleGroupTypeAny }
    // callback: (options: FullOptionList<FullOption>) => void
  ) => Promise<FullOptionList<FullOption>>;
  /**
   * Forces "loading" state, even if the selector is not currently waiting for `loadOptionList` to resolve.
   */
  isLoading?: boolean;
  /**
   * Base value selector component. Defaults to the configured `valueSelector`
   * (which is {@link ValueSelector} by default).
   */
  selectorComponent?: React.ComponentType<ValueSelectorProps>;
}

export const generateValueSelectorAsync =
  (params: GenerateValueSelectorAsyncParams): React.ComponentType<ValueSelectorProps> =>
  (p: ValueSelectorProps) => <ValueSelectorAsync {...p} {...params} />;

export interface ValueSelectorAsyncProps
  extends VersatileSelectorProps,
    GenerateValueSelectorAsyncParams {}

export const ValueSelectorAsync = (props: ValueSelectorAsyncProps): React.JSX.Element => {
  const uvsa = useValueSelectorAsync(props);

  const { selectorComponent: SelectorComponent = props.schema.controls.valueSelector } = props;

  return <SelectorComponent {...props} options={uvsa.options} />;
};

// export interface UseValueSelectorAsyncParams extends GenerateValueSelectorAsyncParams {}

export interface UseValueSelectorAsync {
  /**
   * The options for the list.
   */
  options: FullOptionList<FullOption>;
  /**
   * Whether the selector is currently loading options.
   */
  isLoading: boolean;
  /**
   * Handler for input changes.
   */
  onInputChange: (newValue: string, meta: { ruleOrGroup: RuleType | RuleGroupTypeAny }) => void;
  errors: string | null;
}

export const useValueSelectorAsync = (props: ValueSelectorAsyncProps): UseValueSelectorAsync => {
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const { options: optionsProp, getCacheKey, cacheTTL, loadOptionList, value } = props;

  const preparedOptionsProp = useMemo(
    () => prepareOptionList({ optionList: optionsProp }).optionList,
    [optionsProp]
  );

  const ruleOrGroup = useMemo(() => props.rule ?? props.ruleGroup, [props.rule, props.ruleGroup]);

  const cacheKey = useMemo(() => {
    if (typeof getCacheKey === 'function') {
      return getCacheKey(ruleOrGroup);
    }
    if (Array.isArray(getCacheKey) && getCacheKey.length > 0 && ruleOrGroup) {
      return getCacheKey.map(ck => `${ruleOrGroup[ck as 'id']}`).join('|');
    }
    return '';
  }, [getCacheKey, ruleOrGroup]);

  const cached = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectCacheByKey(s, cacheKey)
  );

  const cacheIsValid = cached && Date.now() <= cached.validUntil;

  const options = cached?.data ?? preparedOptionsProp;
  const isLoading = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectIsLoadingByKey(s, cacheKey)
  );
  const errors = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectErrorByKey(s, cacheKey)
  );

  useEffect(() => {
    if (!isLoading && (!cacheIsValid || !cached) && typeof loadOptionList === 'function') {
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
  ]);

  const onInputChange = useCallback(() => {}, []);

  return {
    errors,
    isLoading,
    onInputChange,
    options,
  };
};
