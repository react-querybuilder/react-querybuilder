import { clsx, standardClassnames } from '@react-querybuilder/core';
import { useEffect, useMemo } from 'react';
import type { QueryBuilderStateContext, queryBuilderStore } from 'react-querybuilder';
import type {
  QueryBuilderStateContext as QueryBuilderStateContextDebug,
  queryBuilderStore as queryBuilderStoreDebug,
} from 'react-querybuilder/debug';
import { getInternalHooks } from '../../redux/_internal/hooks';
import { asyncOptionListsSlice, getOptionListsAsync } from '../../redux/asyncOptionListsSlice';
import type { ValueEditorProps, VersatileSelectorProps } from '../../types';
import type { GeneratedUseAsyncOptionList, UseAsyncOptionListParams } from './types';
import { useAsyncCacheKey } from './useAsyncCacheKey';

export const generateUseAsyncOptionList = (
  store: typeof queryBuilderStore | typeof queryBuilderStoreDebug,
  ctx: typeof QueryBuilderStateContext | typeof QueryBuilderStateContextDebug
): GeneratedUseAsyncOptionList => {
  const { useRQB_INTERNAL_QueryBuilderDispatch, useRQB_INTERNAL_QueryBuilderSelector } =
    getInternalHooks(ctx as typeof QueryBuilderStateContext);

  store.addSlice(asyncOptionListsSlice);

  const useAsyncOptionList = <PropsType extends VersatileSelectorProps | ValueEditorProps>(
    props: PropsType,
    params: UseAsyncOptionListParams<PropsType> = {}
  ) => {
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
  };

  return useAsyncOptionList;
};
