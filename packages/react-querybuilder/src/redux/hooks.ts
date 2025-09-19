import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import { createSelectorHook } from 'react-redux';
import { QueryBuilderContext } from '../context';
import { QueryBuilderStateContext } from './QueryBuilderStateContext';
import { getQuerySelectorById } from './selectors';
import type { RqbState } from './types';

// #region Hooks
const useRQB_INTERNAL_QueryBuilderSelector: TypedUseSelectorHook<RqbState> =
  createSelectorHook(QueryBuilderStateContext);

/**
 * A Redux `useSelector` hook for RQB's internal store. See also {@link getQuerySelectorById}.
 *
 * **TIP:** Prefer {@link useQueryBuilderQuery} if you only need to access the query object
 * for the nearest ancestor {@link QueryBuilder} component.
 *
 * @group Hooks
 */
export const useQueryBuilderSelector: TypedUseSelectorHook<RqbState> = (selector, other) => {
  const rqbContext = React.useContext(QueryBuilderContext);
  // TODO: Why is `as` necessary here?
  const result = useRQB_INTERNAL_QueryBuilderSelector(selector, other as undefined);
  return result ?? rqbContext?.initialQuery;
};

/**
 * Retrieves the full, latest query object for the nearest ancestor {@link QueryBuilder}
 * component.
 *
 * The optional parameter should only be used when retrieving a query object from a different
 * {@link QueryBuilder} than the nearest ancestor. It can be a full props object as passed
 * to a custom component or any object matching the interface `{ schema: { qbId: string } }`.
 *
 * Must follow React's [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning).
 *
 * @group Hooks
 */
export const useQueryBuilderQuery = (props?: { schema: { qbId: string } }): RuleGroupTypeAny => {
  const rqbContext = React.useContext(QueryBuilderContext);
  return (
    useRQB_INTERNAL_QueryBuilderSelector(
      getQuerySelectorById(props?.schema.qbId ?? rqbContext.qbId ?? /* istanbul ignore next */ '')
    ) ?? rqbContext?.initialQuery
  );
};
// #endregion
