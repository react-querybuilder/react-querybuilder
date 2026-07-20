import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorTanStackDB,
  lc,
  parseNumber,
  shouldRenderAsNumber,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultTanStackDbSerializers } from '../functions/tanstackDb';
import { getRuleExpressions } from '../registry';
import type { TanStackDbSerializerRegistry } from '../types';
import type { TanStackDbSerializeContext } from '../utils/serializeTanStackDb';
import { serializeTanStackDb } from '../utils/serializeTanStackDb';
import { validateExpression } from '../utils/validateExpression';

const SCALAR = new Set(['=', '!=', '<', '<=', '>', '>=']);
const BETWEEN_OPERATORS = new Set(['between', 'notbetween']);
// TanStack DB's `like` takes a static string pattern, so a string-match against an
// expression operand can't be expressed; such rules are omitted (see below).
const STRING_MATCH_OPERATORS = new Set([
  'contains',
  'doesnotcontain',
  'beginswith',
  'doesnotbeginwith',
  'endswith',
  'doesnotendwith',
]);

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "tanstack_db" format.
 * Expression rules compose TanStack DB expressions from ref columns (arithmetic via
 * `add`/`subtract`/…, `upper`/`lower`). Requires the same `context` the stock processor
 * needs: `tanStackDbOperators`, `_tanstackDbRefs`, and `_tanstackDbPrimaryRef`. Pass custom
 * `serializers` to add functions or override built-ins; they are merged over
 * {@link defaultTanStackDbSerializers}. Rules without expressions, missing context, or with
 * an unsupported operator/function, fall back to the stock processor (or are omitted).
 */
export const getExpressionRuleProcessorTanStackDB =
  (serializers?: TanStackDbSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultTanStackDbSerializers, ...serializers }
      : defaultTanStackDbSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorTanStackDB(rule, opts);

    const context = (opts.context ?? {}) as {
      tanStackDbOperators?: Record<string, (...args: unknown[]) => unknown>;
      _tanstackDbRefs?: Record<string, Record<string, unknown>>;
      _tanstackDbPrimaryRef?: string;
    };
    const ops = context.tanStackDbOperators;
    const refs = context._tanstackDbRefs;
    const primaryRef = context._tanstackDbPrimaryRef;
    if (!ops || !refs || !primaryRef) return defaultRuleProcessorTanStackDB(rule, opts);

    const resolveField = (fieldName: string): unknown => {
      const dotIdx = fieldName.indexOf('.');
      if (dotIdx > 0) {
        const prefix = fieldName.slice(0, dotIdx);
        const rest = fieldName.slice(dotIdx + 1);
        if (refs[prefix]) return refs[prefix][rest];
      }
      return refs[primaryRef][fieldName];
    };

    const operator = lc(rule.operator);
    const unary = operator === 'null' || operator === 'notnull';
    const scalar = SCALAR.has(operator);
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    // A string-match against an expression operand isn't expressible via TanStack DB's
    // static-pattern `like`; omit the rule rather than emit an invalid pattern.
    if (STRING_MATCH_OPERATORS.has(operator)) return undefined;
    if (!unary && !scalar && !betweenExpr) return defaultRuleProcessorTanStackDB(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return undefined;
    }

    const ctx: TanStackDbSerializeContext = { ops, resolveField };
    const ser = (n: NonNullable<typeof expr.lhs>) => serializeTanStackDb(n, serial, ctx, opts);
    const lhs = expr.lhs ? ser(expr.lhs) : resolveField(rule.field);

    const { eq, gt, gte, lt, lte, and, not, isNull } = ops as Record<
      string,
      (...args: unknown[]) => unknown
    >;

    if (unary) {
      const nullExpr = isNull(lhs);
      return operator === 'notnull' ? not(nullExpr) : nullExpr;
    }

    const operand = (node: (typeof expr)['rhs'], raw: unknown): unknown =>
      node
        ? ser(node)
        : rule.valueSource === 'field'
          ? resolveField(`${raw}`)
          : shouldRenderAsNumber(raw, opts.parseNumbers)
            ? parseNumber(raw, { parseNumbers: opts.parseNumbers })
            : raw;

    if (betweenExpr) {
      if (!expr.rhs || !expr.rhs2) return undefined;
      const range = and(gte(lhs, ser(expr.rhs)), lte(lhs, ser(expr.rhs2)));
      return operator === 'notbetween' ? not(range) : range;
    }

    const rhsRaw = Array.isArray(rule.value) ? rule.value[0] : rule.value;
    const rhs = operand(expr.rhs, rhsRaw);
    switch (operator) {
      case '=':
        return eq(lhs, rhs);
      case '!=':
        return not(eq(lhs, rhs));
      case '>':
        return gt(lhs, rhs);
      case '<':
        return lt(lhs, rhs);
      case '>=':
        return gte(lhs, rhs);
      // v8 ignore next -- exhaustive; '<=' is the only remaining scalar operator
      default:
        return lte(lhs, rhs);
    }
  };
