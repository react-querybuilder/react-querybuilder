import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorJSONata } from '@react-querybuilder/core';
import { defaultJSONataSerializers } from '../functions/jsonata';
import type { SQLSerializerRegistry } from '../types';
import { quoteLeaf } from '../utils/serializeInfix';
import { makeStringExprProcessor } from '../utils/stringExprProcessor';

const factory = makeStringExprProcessor({
  serializers: defaultJSONataSerializers,
  fallback: defaultRuleProcessorJSONata,
  dialect: {
    renderField: field => field,
    renderLeaf: (node, opts) => quoteLeaf(node, `"`, opts),
  },
  compare: { '=': '=', '!=': '!=', '<': '<', '<=': '<=', '>': '>', '>=': '>=' },
  renderNull: (lhs, notNull) => (notNull ? `$exists(${lhs})` : `$not($exists(${lhs}))`),
  renderBetween: (lhs, from, to, negate) =>
    negate ? `(${lhs} < ${from} or ${lhs} > ${to})` : `(${lhs} >= ${from} and ${lhs} <= ${to})`,
  renderStringMatch: (kind, negate, lhs, rhs) => {
    const clause =
      kind === 'contains'
        ? `$contains(${lhs}, ${rhs})`
        : kind === 'beginswith'
          ? `$substring(${lhs}, 0, $length(${rhs})) = ${rhs}`
          : `$substring(${lhs}, $length(${lhs}) - $length(${rhs})) = ${rhs}`;
    return negate ? `$not(${clause})` : clause;
  },
});

/**
 * Generates a rule processor with expression support for {@link @react-querybuilder/core!formatQuery formatQuery}
 * with the "jsonata" format. Pass custom `serializers` to add functions or override
 * built-ins; they are merged over {@link defaultJSONataSerializers}. Rules without
 * expressions, or with an unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorJSONata = (
  serializers?: SQLSerializerRegistry
): RuleProcessor => factory(serializers);
