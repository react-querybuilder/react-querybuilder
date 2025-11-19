import { configureStore } from '@reduxjs/toolkit';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render as og_render } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import type { asyncOptionListsSlice } from '../hooks/useAsyncOptionList/asyncOptionListsSlice';
import type { RqbState } from '../redux';
import { QueryBuilderStateContext } from '../redux';
import { queriesSlice } from '../redux/queriesSlice';
import { warningsSlice } from '../redux/warningsSlice';

// #region Redux stuff

const preloadedState = {
  queries: queriesSlice.getInitialState(),
  warnings: warningsSlice.getInitialState(),
} as RqbState;

const initialAsyncOptionListState = { cache: {}, loading: {}, errors: {} };
const asyncOptionListsReducer: (typeof asyncOptionListsSlice)['reducer'] = () =>
  initialAsyncOptionListState;

const getNewStore = () =>
  configureStore({
    reducer: {
      queries: queriesSlice.reducer,
      warnings: warningsSlice.reducer,
      asyncOptionLists: asyncOptionListsReducer,
    },
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
export const render = (
  ui: React.ReactElement,
  renderOptions: RenderOptions = {}
  // oxlint-disable-next-line typescript/consistent-type-imports
): RenderResult<typeof import('@testing-library/dom/types/queries'), HTMLElement, HTMLElement> =>
  og_render(ui, { wrapper: Wrapper, ...renderOptions });

// #endregion
