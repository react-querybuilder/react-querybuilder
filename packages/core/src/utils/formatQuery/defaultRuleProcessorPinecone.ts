import type { RuleProcessor } from '../../types';
import { mongoLikeRuleProcessor } from './mongoLikeVectorRuleProcessor';

/**
 * Default rule processor used by {@link formatQuery} for "pinecone" format. Returns a
 * Pinecone metadata filter object, or `false` if the rule can't be expressed (see
 * {@link formatCapabilities}).
 *
 * - Always uses explicit `$eq` (no shorthand).
 * - Range operators (incl. `between`) coerce values to numbers; non-numeric values are
 *   skipped. Store dates as epoch ms numbers.
 * - `null`/`notNull` → `$exists: false`/`$exists: true`.
 * - String operators, `valueSource: "field"`, and match modes are skipped.
 *
 * @see https://docs.pinecone.io/guides/search/filter-by-metadata
 *
 * @group Export
 */
export const defaultRuleProcessorPinecone: RuleProcessor = (rule, options) =>
  mongoLikeRuleProcessor('pinecone', rule, options);
