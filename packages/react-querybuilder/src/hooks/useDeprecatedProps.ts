import { messages } from '../messages';

let didWarnUsingInvalidIndependentCombinatorsProp = false;
let didWarnUsingUnnecessaryIndependentCombinatorsProp = false;
let didWarnUsingDeprecatedRuleProps = false;
let didWarnUsingDeprecatedRuleGroupProps = false;

/**
 * Logs an error to the console if any of the following are true:
 * - `QueryBuilder` is rendered with an `independentCombinators` prop
 * - `RuleGroup` is rendered with `combinator` or `rules` props (deprecated in favor of `ruleGroup`)
 * - `Rule` is rendered with `field`, `operator`, or `value` props (deprecated in favor of `rule`)
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
  if (process.env.NODE_ENV !== 'production' && logWarning) {
    if (type === 'independentCombinators') {
      if (!didWarnUsingInvalidIndependentCombinatorsProp && otherParams === 'invalid') {
        console.error(messages.errorInvalidIndependentCombinatorsProp);
        didWarnUsingInvalidIndependentCombinatorsProp = true;
      }
      if (!didWarnUsingUnnecessaryIndependentCombinatorsProp && otherParams === 'unnecessary') {
        console.error(messages.errorUnnecessaryIndependentCombinatorsProp);
        didWarnUsingUnnecessaryIndependentCombinatorsProp = true;
      }
    }

    if (type === 'rule' && !didWarnUsingDeprecatedRuleProps) {
      console.error(messages.errorDeprecatedRuleProps);
      didWarnUsingDeprecatedRuleProps = true;
    }

    if (type === 'ruleGroup' && !didWarnUsingDeprecatedRuleGroupProps) {
      console.error(messages.errorDeprecatedRuleGroupProps);
      didWarnUsingDeprecatedRuleGroupProps = true;
    }
  }
}

export { useDeprecatedProps };
