import { QueryBuilder } from 'react-querybuilder';
import type { ComponentsRE } from '../types';
import {
  RulesEngineActionBuilder,
  RulesEngineActionBuilderBody,
  RulesEngineActionBuilderHeader,
} from './RulesEngineActionBuilder';
import {
  RulesEngineConditionBuilder,
  RulesEngineConditionBuilderBody,
  RulesEngineConditionBuilderHeader,
} from './RulesEngineConditionBuilder';
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';

export const defaultComponentsRE: ComponentsRE = {
  actionBuilder: RulesEngineActionBuilder,
  actionBuilderHeader: RulesEngineActionBuilderHeader,
  actionBuilderBody: RulesEngineActionBuilderBody,
  conditionBuilder: RulesEngineConditionBuilder,
  conditionBuilderHeader: RulesEngineConditionBuilderHeader,
  conditionBuilderBody: RulesEngineConditionBuilderBody,
  conditionBuilderCascade: RulesEngineConditionCascade,
  queryBuilder: QueryBuilder,
};
