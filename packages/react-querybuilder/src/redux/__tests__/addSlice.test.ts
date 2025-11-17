import type { Store } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { queryBuilderStore } from '../store';

interface CounterState {
  value: number;
}

const getAnyState = (store: Store) => store.getState();

it('adds a reducer', () => {
  const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 } as CounterState,
    reducers: {
      increment: state => void state.value++,
    },
    selectors: {
      selectValue: state => state.value,
    },
  });

  queryBuilderStore.addSlice(counterSlice);

  expect(queryBuilderStore.getState()).toHaveProperty('queries', {});
  expect(counterSlice.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(0);

  queryBuilderStore.dispatch(counterSlice.actions.increment());
  expect(counterSlice.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(1);
});
