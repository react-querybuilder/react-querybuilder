import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorCEL } from '@react-querybuilder/core';
import { defaultCELSerializers } from '../functions/cel';
import type { SQLSerializerRegistry } from '../types';
import { quoteLeaf } from '../utils/serializeInfix';
import { makeStringExprProcessor } from '../utils/stringExprProcessor';

const factory = makeStringExprProcessor({
  serializers: defaultCELSerializers,
  fallback: defaultRuleProcessorCEL,
  dialect: {
    renderField: field => field,
    renderLeaf: (node, opts) => quoteLeaf(node, `"`, opts),
    renderParameter: parameter => parameter,
  },
  compare: { '=': '==', '!=': '!=', '<': '<', '<=': '<=', '>': '>', '>=': '>=' },
  renderNull: (lhs, notNull) => `${lhs} ${notNull ? '!=' : '=='} null`,
  renderBetween: (lhs, from, to, negate) =>
    negate ? `(${lhs} < ${from} || ${lhs} > ${to})` : `(${lhs} >= ${from} && ${lhs} <= ${to})`,
  renderStringMatch: (kind, negate, lhs, rhs) => {
    const method =
      kind === 'contains' ? 'contains' : kind === 'beginswith' ? 'startsWith' : 'endsWith';
    return `${negate ? '!' : ''}${lhs}.${method}(${rhs})`;
  },
});

/**
 * Generates a rule processor with expression support for {@link @react-querybuilder/core!formatQuery formatQuery}
 * with the "cel" format. Pass custom `serializers` to add functions or override built-ins;
 * they are merged over {@link defaultCELSerializers}. Rules without expressions, or with an
 * unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorCEL = (serializers?: SQLSerializerRegistry): RuleProcessor =>
  factory(serializers);
