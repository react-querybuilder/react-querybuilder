import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { generateID, isRuleGroup, prepareRuleGroup } from '@react-querybuilder/core';
import { produce } from 'immer';
import type { RulesEngine, RulesEngineCondition, RulesEngineConditions } from '../types';
import { isRulesEngine } from './isRulesEngine';

/**
 * Options for {@link prepareRulesEngine}.
 */
export interface PreparerOptionsRE {
  idGenerator?: () => string;
}

/**
 * Ensures that a rule group is valid by recursively adding an `id` property to the group itself
 * and all its rules and subgroups where one does not already exist.
 */
export const prepareRulesEngine = (
  rulesEngine: RulesEngine,
  { idGenerator = generateID }: PreparerOptionsRE = {}
): RulesEngine =>
  produce(rulesEngine, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }
    draft.conditions = draft.conditions.map(r => {
      let newR = r.id ? r : { ...r, id: idGenerator() };
      if (isRuleGroup(newR)) {
        newR = prepareRuleGroup(newR);
      }
      if (isRulesEngine(newR)) {
        // oxlint-disable-next-line no-explicit-any
        newR = prepareRuleGroup(newR as RuleGroupTypeAny) as RulesEngineCondition<any>;
      }
      return newR;
      // oxlint-disable-next-line no-explicit-any
    }) as RulesEngineConditions<any>;
  });
