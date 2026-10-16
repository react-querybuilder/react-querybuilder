import type { RuleGroupProcessor } from '../../types';
import { formatCapabilities } from './formatCapabilities';
import { processVectorRuleGroup } from './vectorGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "milvus" format. Produces a Milvus
 * boolean filter expression string.
 *
 * - `and`/`or` join children; nested groups are parenthesized.
 * - `not` → `not (...)` (native).
 * - Returns `fallbackExpression` (default `""`) if no rules survive; omit the `filter`
 *   param in that case.
 *
 * @see https://milvus.io/docs/boolean.md
 *
 * @group Export
 */
export const defaultRuleGroupProcessorMilvus: RuleGroupProcessor<string> = (ruleGroup, options) =>
  processVectorRuleGroup<string>(
    ruleGroup,
    options,
    formatCapabilities.milvus!,
    (children, isOr, not, outermost) => {
      const expr = children.join(isOr ? ' or ' : ' and ');
      return not ? `not (${expr})` : outermost || children.length === 1 ? expr : `(${expr})`;
    }
  ) || options.fallbackExpression;
