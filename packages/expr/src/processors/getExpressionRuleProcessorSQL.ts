import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorSQL,
  defaultValueProcessorByRule,
  getQuotedFieldName,
  lc,
  mapSQLOperator,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultSQLSerializers } from '../functions/sql';
import { getRuleExpressions } from '../registry';
import type { SQLSerializerRegistry } from '../types';
import { serializeSQL } from '../utils/serializeSQL';
import { validateExpression } from '../utils/validateExpression';

const SCALAR_OPERATORS = new Set(['=', '!=', '<', '<=', '>', '>=']);

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
    if (!unary && !SCALAR_OPERATORS.has(operator)) return defaultRuleProcessorSQL(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid)
    ) {
      return '';
    }

    const lhs = expr.lhs
      ? serializeSQL(expr.lhs, serial, opts)
      : getQuotedFieldName(rule.field, opts);
    if (unary) return `${lhs} ${operator}`.trim();

    const rhs = expr.rhs
      ? serializeSQL(expr.rhs, serial, opts)
      : (opts.valueProcessor ?? defaultValueProcessorByRule)(rule, opts);
    return `${lhs} ${operator} ${rhs}`.trim();
  };
