import type { FullField, ValueSources } from './basic';
import type { BaseOptionMap, FlexibleOptionList } from './options';

/**
 * Options common to all parsers.
 */
export interface ParserCommonOptions {
  /**
   * Field whitelist (same shapes as the `QueryBuilder` `fields` prop). Rules with unknown fields
   * are dropped.
   */
  fields?: FlexibleOptionList<FullField> | BaseOptionMap<FullField>;
  getValueSources?: (field: string, operator: string) => ValueSources;
  listsAsArrays?: boolean;
  /**
   * When true, the generated query will use independent combinators ({@link RuleGroupTypeIC}).
   */
  independentCombinators?: boolean;
  /**
   * When true, a unique `id` will be generated for each rule and group in the query.
   */
  generateIDs?: boolean;
  /**
   * Generates a `bigint` value if the string represents a valid integer
   * outside the safe boundaries of the `number` type.
   */
  bigIntOnOverflow?: boolean;
}
