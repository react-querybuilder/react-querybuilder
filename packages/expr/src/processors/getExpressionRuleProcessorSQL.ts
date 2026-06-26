import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorSQL,
  defaultValueProcessorByRule,
  getQuotedFieldName,
  lc,
  mapSQLOperator,
} from '@react-querybuilder/core';
import { defaultFunctions } from '../defaultFunctions';
import { getExpressions } from '../registry';
import type { ExpressionFunctionRegistry } from '../types';
import { serializeSQL } from '../utils/serializeSQL';
import { validateExpression } from '../utils/validateExpression';

const SCALAR_OPERATORS = new Set(['=', '!=', '<', '<=', '>', '>=']);

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "sql" format. Rules
 * without expressions, or with an unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorSQL =
  (registry?: ExpressionFunctionRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const reg = registry ?? defaultFunctions;
    const expr = getExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorSQL(rule, opts);

    const operator = lc(mapSQLOperator(rule.operator));
    const unary = operator === 'is null' || operator === 'is not null';
    if (!unary && !SCALAR_OPERATORS.has(operator)) return defaultRuleProcessorSQL(rule, opts);

    if (
      (expr.lhs && !validateExpression(expr.lhs, reg, 'sql').valid) ||
      (expr.rhs && !validateExpression(expr.rhs, reg, 'sql').valid)
    ) {
      return '';
    }

    const lhs = expr.lhs ? serializeSQL(expr.lhs, reg, opts) : getQuotedFieldName(rule.field, opts);
    if (unary) return `${lhs} ${operator}`.trim();

    const rhs = expr.rhs
      ? serializeSQL(expr.rhs, reg, opts)
      : (opts.valueProcessor ?? defaultValueProcessorByRule)(rule, opts);
    return `${lhs} ${operator} ${rhs}`.trim();
  };
