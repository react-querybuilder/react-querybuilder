import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorSQL,
  defaultValueProcessorByRule,
  getQuotedFieldName,
  lc,
  mapSQLOperator,
  relationalOperators,
  wrapLikeFragment,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultSQLSerializers } from '../functions/sql';
import { getRuleExpressions } from '../registry';
import type { SQLSerializerRegistry } from '../types';
import { serializeSQL } from '../utils/serializeSQL';
import { validateExpression } from '../utils/validateExpression';

const SCALAR_OPERATORS = new Set<string>(relationalOperators);
const LIKE_OPERATORS = new Set(['like', 'not like']);
const BETWEEN_OPERATORS = new Set(['between', 'not between']);

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "sql" format. Pass
 * custom `serializers` to add functions or override built-ins; they are merged over
 * {@link defaultSQLSerializers}. Rules without expressions, or with an unsupported
 * operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorSQL =
  (serializers?: SQLSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultSQLSerializers, ...serializers }
      : defaultSQLSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorSQL(rule, opts);

    const operator = lc(mapSQLOperator(rule.operator));
    const unary = operator === 'is null' || operator === 'is not null';
    // `between`/`not between` are supported only when the range bounds are expression-sourced;
    // a plain-value between (even with an LHS expression) defers to the stock processor, which
    // already handles number parsing, ordering, and field-source nuances.
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    if (
      !unary &&
      !betweenExpr &&
      !SCALAR_OPERATORS.has(operator) &&
      !LIKE_OPERATORS.has(operator)
    ) {
      return defaultRuleProcessorSQL(rule, opts);
    }

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return '';
    }

    const lhs = expr.lhs
      ? serializeSQL(expr.lhs, serial, opts)
      : getQuotedFieldName(rule.field, opts);
    if (unary) return `${lhs} ${operator}`.trim();

    if (betweenExpr) {
      // Both bounds are required; an incomplete expression between omits the rule.
      if (!expr.rhs || !expr.rhs2) return '';
      const from = serializeSQL(expr.rhs, serial, opts);
      const to = serializeSQL(expr.rhs2, serial, opts);
      return `${lhs} ${operator} ${from} and ${to}`;
    }

    // An expression RHS needs its `LIKE` wildcards concatenated in SQL (the fragment is an
    // expression, not a literal); a plain value/field RHS is handled by the stock value
    // processor, which already wildcard-wraps for `LIKE`.
    const rhs = expr.rhs
      ? LIKE_OPERATORS.has(operator)
        ? wrapLikeFragment(serializeSQL(expr.rhs, serial, opts), lc(rule.operator), opts)
        : serializeSQL(expr.rhs, serial, opts)
      : (opts.valueProcessor ?? defaultValueProcessorByRule)(rule, opts);
    return `${lhs} ${operator} ${rhs}`.trim();
  };
