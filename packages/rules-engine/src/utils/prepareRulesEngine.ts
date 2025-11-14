import { generateID, isRuleGroup, prepareRuleGroup } from '@react-querybuilder/core';
import { produce } from 'immer';
import type { REConditionAny, REConditionCascade, RulesEngineAny } from '../types';
import { isRulesEngineAny } from './isRulesEngine';

/**
 * Options for {@link prepareRulesEngine}.
 */
export interface PreparerOptionsRE {
  idGenerator?: () => string;
}

export const prepareRulesEngineCondition = (
  c: REConditionAny,
  { idGenerator = generateID }: PreparerOptionsRE = {}
): REConditionAny =>
  produce(c, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }

    if (isRuleGroup(draft.antecedent)) {
      draft.antecedent = prepareRuleGroup(draft.antecedent, { idGenerator });
    }

    if (isRulesEngineAny(draft)) {
      draft = prepareRulesEngine(draft);
    }

    return draft;
  });

/**
 * Ensures that a rule group is valid by recursively adding an `id` property to the group itself
 * and all its rules and subgroups where one does not already exist.
 */
export const prepareRulesEngine = <RE extends RulesEngineAny>(
  rulesEngine: RE,
  { idGenerator = generateID }: PreparerOptionsRE = {}
): RE =>
  produce(rulesEngine, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }

    draft.conditions = draft.conditions.map(r =>
      prepareRulesEngineCondition(r, { idGenerator })
    ) as REConditionCascade<any>; // oxlint-disable-line no-explicit-any
  });
