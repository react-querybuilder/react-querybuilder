import { QueryBuilder } from 'react-querybuilder';
import type { ComponentsRE } from '../types';
import { RulesEngineActionBuilder } from './RulesEngineActionBuilder';
import { RulesEngineActionBuilderBody } from './RulesEngineActionBuilderBody';
import { RulesEngineActionBuilderHeader } from './RulesEngineActionBuilderHeader';
import { RulesEngineBuilderHeader } from './RulesEngineBuilderHeader';
import {
  RulesEngineConditionBuilder,
  RulesEngineConditionBuilderBody,
  RulesEngineConditionBuilderHeader,
} from './RulesEngineConditionBuilder';
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';

export const defaultComponentsRE: ComponentsRE = {
  rulesEngineBuilderHeader: RulesEngineBuilderHeader,
  actionBuilder: RulesEngineActionBuilder,
  actionBuilderHeader: RulesEngineActionBuilderHeader,
  actionBuilderBody: RulesEngineActionBuilderBody,
  conditionBuilder: RulesEngineConditionBuilder,
  conditionBuilderHeader: RulesEngineConditionBuilderHeader,
  conditionBuilderBody: RulesEngineConditionBuilderBody,
  conditionBuilderCascade: RulesEngineConditionCascade,
  queryBuilder: QueryBuilder,
};
