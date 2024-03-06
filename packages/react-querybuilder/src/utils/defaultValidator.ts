import { defaultCombinators, groupInvalidReasons } from '../defaults';
import type {
  QueryValidator,
  RuleGroupTypeAny,
  RuleType,
  ValidationMap,
} from '../types/index.noReact';
import { isRuleGroup, isRuleGroupType } from './isRuleGroup';

/**
 * This is an example validation function you can pass to {@link QueryBuilder} in the
 * `validator` prop. It assumes that you want to validate groups, and has a no-op
 * for validating rules which you can replace with your own implementation.
 */
export const defaultValidator: QueryValidator = query => {
  const result: ValidationMap = {};

  const validateRule = (_rule: RuleType) => {
    // Replace this with your custom implementation.
    // Inside this function, set `result[_rule.id] = true` for a valid
    // rule, or `{ valid: false, reasons: ['your', 'reasons', 'here'] }`
    // for an invalid rule.
  };

  const validateGroup = (rg: RuleGroupTypeAny) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reasons: any[] = [];
    if (rg.rules.length === 0) {
      reasons.push(groupInvalidReasons.empty);
    } else if (!isRuleGroupType(rg)) {
      // Odd indexes should be valid combinators and even indexes should be rules or groups
      let invalidICs = false;
      for (let i = 0; i < rg.rules.length && !invalidICs; i++) {
        if (
          (i % 2 === 0 && typeof rg.rules[i] === 'string') ||
          (i % 2 === 1 && typeof rg.rules[i] !== 'string') ||
          (i % 2 === 1 &&
            typeof rg.rules[i] === 'string' &&
            !defaultCombinators.map(c => c.name as string).includes(rg.rules[i] as string))
        ) {
          invalidICs = true;
        }
      }
      if (invalidICs) {
        reasons.push(groupInvalidReasons.invalidIndependentCombinators);
      }
    }
    // Non-independent combinators should be valid, but only checked if there are multiple rules
    // since combinators don't really apply to groups with only one rule/group
    if (
      isRuleGroupType(rg) &&
      !defaultCombinators.map(c => c.name as string).includes(rg.combinator) &&
      rg.rules.length > 1
    ) {
      reasons.push(groupInvalidReasons.invalidCombinator);
    }
    /* istanbul ignore else */
    if (rg.id) {
      if (reasons.length) {
        result[rg.id] = { valid: false, reasons };
      } else {
        result[rg.id] = true;
      }
    }
    rg.rules.forEach(r => {
      if (typeof r === 'string') {
        // Validation for this case was done earlier
      } else if (isRuleGroup(r)) {
        validateGroup(r);
      } else {
        validateRule(r);
      }
    });
  };

  validateGroup(query);

  return result;
  // You can return the result object itself like above, or if you just
  // want the entire query to be marked invalid if _any_ rules/groups are
  // invalid, return a boolean like this:
  //   return Object.values(result).map(rv => (typeof rv !== 'boolean')).includes(true);
  // That will return `true` if no errors were found.
};
