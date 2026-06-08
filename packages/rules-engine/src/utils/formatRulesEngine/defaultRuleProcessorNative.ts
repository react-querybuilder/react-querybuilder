import type { RuleProcessor } from '@react-querybuilder/core';
import type { NativePredicate } from '../../types';
import { getFactValue, nativeOperators } from './nativeOperators';

/**
 * Default rule processor for the `"native"` export format. Compiles a single rule into a
 * {@link NativePredicate} that evaluates the rule's operator (via {@link nativeOperators}) against
 * the fact identified by the rule's `field`. Unknown operators evaluate to `false`.
 *
 * @group Export
 */
export const defaultRuleProcessorNative: RuleProcessor = (rule, _opts): NativePredicate => {
  const evaluate = nativeOperators[rule.operator] ?? (() => false);
  return facts => evaluate(getFactValue(facts, rule.field), rule.value);
};
