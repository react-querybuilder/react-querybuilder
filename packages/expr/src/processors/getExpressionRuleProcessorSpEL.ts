import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorSpEL } from '@react-querybuilder/core';
import { defaultSpELSerializers } from '../functions/spel';
import type { SQLSerializerRegistry } from '../types';
import { quoteLeaf } from '../utils/serializeInfix';
import { makeStringExprProcessor } from '../utils/stringExprProcessor';

const factory = makeStringExprProcessor({
  serializers: defaultSpELSerializers,
  fallback: defaultRuleProcessorSpEL,
  dialect: {
    renderField: field => field,
    renderLeaf: (node, opts) => quoteLeaf(node, `'`, opts),
    renderParameter: parameter => parameter,
  },
  compare: { '=': '==', '!=': '!=', '<': '<', '<=': '<=', '>': '>', '>=': '>=' },
  renderNull: (lhs, notNull) => `${lhs} ${notNull ? '!=' : '=='} null`,
  renderBetween: (lhs, from, to, negate) =>
    negate ? `(${lhs} < ${from} or ${lhs} > ${to})` : `(${lhs} >= ${from} and ${lhs} <= ${to})`,
  renderStringMatch: (kind, negate, lhs, rhs) => {
    // Spring SpEL `matches` delegates to a full-string regex match, so anchor the pattern to the
    // intended semantics (mirrors core `defaultRuleProcessorSpEL` post-#1061). `rhs` is an arbitrary
    // expression, so wrap it with `.concat(...)` rather than string-literal interpolation.
    const pattern =
      kind === 'contains'
        ? `'.*'.concat(${rhs}).concat('.*')`
        : kind === 'beginswith'
          ? `'^'.concat(${rhs}).concat('.*')`
          : `'.*'.concat(${rhs}).concat('$')`;
    const clause = `${lhs} matches ${pattern}`;
    return negate ? `!(${clause})` : clause;
  },
});

/**
 * Generates a rule processor with expression support for {@link @react-querybuilder/core!formatQuery formatQuery}
 * with the "spel" format. Pass custom `serializers` to add functions or override built-ins;
 * they are merged over {@link defaultSpELSerializers}. Rules without expressions, or with an
 * unsupported operator, fall back to the stock processor.
 */
export const getExpressionRuleProcessorSpEL = (
  serializers?: SQLSerializerRegistry
): RuleProcessor => factory(serializers);
