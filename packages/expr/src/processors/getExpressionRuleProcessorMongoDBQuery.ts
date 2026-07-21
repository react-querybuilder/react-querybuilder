import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorMongoDBQuery,
  lc,
  parseNumber,
  shouldRenderAsNumber,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultMongoDBSerializers } from '../functions/mongodb';
import { getRuleExpressions } from '../registry';
import type { MongoAggSerializerRegistry } from '../types';
import { serializeMongoAgg } from '../utils/serializeMongoAgg';
import { validateExpression } from '../utils/validateExpression';

const OPERATOR_MAP: Record<string, string> = {
  '=': '$eq',
  '!=': '$ne',
  '<': '$lt',
  '<=': '$lte',
  '>': '$gt',
  '>=': '$gte',
};

const BETWEEN_OPERATORS = new Set(['between', 'notbetween']);

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
 * Renders a string-match as an aggregation `$expr` using `$indexOfCP`/`$substrCP` so the
 * search operand is matched as a literal substring (no regex-escaping hazard).
 */
const renderStringMatch = (
  kind: 'contains' | 'beginswith' | 'endswith',
  negate: boolean,
  lhs: unknown,
  rhs: unknown
): object => {
  switch (kind) {
    case 'contains': {
      const idx = { $indexOfCP: [lhs, rhs] };
      return { $expr: negate ? { $eq: [idx, -1] } : { $gte: [idx, 0] } };
    }
    case 'beginswith': {
      const head = { $substrCP: [lhs, 0, { $strLenCP: rhs }] };
      return { $expr: { [negate ? '$ne' : '$eq']: [head, rhs] } };
    }
    // v8 ignore next -- exhaustive; 'endswith' is the only remaining kind
    default: {
      const tail = {
        $substrCP: [
          lhs,
          { $subtract: [{ $strLenCP: lhs }, { $strLenCP: rhs }] },
          { $strLenCP: rhs },
        ],
      };
      return { $expr: { [negate ? '$ne' : '$eq']: [tail, rhs] } };
    }
  }
};

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "mongodb_query" format.
 * Expression rules emit MongoDB aggregation-expression form (`{ $expr: { ... } }`), where
 * `field` operands become `"$field"` paths and functions map to native aggregation operators
 * (`$add`, `$multiply`, `$toUpper`, etc.). String-match operators render via
 * `$indexOfCP`/`$substrCP` (literal-substring semantics). Pass custom `serializers` to add
 * functions or override built-ins; they are merged over {@link defaultMongoDBSerializers}.
 * Rules without expressions, or with an unsupported operator, fall back to the stock
 * processor.
 */
export const getExpressionRuleProcessorMongoDBQuery =
  (serializers?: MongoAggSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultMongoDBSerializers, ...serializers }
      : defaultMongoDBSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorMongoDBQuery(rule, opts);

    const operator = lc(rule.operator);
    const unary = operator === 'null' || operator === 'notnull';
    const mongoOp = OPERATOR_MAP[operator];
    // Between is supported only with expression-sourced bounds; a plain-value between defers
    // to the stock processor (which handles number parsing/ordering/field sources).
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    const stringMatch = STRING_MATCH[operator];
    if (!unary && !mongoOp && !betweenExpr && !stringMatch)
      return defaultRuleProcessorMongoDBQuery(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return '';
    }

    const lhs = expr.lhs ? serializeMongoAgg(expr.lhs, serial, opts) : `$${rule.field}`;
    if (unary) {
      return { $expr: { [operator === 'notnull' ? '$ne' : '$eq']: [lhs, null] } };
    }

    if (betweenExpr) {
      // Both bounds are required; an incomplete expression between omits the rule.
      if (!expr.rhs || !expr.rhs2) return '';
      const from = serializeMongoAgg(expr.rhs, serial, opts);
      const to = serializeMongoAgg(expr.rhs2, serial, opts);
      return operator === 'notbetween'
        ? { $expr: { $or: [{ $lt: [lhs, from] }, { $gt: [lhs, to] }] } }
        : { $expr: { $and: [{ $gte: [lhs, from] }, { $lte: [lhs, to] }] } };
    }

    const rhs = expr.rhs
      ? serializeMongoAgg(expr.rhs, serial, opts)
      : rule.valueSource === 'field'
        ? `$${rule.value}`
        : shouldRenderAsNumber(rule.value, opts.parseNumbers)
          ? parseNumber(rule.value, { parseNumbers: opts.parseNumbers })
          : rule.value;
    if (stringMatch) {
      return renderStringMatch(stringMatch.kind, stringMatch.negate, lhs, rhs);
    }
    return { $expr: { [mongoOp]: [lhs, rhs] } };
  };
