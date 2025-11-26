import type { RulesEngineAny } from '../types';
import { rulesEngineSlice } from './rulesEngineSlice';
import type { RqbState } from './types';

/**
 * Given a `reId` (passed to every component as part of the `schema` prop), returns
 * a Redux selector for use with {@link useRulesEngineBuilderSelector}.
 *
 * Note that {@link useRulesEngineBuilderRulesEngine} is a more concise way of accessing the
 * query for the nearest ancestor {@link RulesEngineBuilder} component.
 */
export const getRulesEngineSelectorById =
  (reId: string) =>
  (state: RqbState): RulesEngineAny =>
    rulesEngineSlice.selectors.getRulesEngineSelectorById(
      { rulesEngines: state.rulesEngines },
      reId
    );
