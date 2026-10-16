import type { RuleProcessor } from '../../types';
import { mongoLikeRuleProcessor } from './mongoLikeVectorRuleProcessor';

/**
 * Default rule processor used by {@link formatQuery} for "chroma" format. Returns a Chroma
 * `where` filter object, or `false` if the rule can't be expressed (see
 * {@link formatCapabilities}).
 *
 * - One operator per field object (`between` → `$and` of `$gte`/`$lte`).
 * - Range operators coerce values to numbers; non-numeric values are skipped. Store dates
 *   as epoch ms numbers.
 * - `in`/`notIn` members must share a type (string, int, float, or boolean); mixed lists
 *   are skipped.
 * - `null`/`notNull` (no `$exists`), string operators (`where_document` is out of scope),
 *   `valueSource: "field"`, and match modes are skipped.
 *
 * @see https://docs.trychroma.com/docs/querying-collections/metadata-filtering
 *
 * @group Export
 */
export const defaultRuleProcessorChroma: RuleProcessor = (rule, options) =>
  mongoLikeRuleProcessor('chroma', rule, options);
