import type { RuleGroupProcessor } from '../../types';
import { formatCapabilities } from './formatCapabilities';
import { processVectorRuleGroup } from './vectorGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "chroma" format. Produces a Chroma
 * metadata filter object.
 *
 * - `and` → `$and`, `or` → `$or`; single-child groups are unwrapped.
 * - No group-level `$not`: `not` groups are negated via De Morgan push-down
 *   ({@link negateRuleGroup}). Missing-field semantics may differ from a true `NOT`.
 * - Returns `{}` if no rules survive; omit the `where` param in that case (Chroma rejects
 *   `{}`).
 *
 * @see https://docs.trychroma.com/docs/querying-collections/metadata-filtering
 *
 * @group Export
 */
export const defaultRuleGroupProcessorChroma: RuleGroupProcessor<Record<string, unknown>> = (
  ruleGroup,
  options
) =>
  processVectorRuleGroup<Record<string, unknown>>(
    ruleGroup,
    options,
    formatCapabilities.chroma!,
    (children, isOr) =>
      children.length === 1 ? children[0] : { [isOr ? '$or' : '$and']: children }
  ) || {};
