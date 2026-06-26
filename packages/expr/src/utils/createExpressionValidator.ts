import type {
  QueryValidator,
  RuleGroupTypeAny,
  RuleType,
  ValidationMap,
} from '@react-querybuilder/core';
import { isRuleGroup } from '@react-querybuilder/core';
import { getExpressions, mergeFunctions } from '../registry';
import type { ExpressionFunctionRegistry } from '../types';
import { validateExpression } from './validateExpression';

/**
 * Configure-once factory returning a `QueryValidator` that flags rules whose `lhs`/`rhs`
 * expressions are invalid — unknown function, arity mismatch, or empty field reference —
 * checked against `functions` merged over the built-in {@link defaultFunctions} (the same
 * merge `QueryBuilderExpressions` and {@link createExpressionProcessors} apply, so one
 * registry drives the UI, export processors, and validation alike).
 *
 * The returned validator produces a sparse {@link ValidationMap}: only invalid,
 * expression-bearing rules get an entry (`{ valid: false, reasons }`), keyed by `rule.id`.
 * Rules without expressions, valid rules, and rules lacking an `id` are omitted and thus
 * treated as valid. Validation is format-agnostic — it does not check per-format
 * serializers; the rule processors handle serializer presence per export format.
 *
 * Pass the result as `formatQuery`'s `validator` option to annotate `format: 'diagnostics'`
 * output and to skip invalid rules from standard exports, or to a `<QueryBuilder>`'s
 * `validator` prop for live in-UI feedback.
 */
export const createExpressionValidator = (
  functions?: ExpressionFunctionRegistry
): QueryValidator => {
  const registry = mergeFunctions(functions);

  const reasonsFor = (rule: RuleType): string[] => {
    const expr = getExpressions(rule);
    if (!expr) return [];
    const reasons: string[] = [];
    if (expr.lhs) reasons.push(...validateExpression(expr.lhs, registry).reasons);
    if (expr.rhs) reasons.push(...validateExpression(expr.rhs, registry).reasons);
    return reasons;
  };

  return (query: RuleGroupTypeAny): ValidationMap => {
    const map: ValidationMap = {};
    const walk = (group: RuleGroupTypeAny): void => {
      for (const rOrG of group.rules) {
        if (typeof rOrG === 'string') continue; // independent-combinator string
        if (isRuleGroup(rOrG)) {
          walk(rOrG);
        } else if (rOrG.id) {
          const reasons = reasonsFor(rOrG);
          if (reasons.length > 0) map[rOrG.id] = { valid: false, reasons };
        }
      }
    };
    walk(query);
    return map;
  };
};
