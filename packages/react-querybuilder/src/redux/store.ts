import { configureStore } from '@reduxjs/toolkit';
import { storeCommon } from './_internal';
import type { RqbStore } from './types';

export const queryBuilderStore: RqbStore = configureStore({
  ...storeCommon,
  devTools: false,
});
