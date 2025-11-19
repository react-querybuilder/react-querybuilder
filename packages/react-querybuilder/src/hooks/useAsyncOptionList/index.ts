import { clsx, standardClassnames } from '@react-querybuilder/core';
import { useEffect, useMemo } from 'react';
import { injectSlice, QueryBuilderStateContext } from 'react-querybuilder';
import { getInternalHooks } from '../../redux/_internal/hooks';
import type { ValueEditorProps, VersatileSelectorProps } from '../../types';
import { asyncOptionListsSlice, getOptionListsAsync } from './asyncOptionListsSlice';
import type { UseAsyncOptionList, UseAsyncOptionListParams } from './types';
import { useAsyncCacheKey } from './useAsyncCacheKey';

export * from './asyncOptionListsSlice';
export * from './types';
export * from './useAsyncCacheKey';

const { useRQB_INTERNAL_QueryBuilderDispatch, useRQB_INTERNAL_QueryBuilderSelector } =
  getInternalHooks(QueryBuilderStateContext);

injectSlice(asyncOptionListsSlice);

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
