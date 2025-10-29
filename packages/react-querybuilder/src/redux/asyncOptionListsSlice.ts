import type {
  FullOption,
  FullOptionList,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import { prepareOptionList } from '@react-querybuilder/core';
import type { AsyncThunk, AsyncThunkConfig, PayloadAction, Slice } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const DEFAULT_CACHE_TTL = 1_800_000; // 30 minutes

// Generic async thunk for fetching with cache check
export const getOptionListsAsync: AsyncThunk<
  { cacheKey: string; data: FullOptionList<FullOption>; fromCache: boolean },
  {
    cacheKey: string;
    cacheTTL?: number;
    value: string | undefined;
    ruleOrGroup?: RuleType | RuleGroupTypeAny;
    loadOptionList: (
      value: string | undefined,
      meta: { ruleOrGroup?: RuleType | RuleGroupTypeAny }
    ) => Promise<FullOptionList<FullOption>>;
  },
  AsyncThunkConfig
> = createAsyncThunk(
  'asyncOptionLists/asyncOptionListsThunk',
  async (params, { getState, rejectWithValue }) => {
    const { cacheKey, cacheTTL, value, loadOptionList } = params;
    const state = getState() as { asyncOptionLists: State };
    const cached = state.asyncOptionLists.cache[cacheKey];

    // Check if cache is still valid
    if (cached && Date.now() - cached.timestamp < (cacheTTL ?? DEFAULT_CACHE_TTL)) {
      return { cacheKey, data: cached.data, fromCache: true };
    }

    try {
      const rawList = await loadOptionList(value, params);
      // TODO?: accept additional params for this function
      const data = prepareOptionList({ optionList: rawList }).optionList;
      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
  {
    condition: ({ cacheKey }, { getState }) => {
      const state = getState() as { asyncOptionLists: State };
      const loading = state.asyncOptionLists.loading[cacheKey];
      return !loading;
    },
  }
);

interface CachedData {
  data: FullOptionList<FullOption>;
  timestamp: number;
  validUntil: number;
}

export interface AsyncOptionListsSliceState {
  cache: Record<string, CachedData>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

type State = AsyncOptionListsSliceState;

export const initialState: State = { cache: {}, loading: {}, errors: {} };

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
    selectCacheByKey: (state: State, cacheKey: string) => CachedData;
    selectIsLoadingByKey: (state: State, cacheKey: string) => boolean;
    selectErrorByKey: (state: State, cacheKey: string) => string | null;
  }
> = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    invalidateCache: (state, { payload }) => {
      delete state.cache[payload];
      delete state.errors[payload];
    },
    clearAllCache: state => {
      state.cache = {};
      state.errors = {};
      state.loading = {};
    },
  },
  selectors: {
    selectCache: state => state.cache,
    selectLoading: state => state.loading,
    selectErrors: state => state.errors,
    selectCacheByKey: (state, cacheKey) => state.cache[cacheKey] || null,
    selectIsLoadingByKey: (state, cacheKey) => state.loading[cacheKey] || false,
    selectErrorByKey: (state, cacheKey) => state.errors[cacheKey] || null,
  },
  extraReducers: builder => {
    builder
      .addCase(getOptionListsAsync.pending, (state, action) => {
        state.loading[action.meta.arg.cacheKey] = true;
        state.errors[action.meta.arg.cacheKey] = '';
      })
      .addCase(getOptionListsAsync.fulfilled, (state, action) => {
        const { cacheKey, data } = action.payload;
        state.cache[cacheKey] = {
          data,
          timestamp: Date.now(),
          validUntil: Date.now() + (action.meta.arg.cacheTTL ?? DEFAULT_CACHE_TTL),
        };
        state.loading[cacheKey] = false;
      })
      .addCase(getOptionListsAsync.rejected, (state, action) => {
        state.loading[action.meta.arg.cacheKey] = false;
        state.errors[action.meta.arg.cacheKey] = action.payload as string;
      });
  },
});
