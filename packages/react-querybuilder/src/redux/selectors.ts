import type { RuleGroupTypeAny } from '../types/index.noReact';
import { queriesSlice } from './queriesSlice';
import type { RqbState } from './types';

/**
 * Given a `qbId` (passed to every component as part of the `schema` prop), returns
 * a Redux selector for use with {@link useQueryBuilderSelector}.
 *
 * Note that {@link useQueryBuilderQuery} is a more concise way of accessing the
 * query for the nearest ancestor {@link QueryBuilder} component.
 */
export const getQuerySelectorById =
  (qbId: string) =>
  (state: RqbState): RuleGroupTypeAny =>
    queriesSlice.selectors.getQuerySelectorById({ queries: state.queries }, qbId);
