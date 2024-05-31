import { messages } from '../messages';
import { rqbWarn, useRQB_INTERNAL_QueryBuilderDispatch } from '../redux/_internal';

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
  const dispatch = useRQB_INTERNAL_QueryBuilderDispatch();
  if (process.env.NODE_ENV !== 'production' && logWarning) {
    if (type === 'independentCombinators') {
      if (otherParams === 'invalid') {
        dispatch(rqbWarn(messages.errorInvalidIndependentCombinatorsProp));
      }

      if (otherParams === 'unnecessary') {
        dispatch(rqbWarn(messages.errorUnnecessaryIndependentCombinatorsProp));
      }
    }

    if (type === 'rule') {
      dispatch(rqbWarn(messages.errorDeprecatedRuleProps));
    }

    if (type === 'ruleGroup') {
      dispatch(rqbWarn(messages.errorDeprecatedRuleGroupProps));
    }
  }
}

export { useDeprecatedProps };
