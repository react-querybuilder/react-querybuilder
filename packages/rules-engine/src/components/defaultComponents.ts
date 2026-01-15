import { QueryBuilder } from 'react-querybuilder';
import type { ComponentsRE } from '../types';
import { ActionElementRE } from './ActionElementRE';
import { ConsequentBuilder } from './ConsequentBuilder';
import { ConsequentBuilderBody } from './ConsequentBuilderBody';
import { ConsequentBuilderHeader } from './ConsequentBuilderHeader';
import { RulesEngineBuilderHeader } from './RulesEngineBuilderHeader';
import {
  ConditionBuilderHeader,
  RulesEngineConditionBuilder,
  RulesEngineConditionBuilderBody,
} from './RulesEngineConditionBuilder';
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';
import { ValueSelectorRE } from './ValueSelectorRE';

/**
 * Default components used by {@link RulesEngineBuilder}.
 *
 * @group Defaults
 */
export const defaultComponentsRE: {
  consequentBuilder: typeof ConsequentBuilder;
  consequentBuilderBody: typeof ConsequentBuilderBody;
  consequentBuilderHeader: typeof ConsequentBuilderHeader;
  actionElement: typeof ActionElementRE;
  consequentSelector: typeof ValueSelectorRE;
  addConsequent: typeof ActionElementRE;
  addCondition: typeof ActionElementRE;
  addSubcondition: typeof ActionElementRE;
  conditionBuilder: typeof RulesEngineConditionBuilder;
  conditionBuilderBody: typeof RulesEngineConditionBuilderBody;
  conditionBuilderCascade: typeof RulesEngineConditionCascade;
  conditionBuilderHeader: typeof ConditionBuilderHeader;
  queryBuilder: typeof QueryBuilder;
  removeConsequent: typeof ActionElementRE;
  removeCondition: typeof ActionElementRE;
  rulesEngineBuilderHeader: typeof RulesEngineBuilderHeader;
  valueSelector: typeof ValueSelectorRE;
} = {
  consequentBuilder: ConsequentBuilder,
  consequentBuilderBody: ConsequentBuilderBody,
  consequentBuilderHeader: ConsequentBuilderHeader,
  actionElement: ActionElementRE,
  consequentSelector: ValueSelectorRE,
  addConsequent: ActionElementRE,
  addCondition: ActionElementRE,
  addSubcondition: ActionElementRE,
  conditionBuilder: RulesEngineConditionBuilder,
  conditionBuilderBody: RulesEngineConditionBuilderBody,
  conditionBuilderCascade: RulesEngineConditionCascade,
  conditionBuilderHeader: ConditionBuilderHeader,
  queryBuilder: QueryBuilder,
  removeConsequent: ActionElementRE,
  removeCondition: ActionElementRE,
  rulesEngineBuilderHeader: RulesEngineBuilderHeader,
  valueSelector: ValueSelectorRE,
} satisfies ComponentsRE;
