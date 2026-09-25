import type { Store } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { getRqbStore, injectSlice } from '../getRqbStore';

const getAnyState = (store: Store) => store.getState();

it('adds a slice with addSlice', () => {
  const counterSliceAS = createSlice({
    name: 'counter-as',
    initialState: { value: 0 },
    reducers: { increment: state => void state.value++ },
    selectors: { selectValue: state => state.value },
  });

  const queryBuilderStore = getRqbStore();

  queryBuilderStore.addSlice(counterSliceAS);

  expect(queryBuilderStore.getState()).toHaveProperty('queries', {});
  expect(counterSliceAS.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(0);

  queryBuilderStore.dispatch(counterSliceAS.actions.increment());
  expect(counterSliceAS.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(1);
});

// Hermes (RN iOS/Android) has no global `crypto`; module-level injectSlice calls must not throw
it('adds a slice without global crypto', async () => {
  vi.stubGlobal('crypto', undefined);
  vi.resetModules();
  try {
    const { configureRqbStore } = await import('../configureRqbStore');
    const store = configureRqbStore();
    const slice = createSlice({
      name: 'counter-nc',
      initialState: { value: 0 },
      reducers: {},
      selectors: { selectValue: state => state.value },
    });
    expect(() => store.addSlice(slice)).not.toThrow();
    expect(slice.selectors.selectValue(getAnyState(store))).toBe(0);
  } finally {
    vi.unstubAllGlobals();
    vi.resetModules();
  }
});

it('adds a slice with injectSlice', () => {
  const counterSliceIS = createSlice({
    name: 'counter-is',
    initialState: { value: 0 },
    reducers: { increment: state => void state.value++ },
    selectors: { selectValue: state => state.value },
  });

  injectSlice(counterSliceIS);

  const queryBuilderStore = getRqbStore();

  expect(queryBuilderStore.getState()).toHaveProperty('queries', {});
  expect(counterSliceIS.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(0);

  queryBuilderStore.dispatch(counterSliceIS.actions.increment());
  expect(counterSliceIS.selectors.selectValue(getAnyState(queryBuilderStore))).toBe(1);
});
