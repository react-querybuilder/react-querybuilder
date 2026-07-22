import type {
  DefaultOperatorName,
  RuleProcessor,
  RuleType,
  ValueProcessorOptions,
} from '@react-querybuilder/core';
import {
  betweenOperators,
  defaultRuleProcessorJsonLogic,
  lc,
  parseNumber,
  shouldRenderAsNumber,
  substringOperators,
} from '@react-querybuilder/core';
import { defaultJsonLogicSerializers } from '../functions/jsonLogic';
import { defaultFunctionMeta } from '../functions/meta';
import { getRuleExpressions } from '../registry';
import type { JsonLogicSerializerRegistry } from '../types';
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

const STRING_OPERATORS = new Set([...substringOperators].map(lc));

const BETWEEN_OPERATORS = new Set<string>([...betweenOperators].map(lc));

// Builds a JSONLogic string-match rule from resolved operands, mirroring the stock processor:
// `contains` → `in`, `beginsWith` → `startsWith`, `endsWith` → `endsWith`; `doesNot*` negates.
const buildStringOp = (operatorLC: string, lhs: unknown, rhs: unknown): object => {
  const negate = (r: object) => (operatorLC.startsWith('doesnot') ? { '!': r } : r);
  switch (operatorLC) {
    case 'contains':
    case 'doesnotcontain':
      return negate({ in: [rhs, lhs] });
    case 'beginswith':
    case 'doesnotbeginwith':
      return negate({ startsWith: [lhs, rhs] });
    default:
      return negate({ endsWith: [lhs, rhs] });
  }
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
 * Pass custom `serializers` to add functions or override built-ins; they are merged over
 * {@link defaultJsonLogicSerializers}. Rules without expressions, or with an unsupported
 * operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorJsonLogic =
  (serializers?: JsonLogicSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultJsonLogicSerializers, ...serializers }
      : defaultJsonLogicSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorJsonLogic(rule, opts);

    const operator = lc(rule.operator);
    const unary = operator === 'null' || operator === 'notnull';
    const jlOp = OPERATOR_MAP[operator];
    const stringOp = STRING_OPERATORS.has(operator as DefaultOperatorName);
    // Between is supported only with expression-sourced bounds; a plain-value between defers
    // to the stock processor (which handles number parsing/ordering/field sources).
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    if (!unary && !jlOp && !stringOp && !betweenExpr)
      return defaultRuleProcessorJsonLogic(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return false;
    }

    const lhs = expr.lhs ? serializeJsonLogic(expr.lhs, serial, opts) : { var: rule.field };
    if (unary) {
      return { [operator === 'notnull' ? '!=' : '==']: [lhs, null] };
    }

    if (betweenExpr) {
      // Both bounds are required; an incomplete expression between omits the rule.
      // json-logic-js supports a 3-arg `<=` as `from <= lhs <= to`; negate for notBetween.
      if (!expr.rhs || !expr.rhs2) return false;
      const from = serializeJsonLogic(expr.rhs, serial, opts);
      const to = serializeJsonLogic(expr.rhs2, serial, opts);
      const jsonRule = { '<=': [from, lhs, to] };
      return operator === 'notbetween' ? { '!': jsonRule } : jsonRule;
    }

    const rhs = expr.rhs ? serializeJsonLogic(expr.rhs, serial, opts) : renderLeaf(rule, opts);
    return stringOp ? buildStringOp(operator, lhs, rhs) : { [jlOp]: [lhs, rhs] };
  };
