import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorParameterized,
  getLikeWildcards,
  getQuotedFieldName,
  lc,
  mapSQLOperator,
  relationalOperators,
  wrapLikeFragment,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultParameterizedSerializers } from '../functions/parameterized';
import { getRuleExpressions } from '../registry';
import type { ParameterizedSerializerRegistry } from '../types';
import type { ParameterizedSerializeContext } from '../utils/serializeParameterized';
import { serializeParameterized } from '../utils/serializeParameterized';
import { validateExpression } from '../utils/validateExpression';

const SCALAR_OPERATORS = new Set<string>(relationalOperators);
const LIKE_OPERATORS = new Set(['like', 'not like']);
const BETWEEN_OPERATORS = new Set(['between', 'not between']);

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
    // Between is supported only with expression-sourced bounds; a plain-value between defers
    // to the stock processor (which handles number parsing/ordering/field sources).
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    if (
      !unary &&
      !betweenExpr &&
      !SCALAR_OPERATORS.has(operator) &&
      !LIKE_OPERATORS.has(operator)
    ) {
      return defaultRuleProcessorParameterized(rule, opts, meta);
    }

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
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
    } else if (betweenExpr) {
      // Both bounds are required; an incomplete expression between omits the rule. Serialize
      // the lower bound first so its bound params precede the upper bound's.
      if (!expr.rhs || !expr.rhs2) return empty();
      const from = serializeParameterized(expr.rhs, ctx);
      const to = serializeParameterized(expr.rhs2, ctx);
      sql = `${lhs} ${operator} ${from} and ${to}`;
    } else {
      const isLike = LIKE_OPERATORS.has(operator);
      let rhs: string;
      if (expr.rhs) {
        // Expression RHS: `%` wildcards are concatenated in SQL around the fragment.
        const frag = serializeParameterized(expr.rhs, ctx);
        rhs = isLike ? wrapLikeFragment(frag, lc(rule.operator), opts) : frag;
      } else if (rule.valueSource === 'field') {
        // Field RHS: inline the quoted field name, concatenating `%` wildcards in SQL.
        const frag = getQuotedFieldName(`${rule.value}`, opts);
        rhs = isLike ? wrapLikeFragment(frag, lc(rule.operator), opts) : frag;
      } else if (isLike) {
        // Plain literal RHS: bake the wildcards into the bound param (matching the stock
        // processor), so the SQL stays `<lhs> like ?`.
        const [pre, post] = getLikeWildcards(lc(rule.operator));
        rhs = serializeParameterized({ kind: 'value', value: `${pre}${rule.value}${post}` }, ctx);
      } else {
        rhs = serializeParameterized({ kind: 'value', value: rule.value }, ctx);
      }
      sql = `${lhs} ${operator} ${rhs}`.trim();
    }

    return { sql, params: parameterized ? ctx.params : ctx.paramsNamed };
  };
