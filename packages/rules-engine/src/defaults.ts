import type { ClassnamesRE, RulesEngine, RulesEngineIC, TranslationsFullRE } from './types';

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

export const defaultTranslationsRE: TranslationsFullRE = {
  blockLabelIf: { title: 'First condition', label: 'If' },
  blockLabelElseIf: { title: 'Subsequent condition', label: 'Else If' },
  blockLabelElse: { title: 'Fallback/default action', label: 'Else' },
  blockLabelThen: { title: 'Resulting action', label: 'Then' },
  addCondition: { title: 'Add condition', label: '+ Condition' },
  addSubcondition: { title: 'Add subcondition', label: '+ Subcondition' },
  addAction: { title: 'Add action', label: '+ Action' },
  removeCondition: { title: 'Remove condition', label: '⨯' },
  removeAction: { title: 'Remove action', label: '⨯' },
};
