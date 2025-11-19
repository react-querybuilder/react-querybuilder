import type {
  BaseOption,
  FlexibleOptionListProp,
  FullOption,
  FullOptionList,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import type { WithSlice } from '@reduxjs/toolkit';
import type { ValueEditorProps, VersatileSelectorProps } from '../../types';
import type { asyncOptionListsSlice } from './asyncOptionListsSlice';

declare module '../../redux/rootReducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof asyncOptionListsSlice> {}
}

declare module '../../redux/types' {
  export interface RqbState {
    asyncOptionLists: AsyncOptionListsSliceState;
  }
}

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
   * Can be one of the following:
   * 1. The rule/group attribute to use as the cache key (`string`),
   * 2. A list of rule/group attributes to use as the cache key (`string[]`), or
   * 3. A function that generates the cache key based on the props (`(props: PropsType) => string`).
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

export interface GeneratedUseAsyncOptionList {
  /**
   * Augments a {@link ValueSelectorProps} object with async option loading.
   *
   * @group Hooks
   */
  (
    props: VersatileSelectorProps,
    params?: UseAsyncOptionListParams<VersatileSelectorProps>
  ): UseAsyncOptionList<VersatileSelectorProps>;
  /**
   * Augments a {@link ValueEditorProps} object with async option (`values`) loading.
   *
   * @group Hooks
   */
  (
    props: ValueEditorProps,
    params?: UseAsyncOptionListParams<ValueEditorProps>
  ): UseAsyncOptionList<ValueEditorProps>;
}

export type CacheKeys = [string, ...string[]];

export interface CachedOptionList {
  data: FullOptionList<FullOption>;
  timestamp: number;
  validUntil: number;
}

export interface AsyncOptionListsSliceState {
  cache: Record<string, CachedOptionList>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}
