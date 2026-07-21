import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorCypher } from '@react-querybuilder/core';
import { defaultCypherSerializers } from '../functions/cypher';
import type { SQLSerializerRegistry } from '../types';
import { quoteLeaf } from '../utils/serializeInfix';
import { makeStringExprProcessor } from '../utils/stringExprProcessor';

const factory = makeStringExprProcessor({
  serializers: defaultCypherSerializers,
  fallback: defaultRuleProcessorCypher,
  dialect: {
    renderField: field => field,
    renderLeaf: (node, opts) => quoteLeaf(node, `'`, opts),
  },
  compare: { '=': '=', '!=': '<>', '<': '<', '<=': '<=', '>': '>', '>=': '>=' },
  renderNull: (lhs, notNull) => `${lhs} IS ${notNull ? 'NOT ' : ''}NULL`,
  renderBetween: (lhs, from, to, negate) =>
    negate ? `(${lhs} < ${from} OR ${lhs} > ${to})` : `(${lhs} >= ${from} AND ${lhs} <= ${to})`,
  renderStringMatch: (kind, negate, lhs, rhs) => {
    const op =
      kind === 'contains' ? 'CONTAINS' : kind === 'beginswith' ? 'STARTS WITH' : 'ENDS WITH';
    const clause = `${lhs} ${op} ${rhs}`;
    return negate ? `NOT (${clause})` : clause;
  },
});

/**
 * Generates a rule processor with expression support for {@link @react-querybuilder/core!formatQuery formatQuery}
 * with the "cypher"/"gql" format. Pass custom `serializers` to add functions or override
 * built-ins; they are merged over {@link defaultCypherSerializers}. Rules without
 * expressions, or with an unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorCypher = (
  serializers?: SQLSerializerRegistry
): RuleProcessor => factory(serializers);
