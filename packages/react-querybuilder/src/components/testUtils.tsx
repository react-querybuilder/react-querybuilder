import type { RenderOptions } from '@testing-library/react';
import { act, render as og_render } from '@testing-library/react';
import * as React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import type { RqbState } from '../redux';
import { QueryBuilderStateContext } from '../redux';
import { warningsSlice } from '../redux/warningsSlice';
import { queriesSlice } from '../redux/queriesSlice';

export const waitABeat = async () => {
  await act(async () => {
    await new Promise(r => setTimeout(r, 10));
  });
};

// #region Redux stuff

const preloadedState = {
  queries: queriesSlice.getInitialState(),
  warnings: warningsSlice.getInitialState(),
} satisfies RqbState;

const getNewStore = () =>
  configureStore({
    reducer: { queries: queriesSlice.reducer, warnings: warningsSlice.reducer },
    preloadedState,
  });

const Wrapper = ({ children }: React.PropsWithChildren) => {
  const [store] = React.useState(getNewStore);
  return (
    <Provider store={store} context={QueryBuilderStateContext}>
      {children}
    </Provider>
  );
};

/**
 * Use this render instead of the one directly from `@testing-library/react` when
 * the component being tested needs access to the Redux store.
 */
export const render = (ui: React.ReactElement, renderOptions: RenderOptions = {}) =>
  og_render(ui, { wrapper: Wrapper, ...renderOptions });

// #endregion
