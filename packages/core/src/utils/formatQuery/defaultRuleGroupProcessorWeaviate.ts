import type { RuleGroupProcessor } from '../../types';
import { formatCapabilities } from './formatCapabilities';
import { processVectorRuleGroup } from './vectorGroupUtils';

type WeaviateFilter = Record<string, unknown>;

/**
 * Rule group processor used by {@link formatQuery} for "weaviate" format. Produces a
 * Weaviate `where` filter object (GraphQL/REST shape; plain JSON).
 *
 * - `and` → `And`, `or` → `Or`; single-operand groups are unwrapped.
 * - `not` → `{ operator: "Not", operands: [...] }` (native; Weaviate v1.33+).
 * - Returns `{}` if no rules survive; omit the `where` argument in that case.
 *
 * @see https://docs.weaviate.io/weaviate/api/graphql/filters
 *
 * @group Export
 */
export const defaultRuleGroupProcessorWeaviate: RuleGroupProcessor<WeaviateFilter> = (
  ruleGroup,
  options
) =>
  processVectorRuleGroup<WeaviateFilter>(
    ruleGroup,
    options,
    formatCapabilities.weaviate!,
    (children, isOr, not) => {
      const filter =
        children.length === 1 ? children[0] : { operator: isOr ? 'Or' : 'And', operands: children };
      return not ? { operator: 'Not', operands: [filter] } : filter;
    }
  ) || {};
