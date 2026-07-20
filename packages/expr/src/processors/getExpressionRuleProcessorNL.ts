import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultOperatorProcessorNL,
  defaultRuleProcessorNL,
  defaultValueProcessorNL,
  getQuotedFieldName,
  lc,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultNLSerializers } from '../functions/nl';
import { getRuleExpressions } from '../registry';
import type { SQLSerializerRegistry } from '../types';
import type { InfixDialect } from '../utils/serializeInfix';
import { quoteLeaf, serializeInfix } from '../utils/serializeInfix';
import { validateExpression } from '../utils/validateExpression';

const SCALAR = new Set(['=', '!=', '<', '<=', '>', '>=']);
const NULL_OPERATORS = new Set(['null', 'notnull']);
const BETWEEN_OPERATORS = new Set(['between', 'notbetween']);
// String-match ops render as `subject verb object` (verb via operatorProcessor, e.g.
// "starts with"), identical to scalar; the object is the serialized expression RHS.
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
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "natural_language"
 * format. Expression rules render their LHS (and any expression RHS/bounds) as an English
 * noun phrase (e.g. `the product of Price and Quantity is greater than 100`). Pass custom
 * `serializers` to add functions or override built-ins; they are merged over
 * {@link defaultNLSerializers}. Rules without expressions, or with an unsupported operator,
 * fall back to the stock processor.
 */
export const getExpressionRuleProcessorNL =
  (serializers?: SQLSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers ? { ...defaultNLSerializers, ...serializers } : defaultNLSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorNL(rule, opts);

    const operator = lc(rule.operator);
    const unary = NULL_OPERATORS.has(operator);
    const scalar = SCALAR.has(operator) || STRING_MATCH_OPERATORS.has(operator);
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    if (!unary && !scalar && !betweenExpr) return defaultRuleProcessorNL(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return '';
    }

    const quoteFieldNamesWith = (opts.quoteFieldNamesWith ?? ['', '']) as [string, string];
    const fieldIdentifierSeparator = opts.fieldIdentifierSeparator ?? '';
    const quoteValuesWith = opts.quoteValuesWith ?? `'`;
    const dialect: InfixDialect = {
      renderField: field =>
        getQuotedFieldName(field, { quoteFieldNamesWith, fieldIdentifierSeparator }),
      renderLeaf: (node, o) => quoteLeaf(node, quoteValuesWith, o),
    };
    const ser = (n: NonNullable<typeof expr.lhs>) => serializeInfix(n, serial, dialect, opts);

    const subject = expr.lhs ? ser(expr.lhs) : dialect.renderField(rule.field, opts);
    const verb = (opts.operatorProcessor ?? defaultOperatorProcessorNL)(rule, opts);

    if (unary) return `${subject} ${verb}`.trim();

    if (betweenExpr) {
      if (!expr.rhs || !expr.rhs2) return '';
      return `${subject} ${verb} ${ser(expr.rhs)} and ${ser(expr.rhs2)}`.trim();
    }

    const object = expr.rhs
      ? ser(expr.rhs)
      : (opts.valueProcessor ?? defaultValueProcessorNL)(rule, {
          ...opts,
          quoteFieldNamesWith,
          fieldIdentifierSeparator,
          quoteValuesWith,
          concatOperator: opts.concatOperator ?? '||',
        });
    return `${subject} ${verb} ${object}`.trim();
  };
