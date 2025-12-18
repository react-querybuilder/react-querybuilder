// import { useContext } from 'react';
// import { QueryBuilderContext } from 'react-querybuilder';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RulesEngineAny } from '../types';
import { useRQB_INTERNAL_QueryBuilderSelector } from './_internal';
import { getRulesEngineSelectorById } from './selectors';
import type { RqbState } from './types';

/**
 * A Redux `useSelector` hook for RQB's internal store. See also {@link getRulesEngineSelectorById}.
 *
 * **TIP:** Prefer {@link useRulesEngineBuilderRulesEngine} if you only need to access the query object
 * for the nearest ancestor {@link RulesEngineBuilder} component.
 *
 * @group Hooks
 */
export const useRulesEngineBuilderSelector: TypedUseSelectorHook<RqbState> = (selector, other) => {
  // const rqbContext = useContext(QueryBuilderContext);
  // TODO: Why is `as` necessary here?
  const result = useRQB_INTERNAL_QueryBuilderSelector(selector, other as undefined);
  // return result ?? rqbContext?.initialRulesEngine;
  return result;
};

/**
 * Retrieves the full, latest rules engine object for the nearest ancestor {@link RulesEngineBuilder}
 * component.
 *
 * The optional parameter should only be used when retrieving a rules engine object from a different
 * {@link RulesEngineBuilder} than the nearest ancestor. It can be a full props object as passed
 * to a custom component or any object matching the interface `{ schema: { reId: string } }`.
 *
 * Must follow React's [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning).
 *
 * @group Hooks
 */
export const useRulesEngineBuilderRulesEngine = (props?: {
  schema: { reId: string };
}): RulesEngineAny => {
  // const rqbContext = useContext(QueryBuilderContext);
  return useRQB_INTERNAL_QueryBuilderSelector(
    // @ts-expect-error TODO: define reId
    getRulesEngineSelectorById(props?.schema.reId) //?? rqbContext.reId ?? /* istanbul ignore next */ '')
  ); // ?? rqbContext?.initialRulesEngine
};
