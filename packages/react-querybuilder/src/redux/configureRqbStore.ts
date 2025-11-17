import type { Slice } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { storeCommon } from './_internal';
import { rootReducer } from './rootReducer';
import type { RqbStore } from './types';

// istanbul ignore next
export const configureRqbStore = (isDev?: boolean): RqbStore => {
  const queryBuilderStore = configureStore({
    ...storeCommon,
    devTools: {
      name: 'React Query Builder',
      autoPause: !(process.env.NODE_ENV !== 'production' || isDev),
    },
  }) as RqbStore;

  queryBuilderStore.addSlice = (slice: Slice) => {
    rootReducer.inject(slice);
    // Initialize the new slice with no-op action
    queryBuilderStore.dispatch({ type: crypto.randomUUID() });
  };

  return queryBuilderStore;
};
