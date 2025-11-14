import type { Store } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { queryBuilderStore } from '../store';

interface CounterState {
  value: number;
}

// oxlint-disable-next-line no-explicit-any
const getAnyState = (store: Store) => store.getState() as any;

it('adds a reducer', () => {
  const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 } as CounterState,
    reducers: {
      init: state => state,
      increment: state => void state.value++,
    },
    selectors: {
      selectValue: state => state.value,
    },
  });

  queryBuilderStore.addSlice(counterSlice);

  expect(queryBuilderStore.getState().queries).toEqual({});

  // Slice is lazy loaded, so needs to be initialized before selecting
  queryBuilderStore.dispatch(counterSlice.actions.init());

  expect(counterSlice.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(0);

  queryBuilderStore.dispatch(counterSlice.actions.increment());

  expect(counterSlice.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(1);
});
