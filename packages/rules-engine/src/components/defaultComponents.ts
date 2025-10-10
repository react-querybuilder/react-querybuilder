import QueryBuilder from 'react-querybuilder';
import type { ComponentsRE } from '../types';
import { ActionElementRE } from './ActionElementRE';
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
import { ValueSelectorRE } from './ValueSelectorRE';

export const defaultComponentsRE: {
  actionBuilder: typeof RulesEngineActionBuilder;
  actionBuilderBody: typeof RulesEngineActionBuilderBody;
  actionBuilderHeader: typeof RulesEngineActionBuilderHeader;
  actionElement: typeof ActionElementRE;
  actionSelector: typeof ValueSelectorRE;
  addAction: typeof ActionElementRE;
  addCondition: typeof ActionElementRE;
  addSubcondition: typeof ActionElementRE;
  conditionBuilder: typeof RulesEngineConditionBuilder;
  conditionBuilderBody: typeof RulesEngineConditionBuilderBody;
  conditionBuilderCascade: typeof RulesEngineConditionCascade;
  conditionBuilderHeader: typeof RulesEngineConditionBuilderHeader;
  queryBuilder: typeof QueryBuilder;
  removeAction: typeof ActionElementRE;
  removeCondition: typeof ActionElementRE;
  rulesEngineBuilderHeader: typeof RulesEngineBuilderHeader;
  valueSelector: typeof ValueSelectorRE;
} = {
  actionBuilder: RulesEngineActionBuilder,
  actionBuilderBody: RulesEngineActionBuilderBody,
  actionBuilderHeader: RulesEngineActionBuilderHeader,
  actionElement: ActionElementRE,
  actionSelector: ValueSelectorRE,
  addAction: ActionElementRE,
  addCondition: ActionElementRE,
  addSubcondition: ActionElementRE,
  conditionBuilder: RulesEngineConditionBuilder,
  conditionBuilderBody: RulesEngineConditionBuilderBody,
  conditionBuilderCascade: RulesEngineConditionCascade,
  conditionBuilderHeader: RulesEngineConditionBuilderHeader,
  queryBuilder: QueryBuilder,
  removeAction: ActionElementRE,
  removeCondition: ActionElementRE,
  rulesEngineBuilderHeader: RulesEngineBuilderHeader,
  valueSelector: ValueSelectorRE,
} satisfies ComponentsRE;
