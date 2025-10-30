import type {
  FullOption,
  FullOptionList,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import { clsx, standardClassnames } from '@react-querybuilder/core';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import {
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderSelector,
} from '../redux/_internal';
import { asyncOptionListsSlice, getOptionListsAsync } from '../redux/asyncOptionListsSlice';
import type { ValueSelectorProps, VersatileSelectorProps } from '../types';

export interface GenerateValueSelectorAsyncParams {
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
  /**
   * Base value selector component. Defaults to the configured `valueSelector`
   * (which is {@link ValueSelector} by default).
   */
  selectorComponent?: React.ComponentType<ValueSelectorProps>;
}

/**
 * Simple utility to create an async value selector component assignable to {@link QueryBuilder}'s
 * `*Selector` controls on the `controlElements` prop.
 *
 * Augments {@link ValueSelector} by default.
 */
export const generateValueSelectorAsync =
  (params: GenerateValueSelectorAsyncParams): React.ComponentType<ValueSelectorProps> =>
  (p: ValueSelectorProps) => <ValueSelectorAsync {...p} {...params} />;

export interface ValueSelectorAsyncProps
  extends VersatileSelectorProps,
    GenerateValueSelectorAsyncParams {}

/**
 * Augments a selector component with async option loading.
 *
 * Use {@link generateValueSelectorAsync} to create a selector component directly assignable
 * to `*Selector` controls on the `controlElements` prop.
 */
export const ValueSelectorAsync = (props: ValueSelectorAsyncProps): React.JSX.Element => {
  const uvsa = useValueSelectorAsync(props);

  const { selectorComponent: SelectorComponent = props.schema.controls.valueSelector } = props;

  return <SelectorComponent {...props} {...uvsa} />;
};

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
   * Error messages of rejected `loadOptionList` promises.
   */
  errors: string | null;
  /**
   * Existing classes with "loading" class(es) added as appropriate.
   */
  className?: string;
}

/**
 * Logic for {@link ValueSelectorAsync}.
 */
export const useValueSelectorAsync = (props: ValueSelectorAsyncProps): UseValueSelectorAsync => {
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const { options: optionsProp, getCacheKey, cacheTTL, loadOptionList, value } = props;

  const ruleOrGroup = useMemo(() => props.rule ?? props.ruleGroup, [props.rule, props.ruleGroup]);

  // oxlint-disable exhaustive-deps
  const cacheKey = useMemo(() => {
    if (typeof getCacheKey === 'string') {
      return String(ruleOrGroup?.[getCacheKey as 'id'] ?? '');
    }
    if (typeof getCacheKey === 'function') {
      return getCacheKey(props);
    }
    if (Array.isArray(getCacheKey) && getCacheKey.length > 0 && ruleOrGroup) {
      return getCacheKey.map(ck => `${ruleOrGroup[ck as 'id']}`).join('|');
    }
    return '';
  }, [
    getCacheKey,
    // Spread *all* properties of `props`, in alphabetical order, to allow passing `props`
    // to `getCacheKey` function without having `props` in the dependency array.
    ...Object.keys(props)
      .toSorted()
      .map(k => props[k as keyof ValueSelectorAsyncProps]),
  ]);
  // oxlint-enable exhaustive-deps

  const cached = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectCacheByKey(s, cacheKey)
  );

  const cacheIsValid = cached && Date.now() <= cached.validUntil;

  const options = cached?.data ?? optionsProp;

  const isLoading =
    props.isLoading ||
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
        props.schema.suppressStandardClassnames &&
          isLoading && [standardClassnames.loading, props.schema.classNames.loading]
      ),
    [
      props.schema.suppressStandardClassnames,
      isLoading,
      props.className,
      props.schema.classNames.loading,
    ]
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

  return {
    errors,
    isLoading,
    options,
    className,
  };
};
