import type { ComponentsRE } from '../types';
import {
  RulesEngineActionBuilder,
  RulesEngineActionBuilderHeader,
} from './RulesEngineActionBuilder';
import {
  RulesEngineConditionBuilder,
  RulesEngineConditionBuilderHeader,
} from './RulesEngineConditionBuilder';

export const defaultComponentsRE: ComponentsRE = {
  actionBuilderHeader: RulesEngineActionBuilderHeader,
  actionBuilder: RulesEngineActionBuilder,
  conditionBuilder: RulesEngineConditionBuilder,
  conditionBuilderHeader: RulesEngineConditionBuilderHeader,
};
