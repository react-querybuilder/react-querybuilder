import type { RuleProcessor } from '@react-querybuilder/core';
import {
  betweenOperators,
  defaultRuleProcessorSequelize,
  lc,
  parseNumber,
  shouldRenderAsNumber,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultSQLSerializers } from '../functions/sql';
import { getRuleExpressions } from '../registry';
import type { SQLSerializerRegistry } from '../types';
import { serializeSQL } from '../utils/serializeSQL';
import { validateExpression } from '../utils/validateExpression';

// Sequelize `Op` symbols we target, keyed by canonical operator.
type SeqContext = {
  sequelizeOperators?: Record<string, symbol>;
  sequelizeWhere?: (attr: unknown, logic: unknown) => unknown;
  sequelizeLiteral?: (val: string) => unknown;
  sequelizeCol?: (val: string) => unknown;
};

const OP_KEY: Record<string, string> = {
  '=': 'eq',
  '!=': 'ne',
  '<': 'lt',
  '<=': 'lte',
  '>': 'gt',
  '>=': 'gte',
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
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "sequelize" format.
 * Expression rules render their LHS (and any expression RHS/bounds) as a SQL fragment
 * (arithmetic via infix, functions via `ABS`/`UPPER`/`LEAST`/…), wrapped in
 * `sequelize.literal(...)` and compared with `sequelize.where(...)`. Requires these `context`
 * helpers: `sequelizeOperators` (the `Op` object), `sequelizeWhere` (the `where` fn),
 * `sequelizeLiteral` (the `literal` fn), and `sequelizeCol` (the `col` fn). Pass custom
 * `serializers` to add functions or override built-ins; they are merged over
 * {@link defaultSQLSerializers}. Rules without expressions, missing context, or with an
 * unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorSequelize =
  (serializers?: SQLSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultSQLSerializers, ...serializers }
      : defaultSQLSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorSequelize(rule, opts);

    const {
      sequelizeOperators: Op,
      sequelizeWhere: where,
      sequelizeLiteral: literal,
      sequelizeCol: col,
    } = (opts.context ?? {}) as SeqContext;
    if (!Op || !where || !literal || !col) return defaultRuleProcessorSequelize(rule, opts);

    const operator = lc(rule.operator);
    const unary = operator === 'null' || operator === 'notnull';
    const opKey = OP_KEY[operator];
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    const stringMatch = STRING_MATCH[operator];
    if (!unary && !opKey && !betweenExpr && !stringMatch)
      return defaultRuleProcessorSequelize(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return undefined;
    }

    const lhsAttr = expr.lhs ? literal(serializeSQL(expr.lhs, serial, opts)) : col(rule.field);

    if (unary) {
      return where(lhsAttr, { [operator === 'notnull' ? Op.ne : Op.eq]: null });
    }

    // Render an operand: expression → literal SQL; field-source → col; else parsed value.
    const operand = (node: (typeof expr)['rhs'], raw: unknown): unknown =>
      node
        ? literal(serializeSQL(node, serial, opts))
        : rule.valueSource === 'field'
          ? col(`${raw}`)
          : shouldRenderAsNumber(raw, opts.parseNumbers)
            ? parseNumber(raw, { parseNumbers: opts.parseNumbers })
            : raw;

    if (betweenExpr) {
      if (!expr.rhs || !expr.rhs2) return undefined;
      const from = literal(serializeSQL(expr.rhs, serial, opts));
      const to = literal(serializeSQL(expr.rhs2, serial, opts));
      return where(lhsAttr, {
        [operator === 'notbetween' ? Op.notBetween : Op.between]: [from, to],
      });
    }

    const rhsValue = Array.isArray(rule.value) ? rule.value[0] : rule.value;
    if (stringMatch) {
      const { kind, negate } = stringMatch;
      const likeOp = negate ? Op.notLike : Op.like;
      if (expr.rhs) {
        // Expression RHS: build the pattern in SQL via concatenation inside a literal.
        const frag = serializeSQL(expr.rhs, serial, opts);
        const pattern =
          kind === 'contains'
            ? `'%' || ${frag} || '%'`
            : kind === 'beginswith'
              ? `${frag} || '%'`
              : `'%' || ${frag}`;
        return where(lhsAttr, { [likeOp]: literal(pattern) });
      }
      // Field-source RHS can't be embedded in a literal pattern here; omit the rule.
      if (rule.valueSource === 'field') return undefined;
      const v = `${rhsValue}`;
      const pattern = kind === 'contains' ? `%${v}%` : kind === 'beginswith' ? `${v}%` : `%${v}`;
      return where(lhsAttr, { [likeOp]: pattern });
    }
    return where(lhsAttr, { [Op[opKey]]: operand(expr.rhs, rhsValue) });
  };
