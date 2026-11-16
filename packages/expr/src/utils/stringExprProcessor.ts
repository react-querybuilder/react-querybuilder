import type { RuleProcessor, RuleType, ValueProcessorOptions } from '@react-querybuilder/core';
import {
  betweenOperators,
  defaultOperatorNegationMap,
  lc,
  nullOperators,
  nullOrUndefinedOrEmpty,
  relationalOperators,
  substringOperators,
  toArray,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { getRuleExpressions } from '../registry';
import type { SQLSerializerRegistry } from '../types';
import type { InfixDialect } from './serializeInfix';
import { serializeInfix } from './serializeInfix';
import { validateExpression } from './validateExpression';

/** Canonical scalar comparison operators handled by the string processor. */
const SCALAR_OPERATORS = new Set<string>(relationalOperators);
const NULL_OPERATORS = new Set<string>([...nullOperators].map(lc));
const BETWEEN_OPERATORS = new Set<string>([...betweenOperators].map(lc));
const IN_OPERATORS = new Set<string>(['in', 'notin']);

/** Canonical string-match category emitted by a {@link StringExprConfig.renderStringMatch}. */
export type StringMatchKind = 'contains' | 'beginswith' | 'endswith';

/** Maps each string-match operator to its canonical category and negation flag. */
const STRING_MATCH_OPERATORS: Record<string, { kind: StringMatchKind; negate: boolean }> =
  Object.fromEntries(
    [...substringOperators].map(op => {
      const negate = op.startsWith('doesNot');
      const kind = lc(negate ? defaultOperatorNegationMap[op] : op) as StringMatchKind;
      return [lc(op), { kind, negate }];
    })
  );

/**
 * Configuration for a string-output ("infix") expression rule processor. Describes how to
 * render each supported operator category around already-serialized `lhs`/`rhs` fragments,
 * plus the {@link InfixDialect} used to serialize the expression trees themselves.
 */
export interface StringExprConfig {
  /** Built-in serializers for this format (merged under caller overrides). */
  serializers: SQLSerializerRegistry;
  /** Field/leaf renderers for the expression walker. */
  dialect: InfixDialect;
  /** Stock rule processor to fall back to (no expressions, or unsupported operator). */
  fallback: RuleProcessor;
  /** Maps a canonical scalar operator (`=`, `!=`, …) to this format's operator token. */
  compare: Record<string, string>;
  /** Renders `lhs <op> rhs`. Defaults to `` `${lhs} ${op} ${rhs}` ``. */
  renderScalar?: (lhs: string, op: string, rhs: string) => string;
  /** Renders a null / not-null check. */
  renderNull: (lhs: string, notNull: boolean) => string;
  /** Renders a `between` (or negated `notBetween`) range check. */
  renderBetween: (lhs: string, from: string, to: string, negate: boolean) => string;
  /**
   * Renders a string-match op (`contains`/`beginsWith`/`endsWith` and their negations)
   * around serialized `lhs`/`rhs` fragments.
   */
  renderStringMatch: (kind: StringMatchKind, negate: boolean, lhs: string, rhs: string) => string;
  /**
   * Renders an `in` (or negated `notIn`) list check around a serialized `lhs` expression and
   * rendered list items. Only used when the rule has an `lhs` and a non-expression value.
   */
  renderIn: (lhs: string, values: string[], negate: boolean) => string;
}

/**
 * Builds a `getExpressionRuleProcessor…` factory for a string-output format. The returned
 * factory accepts optional serializers merged over the format's built-ins. Supports scalar
 * comparisons, `is null`/`is not null`, `between`/`notBetween`, string matching, and (with an
 * `lhs`) `in`/`notIn`; rules without expressions (or with any other operator) defer to the
 * stock processor.
 */
export const makeStringExprProcessor =
  (config: StringExprConfig) =>
  (serializers?: SQLSerializerRegistry): RuleProcessor =>
  (rule: RuleType, options?: ValueProcessorOptions) => {
    const opts = options ?? {};
    const serial = serializers ? { ...config.serializers, ...serializers } : config.serializers;
    const { dialect, fallback } = config;
    const expr = getRuleExpressions(rule, opts);
    if (!expr || (!expr.lhs && !expr.rhs)) return fallback(rule, opts);

    const operator = lc(rule.operator);
    const unary = NULL_OPERATORS.has(operator);
    const scalarOp = config.compare[operator];
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    const stringMatch = STRING_MATCH_OPERATORS[operator];
    const inList = IN_OPERATORS.has(operator) && !!expr.lhs && rule.valueSource !== 'expression';
    if (
      !unary &&
      !scalarOp &&
      !SCALAR_OPERATORS.has(operator) &&
      !betweenExpr &&
      !stringMatch &&
      !inList
    ) {
      return fallback(rule, opts);
    }

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return '';
    }

    const ser = (n: NonNullable<typeof expr.lhs>) => serializeInfix(n, serial, dialect, opts);
    const lhs = expr.lhs ? ser(expr.lhs) : dialect.renderField(rule.field, opts);

    if (unary) return config.renderNull(lhs, operator === 'notnull');

    if (betweenExpr) {
      if (!expr.rhs || !expr.rhs2) return '';
      return config.renderBetween(lhs, ser(expr.rhs), ser(expr.rhs2), operator === 'notbetween');
    }

    if (inList) {
      const values = toArray(rule.value).filter(v => !nullOrUndefinedOrEmpty(v));
      if (values.length === 0) return '';
      const items = values.map(v =>
        rule.valueSource === 'field'
          ? dialect.renderField(`${v}`, opts)
          : dialect.renderLeaf({ kind: 'value', value: v }, opts)
      );
      return config.renderIn(lhs, items, operator === 'notin');
    }

    const rhs = expr.rhs
      ? ser(expr.rhs)
      : rule.valueSource === 'field'
        ? dialect.renderField(`${rule.value}`, opts)
        : dialect.renderLeaf({ kind: 'value', value: rule.value }, opts);
    if (stringMatch) {
      return config.renderStringMatch(stringMatch.kind, stringMatch.negate, lhs, rhs);
    }
    const render = config.renderScalar ?? ((l, o, r) => `${l} ${o} ${r}`);
    return render(lhs, scalarOp, rhs);
  };
