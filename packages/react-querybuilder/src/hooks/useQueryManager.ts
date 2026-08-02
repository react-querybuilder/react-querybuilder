import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryManagerOptions,
  RuleGroupType,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { QueryManager } from '@react-querybuilder/core';
import { useState, useSyncExternalStore } from 'react';

/**
 * Subscribes to a {@link QueryManager} and returns its current query alongside the manager
 * itself. The component re-renders whenever the query changes.
 *
 * This hook is for headless or custom user interfaces built directly on `QueryManager`. It is
 * _not_ a replacement for the {@link QueryBuilder} component—it does not participate in the
 * Redux store, `QueryBuilderContext`, or `qbId` registry, so utilities keyed to those (like
 * `useQueryBuilderQuery` or `useQueryBuilderHistory`) will not see queries managed this way.
 *
 * @group Hooks
 */
export function useQueryManager<
  RG extends RuleGroupTypeAny = RuleGroupType,
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
  C extends FullCombinator = FullCombinator,
>(manager: QueryManager<RG, F, O, C>): [RG, QueryManager<RG, F, O, C>];
/**
 * Creates a {@link QueryManager} on the first render and subscribes to it, returning its current
 * query alongside the manager itself. The component re-renders whenever the query changes.
 *
 * The manager is created once and never recreated, so `query` is an _initial_ value and
 * `options` are captured on the first render only. Later changes to either argument are ignored.
 * To reconfigure the manager, construct it yourself and pass the instance instead.
 *
 * @group Hooks
 */
export function useQueryManager<
  RG extends RuleGroupTypeAny = RuleGroupType,
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
  C extends FullCombinator = FullCombinator,
>(query?: RG, options?: QueryManagerOptions<F, O, C>): [RG, QueryManager<RG, F, O, C>];
export function useQueryManager<
  RG extends RuleGroupTypeAny = RuleGroupType,
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
  C extends FullCombinator = FullCombinator,
>(
  managerOrQuery?: QueryManager<RG, F, O, C> | RG,
  options?: QueryManagerOptions<F, O, C>
): [RG, QueryManager<RG, F, O, C>] {
  // Only used when `managerOrQuery` is not already a QueryManager.
  const managerProvided = managerOrQuery instanceof QueryManager;

  // The initializer runs once, so passing a new query/options object on every render will not
  // recreate the manager. Nothing is constructed when the caller supplies their own instance.
  const [createdManager] = useState(() =>
    managerProvided ? undefined : new QueryManager<RG, F, O, C>(managerOrQuery as RG, options)
  );

  const manager = (managerProvided ? managerOrQuery : createdManager) as QueryManager<RG, F, O, C>;

  // `subscribe` and `getQuery` are both bound to the instance, so these references are stable.
  // `getQuery` doubles as the server snapshot: QueryManager has no React or DOM dependencies,
  // and the query is frozen and only replaced by reference on commit.
  const query = useSyncExternalStore(manager.subscribe, manager.getQuery, manager.getQuery);

  return [query, manager];
}
