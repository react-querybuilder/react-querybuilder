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
function useDeprecatedProps(
  type: 'independentCombinators',
  logWarning: boolean,
  otherParams: 'invalid' | 'unnecessary'
): void;
function useDeprecatedProps(type: 'rule' | 'ruleGroup', logWarning: boolean): void;
function useDeprecatedProps(
  /** Type of error to be logged, if logWarning is true. */
  type: 'independentCombinators' | 'rule' | 'ruleGroup',
  /** If true, the error (well...warning, really) will be logged. */
  logWarning: boolean,
  otherParams?: 'invalid' | 'unnecessary'
) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && logWarning) {
      if (type === 'independentCombinators') {
        if (!didWarnUsingInvalidIndependentCombinatorsProp && otherParams === 'invalid') {
          console.error(errorInvalidIndependentCombinatorsProp);
          didWarnUsingInvalidIndependentCombinatorsProp = true;
        }
        if (!didWarnUsingUnnecessaryIndependentCombinatorsProp && otherParams === 'unnecessary') {
          console.error(errorUnnecessaryIndependentCombinatorsProp);
          didWarnUsingUnnecessaryIndependentCombinatorsProp = true;
        }
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
  }, [logWarning, otherParams, type]);
}

export { useDeprecatedProps };
