import produce from 'immer';
import generateID from './generateID';
import type { RuleGroupArray, RuleGroupICArray, RuleGroupTypeAny, RuleType } from '../types';

/**
 * Generates a valid rule
 */
export const prepareRule = (rule: RuleType) =>
  produce(rule, (draft) => {
    if (!draft.id) {
      draft.id = `r-${generateID()}`;
    }
  });

/**
 * Generates a valid rule group
 */
export const prepareRuleGroup = <RG extends RuleGroupTypeAny>(queryObject: RG): RG =>
  produce(queryObject, (draft) => {
    if (!draft.id) {
      draft.id = `g-${generateID()}`;
    }
    draft.rules = draft.rules.map((r) =>
      typeof r === 'string' ? r : 'rules' in r ? prepareRuleGroup(r) : prepareRule(r)
    ) as RuleGroupArray | RuleGroupICArray;
    draft.not = !!draft.not;
  });
