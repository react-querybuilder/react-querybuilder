import type {
  BaseOption,
  FlexibleOptionListProp,
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
import type { ValueEditorProps, VersatileSelectorProps } from '../types';

export interface UseAsyncOptionListParams<
  PropsType extends VersatileSelectorProps | ValueEditorProps,
> {
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
  getCacheKey?: string | string[] | ((props: PropsType) => string);
  /**
   * Returns a promise for the set of options to be used.
   */
  loadOptionList?: (
    /** Current value of the selector. */
    value: string | undefined,
    meta: { ruleOrGroup?: RuleType | RuleGroupTypeAny }
  ) => Promise<FlexibleOptionListProp<BaseOption>>;
  /**
   * Forces "loading" state, even if the selector is not currently waiting for `loadOptionList` to resolve.
   */
  isLoading?: boolean;
}

export type UseAsyncOptionList<PropsType> = PropsType & {
  /**
   * Whether the selector is currently loading options.
   */
  isLoading: boolean;
  /**
   * Error messages of rejected `loadOptionList` promises.
   */
  errors: string | null;
};

/**
 * Generates a cache key given the same props and params as {@link useAsyncOptionList}.
 *
 * @group Hooks
 */
export const useAsyncCacheKey = <PropsType extends VersatileSelectorProps | ValueEditorProps>(
  props: PropsType,
  // istanbul ignore next
  { getCacheKey }: UseAsyncOptionListParams<PropsType> = {}
): string => {
  const ruleOrGroup = props.rule ?? (props as VersatileSelectorProps).ruleGroup;

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
        // oxlint-disable-next-line no-explicit-any
        .map(k => (props as any)[k]),
      // oxlint-enable exhaustive-deps
    ]
  );
};

/**
 * Augments a {@link ValueSelectorProps} object with async option loading.
 *
 * @group Hooks
 */
export function useAsyncOptionList(
  props: VersatileSelectorProps,
  params?: UseAsyncOptionListParams<VersatileSelectorProps>
): UseAsyncOptionList<VersatileSelectorProps>;
/**
 * Augments a {@link ValueEditorProps} object with async option (`values`) loading.
 *
 * @group Hooks
 */
export function useAsyncOptionList(
  props: ValueEditorProps,
  params?: UseAsyncOptionListParams<ValueEditorProps>
): UseAsyncOptionList<ValueEditorProps>;
export function useAsyncOptionList<PropsType extends VersatileSelectorProps | ValueEditorProps>(
  props: PropsType,
  params: UseAsyncOptionListParams<PropsType> = {}
) {
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const { cacheTTL, loadOptionList } = params;
  const {
    options: optionsProp,
    values: valuesProp,
    value,
  } = props as VersatileSelectorProps & ValueEditorProps;

  const ruleOrGroup = props.rule ?? (props as VersatileSelectorProps).ruleGroup;

  const cacheKey = useAsyncCacheKey(props, params);

  const cached = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectCacheByKey(s, cacheKey)
  );

  const cacheIsValid = !!cached && Date.now() <= cached.validUntil;

  const options = cached?.data ?? optionsProp ?? valuesProp;

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
    ...(optionsProp ? { options } : { values: options }),
    // Alternative to the previous line:
    // options,
    // values: options,
    className,
    isLoading,
    errors,
  };
}
