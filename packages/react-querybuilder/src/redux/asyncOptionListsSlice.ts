import type { PayloadAction, Slice, WithSlice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_CACHE_TTL, getOptionListsAsync } from './getOptionListsAsync';
import { rootReducer } from './rootReducer';
import type { AsyncOptionListsSliceState, CachedOptionList } from './types';

export { DEFAULT_CACHE_TTL, getOptionListsAsync };

type State = AsyncOptionListsSliceState;

const initialState: State = { cache: {}, loading: {}, errors: {} };

const sliceName = 'asyncOptionLists';

export const asyncOptionListsSlice: Slice<
  State,
  {
    invalidateCache: (state: State, action: PayloadAction<string>) => void;
    clearAllCache: (state: State) => void;
  },
  typeof sliceName,
  typeof sliceName,
  {
    selectCache: (state: State) => typeof state.cache;
    selectLoading: (state: State) => typeof state.loading;
    selectErrors: (state: State) => typeof state.errors;
    selectCacheByKey: (state: State, cacheKey: string) => CachedOptionList;
    selectIsLoadingByKey: (state: State, cacheKey: string) => boolean;
    selectErrorByKey: (state: State, cacheKey: string) => string | null;
  }
> = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    invalidateCache: /* istanbul ignore next */ (state, { payload }) => {
      delete state.cache[payload];
      delete state.errors[payload];
    },
    clearAllCache: /* istanbul ignore next */ state => {
      state.cache = {};
      state.errors = {};
      state.loading = {};
    },
  },
  // prettier-ignore
  selectors: {
    selectCache: /* istanbul ignore next */ state => state.cache,
    selectLoading: /* istanbul ignore next */ state => state.loading,
    selectErrors: /* istanbul ignore next */ state => state.errors,
    selectCacheByKey: /* istanbul ignore next */ (state, cacheKey) => state.cache[cacheKey] || null,
    selectIsLoadingByKey: /* istanbul ignore next */ (state, cacheKey) => state.loading[cacheKey] || false,
    selectErrorByKey: /* istanbul ignore next */ (state, cacheKey) => {
      const error = state.errors[cacheKey];
      return error && error !== '' ? error : null;
    },
  },
  extraReducers: builder => {
    builder.addAsyncThunk(getOptionListsAsync, {
      pending: (state, action) => {
        state.loading[action.meta.arg.cacheKey] = true;
        state.errors[action.meta.arg.cacheKey] = '';
      },
      fulfilled: (state, action) => {
        const { cacheKey, data } = action.payload;
        state.cache[cacheKey] = {
          data,
          timestamp: Date.now(),
          validUntil:
            Date.now() + (action.meta.arg.cacheTTL ?? /* istanbul ignore next */ DEFAULT_CACHE_TTL),
        };
        state.loading[cacheKey] = false;
      },
      rejected: (state, action) => {
        state.loading[action.meta.arg.cacheKey] = false;
        state.errors[action.meta.arg.cacheKey] = action.payload as string;
      },
    });
  },
});

declare module './rootReducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof asyncOptionListsSlice> {}
}

rootReducer.inject(asyncOptionListsSlice);
