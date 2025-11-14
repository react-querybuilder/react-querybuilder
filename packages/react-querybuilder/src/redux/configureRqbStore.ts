import type { Slice } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { storeCommon } from './_internal';
import { rootReducer } from './rootReducer';
import type { RqbStore } from './types';

export const configureRqbStore = (devTools?: boolean): RqbStore => {
  const queryBuilderStore = configureStore({
    ...storeCommon,
    devTools: devTools ? { name: 'React Query Builder' } : false,
  }) as RqbStore;

  queryBuilderStore.addSlice = (slice: Slice) => {
    rootReducer.inject(slice);
  };

  return queryBuilderStore;
};
