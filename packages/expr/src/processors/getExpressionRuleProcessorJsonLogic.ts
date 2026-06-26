import type { RuleProcessor, RuleType, ValueProcessorOptions } from '@react-querybuilder/core';
import {
  defaultRuleProcessorJsonLogic,
  lc,
  parseNumber,
  shouldRenderAsNumber,
} from '@react-querybuilder/core';
import { defaultFunctions } from '../defaultFunctions';
import { getExpressions } from '../registry';
import type { ExpressionFunctionRegistry } from '../types';
import { serializeJsonLogic } from '../utils/serializeJsonLogic';
import { validateExpression } from '../utils/validateExpression';

const OPERATOR_MAP: Record<string, string> = {
  '=': '==',
  '!=': '!=',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
};

const renderLeaf = (rule: RuleType, opts: ValueProcessorOptions): unknown =>
  rule.valueSource === 'field'
    ? { var: `${rule.value}` }
    : shouldRenderAsNumber(rule.value, opts.parseNumbers)
      ? parseNumber(rule.value, { parseNumbers: opts.parseNumbers })
      : rule.value;

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "jsonlogic" format.
 * Rules without expressions, or with an unsupported operator, fall back to the stock
 * processor.
 */
export const getExpressionRuleProcessorJsonLogic =
  (registry?: ExpressionFunctionRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const reg = registry ?? defaultFunctions;
    const expr = getExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorJsonLogic(rule, opts);

    const operator = lc(rule.operator);
    const unary = operator === 'null' || operator === 'notnull';
    const jlOp = OPERATOR_MAP[operator];
    if (!unary && !jlOp) return defaultRuleProcessorJsonLogic(rule, opts);

    if (
      (expr.lhs && !validateExpression(expr.lhs, reg, 'jsonLogic').valid) ||
      (expr.rhs && !validateExpression(expr.rhs, reg, 'jsonLogic').valid)
    ) {
      return false;
    }

    const lhs = expr.lhs ? serializeJsonLogic(expr.lhs, reg) : { var: rule.field };
    if (unary) {
      return { [operator === 'notnull' ? '!=' : '==']: [lhs, null] };
    }

    const rhs = expr.rhs ? serializeJsonLogic(expr.rhs, reg) : renderLeaf(rule, opts);
    return { [jlOp]: [lhs, rhs] };
  };
