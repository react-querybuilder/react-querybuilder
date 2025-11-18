import type { RulesEngineAny } from '../types';

export type RulesEngineSliceState = Record<string, RulesEngineAny>;

export interface RqbState {
  rulesEngines: RulesEngineSliceState;
}
