import type { RuleProcessor } from '@react-querybuilder/core';
import { betweenOperators, defaultRuleProcessorElasticSearch, lc } from '@react-querybuilder/core';
import { defaultFunctionMeta } from '../functions/meta';
import { defaultPainlessSerializers } from '../functions/painless';
import { getRuleExpressions } from '../registry';
import type { SQLSerializerRegistry } from '../types';
import type { InfixDialect } from '../utils/serializeInfix';
import { quoteLeaf, serializeInfix } from '../utils/serializeInfix';
import { validateExpression } from '../utils/validateExpression';

const COMPARE: Record<string, string> = {
  '=': '==',
  '!=': '!=',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
};

const BETWEEN_OPERATORS = new Set<string>([...betweenOperators].map(lc));

// Maps a string-match operator to its Painless String method and negation flag.
const STRING_MATCH: Record<
  string,
  { method: 'startsWith' | 'contains' | 'endsWith'; negate: boolean }
> = {
  contains: { method: 'contains', negate: false },
  doesnotcontain: { method: 'contains', negate: true },
  beginswith: { method: 'startsWith', negate: false },
  doesnotbeginwith: { method: 'startsWith', negate: true },
  endswith: { method: 'endsWith', negate: false },
  doesnotendwith: { method: 'endsWith', negate: true },
};

// Painless field access: `doc['field'].value`. String leaves use single quotes (escaped).
const dialect: InfixDialect = {
  renderField: field => `doc['${field.replaceAll(`'`, `\\'`)}'].value`,
  renderLeaf: (node, opts) => quoteLeaf(node, `'`, { ...opts, escapeQuotes: true }),
};

const wrapScript = (script: string) => ({ bool: { filter: { script: { script } } } });

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "elasticsearch" format.
 * Expression rules emit a Painless script filter (`{ bool: { filter: { script: { script } } } }`),
 * mirroring how the stock processor already scripts field-to-field comparisons. Supports
 * scalar comparisons and expression-sourced `between`/`notBetween`. Pass custom `serializers`
 * to add functions or override built-ins; they are merged over
 * {@link defaultPainlessSerializers}. Rules without expressions, or with an unsupported
 * operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorElasticSearch =
  (serializers?: SQLSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? {};
    const serial = serializers
      ? { ...defaultPainlessSerializers, ...serializers }
      : defaultPainlessSerializers;
    const expr = getRuleExpressions(rule);
    if (!expr || (!expr.lhs && !expr.rhs)) return defaultRuleProcessorElasticSearch(rule, opts);

    const operator = lc(rule.operator);
    const cmp = COMPARE[operator];
    const betweenExpr = BETWEEN_OPERATORS.has(operator) && !!(expr.rhs || expr.rhs2);
    const stringMatch = STRING_MATCH[operator];
    // null/notnull aren't expressible as an expression script here; defer.
    if (!cmp && !betweenExpr && !stringMatch) return defaultRuleProcessorElasticSearch(rule, opts);

    const validate = { functions: serial, meta: defaultFunctionMeta };
    if (
      (expr.lhs && !validateExpression(expr.lhs, validate).valid) ||
      (expr.rhs && !validateExpression(expr.rhs, validate).valid) ||
      (expr.rhs2 && !validateExpression(expr.rhs2, validate).valid)
    ) {
      return false;
    }

    const ser = (n: NonNullable<typeof expr.lhs>) => serializeInfix(n, serial, dialect, opts);
    const lhs = expr.lhs ? ser(expr.lhs) : dialect.renderField(rule.field, opts);

    if (betweenExpr) {
      if (!expr.rhs || !expr.rhs2) return false;
      const from = ser(expr.rhs);
      const to = ser(expr.rhs2);
      const script = `${lhs} >= ${from} && ${lhs} <= ${to}`;
      return wrapScript(operator === 'notbetween' ? `!(${script})` : script);
    }

    const rhs = expr.rhs
      ? ser(expr.rhs)
      : rule.valueSource === 'field'
        ? dialect.renderField(`${rule.value}`, opts)
        : dialect.renderLeaf({ kind: 'value', value: rule.value }, opts);
    if (stringMatch) {
      const script = `${lhs}.${stringMatch.method}(${rhs})`;
      return wrapScript(stringMatch.negate ? `!(${script})` : script);
    }
    return wrapScript(`${lhs} ${cmp} ${rhs}`);
  };
