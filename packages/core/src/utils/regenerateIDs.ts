import type { SetRequired } from 'type-fest';
import type { RuleGroupTypeAny, RuleType } from '../types';
import { generateID } from './generateID';
import { isRuleGroup } from './isRuleGroup';
import { isPojo } from './misc';

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
 * Recursively generates new `id` properties for a rule group and all its rules and subgroups.
 */
export const regenerateIDs = <RG>(
  subject: RG,
  { idGenerator = generateID }: RegenerateIdOptions = {}
): RG & { id: string } => {
  if (!isPojo(subject)) return subject as RG & { id: string };

  if (!isRuleGroup(subject)) {
    return structuredClone({
      ...subject,
      id: idGenerator(),
    }) as RG & { id: string };
  }

  const newGroup = { ...subject, id: idGenerator() } as RuleGroupTypeAny;

  // istanbul ignore else
  if (Array.isArray(newGroup.rules)) {
    // oxlint-disable-next-line no-explicit-any
    (newGroup.rules as any) = subject.rules.map((r: unknown) =>
      typeof r === 'string'
        ? r
        : isRuleGroup(r)
          ? regenerateIDs(r, { idGenerator })
          : regenerateID(r as RuleType, { idGenerator })
    );
  }

  return newGroup as unknown as RG & { id: string };
};
