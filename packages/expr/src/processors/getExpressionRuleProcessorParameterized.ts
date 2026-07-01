import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorParameterized,
  getQuotedFieldName,
  lc,
  mapSQLOperator,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultParameterizedSerializers } from '../functions/parameterized';
import { getRuleExpressions } from '../registry';
import type { ParameterizedSerializerRegistry } from '../types';
import type { ParameterizedSerializeContext } from '../utils/serializeParameterized';
import { serializeParameterized } from '../utils/serializeParameterized';
import { validateExpression } from '../utils/validateExpression';

const SCALAR_OPERATORS = new Set(['=', '!=', '<', '<=', '>', '>=']);

const safeParamBase = (field: string): string => (/^[A-Za-z_]\w*$/.test(field) ? field : 'expr');

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "parameterized" and
 * "parameterized_named" formats. Pass custom `serializers` to add functions or override
 * built-ins; they are merged over {@link defaultParameterizedSerializers}. Bound values are
 * pushed following the standard accumulator contract. Rules without expressions, or with an
 * unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorParameterized =
  (serializers?: ParameterizedSerializerRegistry): RuleProcessor =>
  (rule, options, meta) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultParameterizedSerializers, ...serializers }
      : defaultParameterizedSerializers;
    const expr = getRuleExpressions(rule);
    const parameterized = opts.format !== 'parameterized_named';
    const empty = () => ({ sql: '', params: parameterized ? [] : {} });

    if (!expr || (!expr.lhs && !expr.rhs)) {
      return defaultRuleProcessorParameterized(rule, opts, meta);
    }

    const operator = lc(mapSQLOperator(rule.operator));
    const unary = operator === 'is null' || operator === 'is not null';
    if (!unary && !SCALAR_OPERATORS.has(operator)) {
      return defaultRuleProcessorParameterized(rule, opts, meta);
    }

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid)
    ) {
      return empty();
    }

    const processedParams = meta?.processedParams;
    const ctx: ParameterizedSerializeContext = {
      serializers: serial,
      options: opts,
      parameterized,
      processedParamsLength: Array.isArray(processedParams) ? processedParams.length : 0,
      paramBase: safeParamBase(rule.field),
      params: [],
      paramsNamed: {},
    };

    const lhs = expr.lhs
      ? serializeParameterized(expr.lhs, ctx)
      : getQuotedFieldName(rule.field, opts);

    let sql: string;
    if (unary) {
      sql = `${lhs} ${operator}`.trim();
    } else {
      const rhs = expr.rhs
        ? serializeParameterized(expr.rhs, ctx)
        : rule.valueSource === 'field'
          ? getQuotedFieldName(`${rule.value}`, opts)
          : serializeParameterized({ kind: 'value', value: rule.value }, ctx);
      sql = `${lhs} ${operator} ${rhs}`.trim();
    }

    return { sql, params: parameterized ? ctx.params : ctx.paramsNamed };
  };
