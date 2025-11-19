import type { Slice } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { storeCommon } from './_internal';
import { rootReducer } from './rootReducer';
import type { RqbStore } from './types';

export const configureRqbStore = (devTools?: boolean): RqbStore => {
  const queryBuilderStore = configureStore({
    ...storeCommon,
    devTools: devTools ? /* istanbul ignore next */ { name: 'React Query Builder' } : false,
  }) as RqbStore;

  queryBuilderStore.addSlice = (slice: Slice) => {
    rootReducer.inject(slice);
    // Initialize state for the new slice. This action is a no-op because
    // the `type` is random and will never match any reducers.
    queryBuilderStore.dispatch({
      type: crypto.randomUUID().slice(0, 8),
      meta: `Initializing state for slice "${slice.name}"`,
    });
  };

  return queryBuilderStore;
};
