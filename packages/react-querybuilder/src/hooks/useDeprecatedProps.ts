import { useEffect } from 'react';
import {
  errorInvalidIndependentCombinatorsProp,
  errorUnnecessaryIndependentCombinatorsProp,
  errorDeprecatedRuleGroupProps,
  errorDeprecatedRuleProps,
} from '../messages';

let didWarnUsingInvalidIndependentCombinatorsProp = false;
let didWarnUsingUnnecessaryIndependentCombinatorsProp = false;
let didWarnUsingDeprecatedRuleProps = false;
let didWarnUsingDeprecatedRuleGroupProps = false;

/**
 * Logs a warning if the {@link RuleGroup} which rendered the component does not pass
 * the new `rule` or `ruleGroup` prop.
 */
export const useDeprecatedProps = (
  /** Type of error to be logged, if logWarning is true. */
  type: 'invalid-ic' | 'unnecessary-ic' | 'rule' | 'ruleGroup',
  /** If true, the error (warning, really) will be logged. */
  logWarning: boolean
) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && logWarning) {
      if (type === 'invalid-ic' && !didWarnUsingInvalidIndependentCombinatorsProp) {
        console.error(errorInvalidIndependentCombinatorsProp);
        didWarnUsingInvalidIndependentCombinatorsProp = true;
      }

      if (type === 'unnecessary-ic' && !didWarnUsingUnnecessaryIndependentCombinatorsProp) {
        console.error(errorUnnecessaryIndependentCombinatorsProp);
        didWarnUsingUnnecessaryIndependentCombinatorsProp = true;
      }

      if (type === 'rule' && !didWarnUsingDeprecatedRuleProps) {
        console.error(errorDeprecatedRuleProps);
        didWarnUsingDeprecatedRuleProps = true;
      }

      if (type === 'ruleGroup' && !didWarnUsingDeprecatedRuleGroupProps) {
        console.error(errorDeprecatedRuleGroupProps);
        didWarnUsingDeprecatedRuleGroupProps = true;
      }
    }
  }, [logWarning, type]);
};
