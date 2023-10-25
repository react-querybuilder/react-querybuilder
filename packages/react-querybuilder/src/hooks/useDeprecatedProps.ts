import { useEffect } from 'react';
import { errorDeprecatedRuleGroupProps, errorDeprecatedRuleProps } from '../messages';

let didWarnUsingDeprecatedRuleProps = false;
let didWarnUsingDeprecatedRuleGroupProps = false;

/**
 * Logs a warning if the {@link RuleGroup} which rendered the component does not pass
 * the new `rule` or `ruleGroup` prop.
 */
export const useDeprecatedProps = (type: 'rule' | 'ruleGroup', newPropPresent: boolean) => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      type === 'rule' &&
      !newPropPresent &&
      !didWarnUsingDeprecatedRuleProps
    ) {
      console.error(errorDeprecatedRuleProps);
      didWarnUsingDeprecatedRuleProps = true;
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      type === 'ruleGroup' &&
      !newPropPresent &&
      !didWarnUsingDeprecatedRuleGroupProps
    ) {
      console.error(errorDeprecatedRuleGroupProps);
      didWarnUsingDeprecatedRuleGroupProps = true;
    }
  }, [newPropPresent, type]);
};
