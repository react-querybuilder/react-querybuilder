import type { ClassnamesRE, RulesEngine, RulesEngineIC } from './types';

export const defaultClassnamesRE: ClassnamesRE = {
  rulesEngineBuilder: '',
  rulesEngineHeader: '',
  actionBuilder: '',
  actionBuilderHeader: '',
  actionBuilderBody: '',
  actionBuilderStandalone: '',
  blockLabel: '',
  conditionBuilder: '',
  conditionBuilderHeader: '',
};

export const standardClassnamesRE: Record<keyof ClassnamesRE, string> = {
  rulesEngineBuilder: 'rulesEngineBuilder',
  rulesEngineHeader: 'rulesEngineBuilder-header',
  actionBuilder: 'actionBuilder',
  actionBuilderHeader: 'actionBuilder-header',
  actionBuilderBody: 'actionBuilder-body',
  actionBuilderStandalone: 'actionBuilder-standalone',
  blockLabel: 'blockLabel',
  conditionBuilder: 'conditionBuilder',
  conditionBuilderHeader: 'conditionBuilder-header',
};

export const defaultRulesEngine: RulesEngine = {
  conditions: [{ condition: { combinator: 'and', rules: [] } }],
};

export const defaultRulesEngineIC: RulesEngineIC = {
  conditions: [{ condition: { rules: [] } }],
};
