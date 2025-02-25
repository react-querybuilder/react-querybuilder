import * as React from 'react';
import { Provider } from 'react-redux';
import { QueryBuilderStateContext, queryBuilderStore } from '../redux';

/**
 * Context provider for the `{@link QueryBuilder}` state store.
 *
 * @group Components
 */
export const QueryBuilderStateProvider = (props: {
  children: React.ReactNode;
}): React.JSX.Element => (
  <Provider context={QueryBuilderStateContext} store={queryBuilderStore}>
    {props.children}
  </Provider>
);
