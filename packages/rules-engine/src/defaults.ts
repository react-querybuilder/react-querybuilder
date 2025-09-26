import type { ClassnamesRE, RulesEngine, RulesEngineIC } from './types';

export const defaultClassnamesRE: ClassnamesRE = {
  rulesEngineBuilder: '',
  actionBuilder: '',
  actionBuilderHeader: '',
  actionBuilderBody: '',
  actionBuilderStandalone: '',
  conditionBuilder: '',
  conditionBuilderHeader: '',
};

export const standardClassnamesRE: { [k in keyof ClassnamesRE]: string } = {
  rulesEngineBuilder: 'rulesEngineBuilder',
  actionBuilder: 'actionBuilder',
  actionBuilderHeader: 'actionBuilder-header',
  actionBuilderBody: 'actionBuilder-body',
  actionBuilderStandalone: 'actionBuilder-standalone',
  conditionBuilder: 'conditionBuilder',
  conditionBuilderHeader: 'conditionBuilder-header',
};

export const defaultRulesEngine: RulesEngine = { conditions: [{ combinator: 'and', rules: [] }] };

export const defaultRulesEngineIC: RulesEngineIC = { conditions: [{ rules: [] }] };
