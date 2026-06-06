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
  /**
   * Overrides the {@link react-querybuilder!RulesEngine.evaluationMode evaluationMode} stored on
   * the rules engine object. If neither is specified, defaults to `"cascade"`.
   *
   * - `"cascade"`: conditions are evaluated in order; a later sibling only fires if all prior
   *   siblings' antecedents failed (if/else-if/else semantics).
   * - `"cumulative"`: every condition is evaluated independently and any number may fire.
   */
  evaluationMode?: EvaluationMode;
  /**
   * Arbitrary values passed through to the rules engine processor.
   *
   * For the `"json-rules-engine"` format, set the `engine` property to an `Engine` instance and the
   * {@link jsonRulesEngineAdditionalOperators additional operators} (`beginsWith`, `between`, etc.)
   * will be registered on it as a side effect, so exported rules that use those operators can be
   * evaluated without registering the operators yourself.
   *
   * @example
   * const engine = new Engine();
   * for (const rule of formatRulesEngine(re, {
   *   format: 'json-rules-engine',
   *   context: { engine },
   * })) {
   *   engine.addRule(rule);
   * }
   */
  context?: Record<string, unknown>;
}

/**
 * Determines how sibling conditions in a {@link react-querybuilder!RulesEngine RulesEngine}
 * relate to one another when exported.
 *
 * @group Export
 */
export type EvaluationMode = 'cascade' | 'cumulative';
