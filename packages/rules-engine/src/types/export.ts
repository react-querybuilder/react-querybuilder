import type { FormatQueryOptions } from '@react-querybuilder/core';
import type { RulesEngineAny } from './rulesEngine';

/**
 * Available export formats for {@link formatRulesEngine}.
 *
 * @group Export
 */
export type RulesEngineExportFormat = 'json-rules-engine';

/**
 * Function to produce a result that {@link formatRulesEngine} uses when processing a
 * {@link react-querybuilder!RulesEngine RulesEngine} or
 * {@link react-querybuilder!RulesEngineIC RulesEngineIC} object.
 *
 * See the default rules engine processor for each format to know what type to return.
 * | Format              | Default rules engine processor                     |
 * | ------------------- | -------------------------------------------------- |
 * | `json-rules-engine` | {@link defaultRulesEngineProcessorJsonRulesEngine} |
 *
 * @group Export
 */
export type RulesEngineProcessor<TResult = unknown> = (
  rulesEngine: RulesEngineAny,
  options: FormatRulesEngineOptions
) => TResult;

/**
 * Options object shape for {@link formatRulesEngine}.
 *
 * @group Export
 */
export interface FormatRulesEngineOptions {
  format?: RulesEngineExportFormat;
  rulesEngineProcessor?: RulesEngineProcessor;
  formatQueryOptions?: FormatQueryOptions;
}
