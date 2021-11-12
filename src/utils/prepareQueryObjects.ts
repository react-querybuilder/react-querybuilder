import produce from 'immer';
import { generateID } from '.';
import type { RuleGroupTypeAny, RuleType } from '../types';

export const prepareRule = (rule: RuleType) =>
  produce(rule, (draft) => {
    if (!draft.id) {
      draft.id = `r-${generateID()}`;
    }
  });

/**
 * Generates a valid query object
 */
export const prepareRuleGroup = <RG extends RuleGroupTypeAny>(queryObject: RG): RG =>
  produce(queryObject, (draft) => {
    if (!draft.id) {
      draft.id = `g-${generateID()}`;
    }
    draft.rules = draft.rules.map((r) =>
      typeof r === 'string' ? r : 'rules' in r ? prepareRuleGroup(r) : prepareRule(r)
    );
    draft.not = !!draft.not;
  });
