import type { FormatQueryOptions } from '@react-querybuilder/core';

export type RulesEngineExportFormat = 'json-rules-engine';

export type RulesEngineProcessor<TResult = unknown> = (
  rulesEngine: unknown,
  options: FormatRulesEngineOptions
) => TResult;

export interface FormatRulesEngineOptions {
  format?: RulesEngineExportFormat;
  rulesEngineProcessor?: RulesEngineProcessor;
  formatQueryOptions?: FormatQueryOptions;
}
