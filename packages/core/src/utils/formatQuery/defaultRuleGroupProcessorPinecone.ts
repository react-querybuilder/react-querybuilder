import type { RuleGroupProcessor } from '../../types';
import { formatCapabilities } from './formatCapabilities';
import { processVectorRuleGroup } from './vectorGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "pinecone" format. Produces a Pinecone
 * metadata filter object.
 *
 * - `and` → `$and`, `or` → `$or`; single-child groups are unwrapped.
 * - No group-level `$not`: `not` groups are negated via De Morgan push-down
 *   ({@link negateRuleGroup}). Missing-field semantics may differ from a true `NOT`.
 * - Returns `{}` if no rules survive; omit the `filter` param in that case.
 *
 * @see https://docs.pinecone.io/guides/search/filter-by-metadata
 *
 * @group Export
 */
export const defaultRuleGroupProcessorPinecone: RuleGroupProcessor<Record<string, unknown>> = (
  ruleGroup,
  options
) =>
  processVectorRuleGroup<Record<string, unknown>>(
    ruleGroup,
    options,
    formatCapabilities.pinecone!,
    (children, isOr) =>
      children.length === 1 ? children[0] : { [isOr ? '$or' : '$and']: children }
  ) || {};
