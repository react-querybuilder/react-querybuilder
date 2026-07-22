import type { RuleProcessor } from '@react-querybuilder/core';
import {
  betweenOperators,
  defaultRuleProcessorDrizzle,
  lc,
  parseNumber,
  shouldRenderAsNumber,
} from '@react-querybuilder/core';
import { defaultDrizzleSerializers } from '../functions/drizzle';
import { defaultFunctionMeta } from '../functions/meta';
import { getRuleExpressions } from '../registry';
import type { DrizzleSerializerRegistry, DrizzleSqlTag } from '../types';
import { serializeDrizzle } from '../utils/serializeDrizzle';
import { validateExpression } from '../utils/validateExpression';

const COMPARE: Record<string, string> = {
  '=': '=',
  '!=': '<>',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
};

const BETWEEN_OPERATORS = new Set<string>([...betweenOperators].map(lc));

/** Maps each string-match operator to its canonical category and negation flag. */
const STRING_MATCH: Record<
  string,
  { kind: 'contains' | 'beginswith' | 'endswith'; negate: boolean }
> = {
  contains: { kind: 'contains', negate: false },
  doesnotcontain: { kind: 'contains', negate: true },
  beginswith: { kind: 'beginswith', negate: false },
  doesnotbeginwith: { kind: 'beginswith', negate: true },
  endswith: { kind: 'endswith', negate: false },
  doesnotendwith: { kind: 'endswith', negate: true },
};

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "drizzle" format.
 * Expression rules compose Drizzle `SQL` fragments from `context.columns` (arithmetic,
 * `abs`, `least`/`greatest`, `upper`/`lower`, etc.). Requires `context.columns` and
 * `context.drizzleOperators` (whose `sql` tag is used) — the same context the stock
 * processor needs. Pass custom `serializers` to add functions or override built-ins; they
 * are merged over {@link defaultDrizzleSerializers}. Rules without expressions, or with an
 * unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorDrizzle =
  (serializers?: DrizzleSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultDrizzleSerializers, ...serializers }
      : defaultDrizzleSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorDrizzle(rule, opts);

    const { columns, drizzleOperators } = (opts.context ?? {}) as {
      columns?: Record<string, unknown>;
      drizzleOperators?: { sql?: DrizzleSqlTag };
    };
    const sql = drizzleOperators?.sql;
    // Missing context: defer to stock processor (which returns undefined / omits).
    if (!columns || !sql) return defaultRuleProcessorDrizzle(rule, opts);

    const operator = lc(rule.operator);
    const unary = operator === 'null' || operator === 'notnull';
    const cmp = COMPARE[operator];
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    const stringMatch = STRING_MATCH[operator];
    if (!unary && !cmp && !betweenExpr && !stringMatch)
      return defaultRuleProcessorDrizzle(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return undefined;
    }

    const ctx = { sql, columns };
    const lhs = expr.lhs ? serializeDrizzle(expr.lhs, serial, ctx, opts) : columns[rule.field];
    if (!lhs) return defaultRuleProcessorDrizzle(rule, opts);

    if (unary) {
      return operator === 'notnull' ? sql`${lhs} is not null` : sql`${lhs} is null`;
    }

    if (betweenExpr) {
      if (!expr.rhs || !expr.rhs2) return undefined;
      const from = serializeDrizzle(expr.rhs, serial, ctx, opts);
      const to = serializeDrizzle(expr.rhs2, serial, ctx, opts);
      return operator === 'notbetween'
        ? sql`${lhs} not between ${from} and ${to}`
        : sql`${lhs} between ${from} and ${to}`;
    }

    const rhs = expr.rhs
      ? serializeDrizzle(expr.rhs, serial, ctx, opts)
      : rule.valueSource === 'field'
        ? columns[rule.value]
        : shouldRenderAsNumber(rule.value, opts.parseNumbers)
          ? parseNumber(rule.value, { parseNumbers: opts.parseNumbers })
          : rule.value;
    if (stringMatch) {
      const { kind, negate } = stringMatch;
      // Concatenate wildcards in SQL since `rhs` is an expression fragment, not a literal.
      const pattern =
        kind === 'contains'
          ? sql`'%' || ${rhs} || '%'`
          : kind === 'beginswith'
            ? sql`${rhs} || '%'`
            : sql`'%' || ${rhs}`;
      return negate ? sql`${lhs} not like ${pattern}` : sql`${lhs} like ${pattern}`;
    }
    return sql`${lhs} ${sql.raw(cmp)} ${rhs}`;
  };
