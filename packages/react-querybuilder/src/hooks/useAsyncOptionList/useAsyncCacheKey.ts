import { useMemo } from 'react';
import type { ValueEditorProps, VersatileSelectorProps } from '../../types';
import type { UseAsyncOptionListParams } from './types';

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
