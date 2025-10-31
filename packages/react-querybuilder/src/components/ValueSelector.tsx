import type {
  FullOption,
  FullOptionList,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import { clsx, joinWith, standardClassnames, toArray } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelectElementChangeHandler } from '../hooks/useSelectElementChangeHandler';
import {
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderSelector,
} from '../redux/_internal';
import { asyncOptionListsSlice, getOptionListsAsync } from '../redux/asyncOptionListsSlice';
import type { ValueSelectorProps, VersatileSelectorProps } from '../types';
import { toOptions } from '../utils';

/**
 * Default `<select>` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const ValueSelector = <Opt extends FullOption = FullOption>(
  props: ValueSelectorProps<Opt>
): React.JSX.Element => {
  const { onChange, val } = useValueSelector(props);

  const selectElementChangeHandler = useSelectElementChangeHandler({
    multiple: props.multiple,
    onChange,
  });

  return (
    <select
      data-testid={props.testID}
      className={props.className}
      value={val}
      title={props.title}
      disabled={props.disabled}
      multiple={!!props.multiple}
      onChange={selectElementChangeHandler}>
      {toOptions(props.options)}
    </select>
  );
};

export type UseValueSelectorParams = Pick<
  ValueSelectorProps,
  'handleOnChange' | 'listsAsArrays' | 'multiple' | 'value'
>;

/**
 * Transforms a value into an array when appropriate and provides a memoized change handler.
 *
 * @group Hooks
 */
export const useValueSelector = (
  props: UseValueSelectorParams
): {
  /**
   * Memoized change handler for value selectors
   */
  onChange: (v: string | string[]) => void;
  /**
   * The value as provided or, if appropriate, as an array
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  val: string | any[] | undefined;
} => {
  const { handleOnChange, listsAsArrays = false, multiple = false, value } = props;

  const onChange = useCallback(
    (v: string | string[]) => {
      if (multiple) {
        const valueAsArray = toArray(v);
        handleOnChange(listsAsArrays ? valueAsArray : joinWith(valueAsArray, ','));
      } else {
        handleOnChange(v);
      }
    },
    [handleOnChange, listsAsArrays, multiple]
  );

  const val = useMemo(() => (multiple ? toArray(value) : value), [multiple, value]);

  return {
    onChange,
    val,
  };
};

export interface UseValueSelectorAsyncParams {
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
 * Augments a {@link ValueSelectorProps} object with async option loading.
 *
 * @group Hooks
 */
export const useValueSelectorAsync = (
  props: VersatileSelectorProps,
  params: UseValueSelectorAsyncParams
): UseValueSelectorAsync => {
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const { getCacheKey, cacheTTL, loadOptionList } = params;
  const { options: optionsProp, value } = props;

  const ruleOrGroup = props.rule ?? props.ruleGroup;

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
    // Spread all properties of `props`—in alphabetical order—to allow passing `props`
    // to `getCacheKey` function without having `props` in the dependency array.
    ...Object.keys(props)
      .toSorted()
      .map(k => params[k as keyof UseValueSelectorAsyncParams]),
  ]);
  // oxlint-enable exhaustive-deps

  const cached = useRQB_INTERNAL_QueryBuilderSelector(s =>
    asyncOptionListsSlice.selectors.selectCacheByKey(s, cacheKey)
  );

  const cacheIsValid = cached && Date.now() <= cached.validUntil;

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
    ...props,
    options,
    className,
    isLoading,
    errors,
  };
};
