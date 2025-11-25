export type RulesEngineExportFormat = 'json-rules-engine';

export type RulesEngineProcessor<TResult = unknown> = (
  rulesEngine: unknown,
  options: FormatRulesEngineOptions
) => TResult;

export type FormatRulesEngineOptions = {
  format?: RulesEngineExportFormat;
  rulesEngineProcessor?: RulesEngineProcessor;
};
