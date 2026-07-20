import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorSPARQL } from '@react-querybuilder/core';
import { defaultSPARQLSerializers } from '../functions/sparql';
import type { SQLSerializerRegistry } from '../types';
import { quoteLeaf } from '../utils/serializeInfix';
import { makeStringExprProcessor } from '../utils/stringExprProcessor';

// Prefixes a bare field name with `?` to form a SPARQL variable, unless it already carries a
// `?`/`<` sigil or a `:` prefix (mirrors the stock SPARQL processor's `sparqlVar`).
const sparqlVar = (field: string): string =>
  field.startsWith('?') || field.startsWith('<') || field.includes(':') ? field : `?${field}`;

const factory = makeStringExprProcessor({
  serializers: defaultSPARQLSerializers,
  fallback: defaultRuleProcessorSPARQL,
  dialect: {
    renderField: sparqlVar,
    renderLeaf: (node, opts) => quoteLeaf(node, `"`, opts),
  },
  compare: { '=': '=', '!=': '!=', '<': '<', '<=': '<=', '>': '>', '>=': '>=' },
  renderNull: (lhs, notNull) => `${notNull ? '' : '!'}BOUND(${lhs})`,
  renderBetween: (lhs, from, to, negate) =>
    negate ? `(${lhs} < ${from} || ${lhs} > ${to})` : `(${lhs} >= ${from} && ${lhs} <= ${to})`,
  renderStringMatch: (kind, negate, lhs, rhs) => {
    const fn = kind === 'contains' ? 'CONTAINS' : kind === 'beginswith' ? 'STRSTARTS' : 'STRENDS';
    return `${negate ? '!' : ''}${fn}(${lhs}, ${rhs})`;
  },
});

/**
 * Generates a rule processor with expression support for {@link @react-querybuilder/core!formatQuery formatQuery}
 * with the "sparql" format. Pass custom `serializers` to add functions or override
 * built-ins; they are merged over {@link defaultSPARQLSerializers}. Rules without
 * expressions, or with an unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorSPARQL = (
  serializers?: SQLSerializerRegistry
): RuleProcessor => factory(serializers);
