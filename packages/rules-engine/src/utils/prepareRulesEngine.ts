import { generateID, isRuleGroup, prepareRuleGroup } from '@react-querybuilder/core';
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
): REConditionAny => {
  const needsId = !c.id;
  const hasRuleGroup = isRuleGroup(c.antecedent);
  const isRulesEngineCondition = isRulesEngineAny(c);

  if (!needsId && !hasRuleGroup && !isRulesEngineCondition) {
    return c;
  }

  const updates: Partial<REConditionAny> = {};

  if (needsId) {
    updates.id = idGenerator();
  }

  if (hasRuleGroup) {
    const preparedAntecedent = prepareRuleGroup(c.antecedent, { idGenerator });
    if (preparedAntecedent !== c.antecedent) {
      updates.antecedent = preparedAntecedent;
    }
  }

  if (isRulesEngineCondition) {
    let nestedConditionsChanged = false;
    const preparedConditions: REConditionAny[] = [];

    for (let i = 0; i < c.conditions.length; i++) {
      const prepared = prepareRulesEngineCondition(c.conditions[i], { idGenerator });
      preparedConditions.push(prepared);
      if (prepared !== c.conditions[i]) {
        nestedConditionsChanged = true;
      }
    }

    if (nestedConditionsChanged) {
      updates.conditions = preparedConditions as any; // oxlint-disable-line no-explicit-any
    }
  }

  return Object.keys(updates).length > 0 ? ({ ...c, ...updates } as REConditionAny) : c;
};

/**
 * Ensures that a rule group is valid by recursively adding an `id` property to the group itself
 * and all its rules and subgroups where one does not already exist.
 */
export const prepareRulesEngine = <RE extends RulesEngineAny>(
  rulesEngine: RE,
  { idGenerator = generateID }: PreparerOptionsRE = {}
): RE => {
  const needsId = !rulesEngine.id;
  let conditionsChanged = false;
  const newConditions: REConditionAny[] = [];

  for (let i = 0; i < rulesEngine.conditions.length; i++) {
    const prepared = prepareRulesEngineCondition(rulesEngine.conditions[i], { idGenerator });
    newConditions.push(prepared);
    if (prepared !== rulesEngine.conditions[i]) {
      conditionsChanged = true;
    }
  }

  if (!needsId && !conditionsChanged) {
    return rulesEngine;
  }

  return {
    ...rulesEngine,
    ...(needsId && { id: idGenerator() }),
    conditions: newConditions as REConditionCascade<any>, // oxlint-disable-line no-explicit-any
  };
};
