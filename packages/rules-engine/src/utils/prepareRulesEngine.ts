import { generateID, isRuleGroup, prepareRuleGroup } from '@react-querybuilder/core';
import { produce } from 'immer';
import type { RulesEngineAny, RulesEngineConditions } from '../types';
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
export const prepareRulesEngine = <RE extends RulesEngineAny>(
  rulesEngine: RE,
  { idGenerator = generateID }: PreparerOptionsRE = {}
): RE =>
  produce(rulesEngine, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }
    draft.conditions = draft.conditions.map(r => {
      r.id = idGenerator();
      if (isRuleGroup(r.condition)) {
        r.condition = prepareRuleGroup(r.condition);
      }
      if (isRulesEngine(r)) {
        r = prepareRulesEngine(r);
      }
      return r;
      // oxlint-disable-next-line no-explicit-any
    }) as RulesEngineConditions<any>;
  });
