import type { FullField, ValueSources } from './basic';
import type { OptionList } from './options';

/**
 * Options common to all parsers.
 */
export interface ParserCommonOptions {
  fields?: OptionList<FullField> | Record<string, FullField>;
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
}
