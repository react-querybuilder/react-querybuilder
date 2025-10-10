import type { RegenerateIdOptions } from '@react-querybuilder/core';
import { generateID, isPojo, isRuleGroup, regenerateIDs } from '@react-querybuilder/core';
import type { RulesEngine, RulesEngineAny, RulesEngineConditionAny } from '../types';
import { isRulesEngineAny, isRulesEngineConditionAny } from './isRulesEngine';

/**
 * Recursively generates new `id` properties for a rule group or rules engine and all
 * its rules/conditions and subgroups/subconditions.
 */
export const regenerateREIDs = <REC extends RulesEngineAny | RulesEngineConditionAny>(
  subject: REC,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): REC & { id: string } => {
  if (!isPojo(subject)) return subject;

  if (!isRuleGroup(subject) && !isRulesEngineAny(subject)) {
    return structuredClone({
      ...subject,
      id: idGenerator(),
    }) as REC & { id: string };
  }

  const newRE: RulesEngineConditionAny | RulesEngineAny = { ...subject, id: idGenerator() };

  if (isRulesEngineConditionAny(newRE)) {
    newRE.condition = regenerateIDs(newRE.condition);
  }

  if (isRulesEngineAny(subject)) {
    newRE.conditions = (subject as RulesEngine).conditions.map(re =>
      regenerateREIDs(re, { idGenerator })
    );
  }

  if (newRE.defaultAction) {
    newRE.defaultAction.id = idGenerator();
  }

  return newRE as REC & { id: string };
};
