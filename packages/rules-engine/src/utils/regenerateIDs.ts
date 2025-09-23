import type { RuleGroupTypeAny, RuleType } from 'react-querybuilder';
import { generateID, isPojo, isRuleGroup } from 'react-querybuilder';
import type { SetRequired } from 'type-fest';
import type { RulesEngine } from '../types';
import { isRulesEngineAny } from './isRulesEngine';

/**
 * Options object for {@link regenerateID}/{@link regenerateIDs}.
 */
export interface RegenerateIdOptions {
  idGenerator?: () => string;
}

/**
 * Generates a new `id` property for a rule.
 */
export const regenerateID = <R extends RuleType>(
  rule: R,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): SetRequired<R, 'id'> => structuredClone({ ...rule, id: idGenerator() } as SetRequired<R, 'id'>);

/**
 * Recursively generates new `id` properties for a rule group or rules engine and all
 * its rules/conditions and subgroups/subconditions.
 */
export const regenerateIDs = <RG>(
  subject: RG,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): RG & { id: string } => {
  if (!isPojo(subject)) return subject as RG & { id: string };

  if (!isRuleGroup(subject) && !isRulesEngineAny(subject)) {
    return structuredClone({
      ...subject,
      id: idGenerator(),
    }) as RG & { id: string };
  }

  const newGroup = { ...subject, id: idGenerator() } as RulesEngine & RuleGroupTypeAny;

  if (Array.isArray(newGroup.rules)) {
    newGroup.rules = subject.rules.map((r: unknown) =>
      typeof r === 'string'
        ? r
        : isRuleGroup(r)
          ? regenerateIDs(r, { idGenerator })
          : regenerateID(r as RuleType, { idGenerator })
    );
  }

  if (Array.isArray(newGroup.conditions)) {
    newGroup.conditions = subject.conditions.map((r: unknown) => regenerateIDs(r, { idGenerator }));
  }

  return newGroup as unknown as RG & { id: string };
};
