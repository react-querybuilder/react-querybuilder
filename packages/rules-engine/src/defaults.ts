import type { ClassnamesRE, RulesEngine, RulesEngineIC, TranslationsFullRE } from './types';

export const defaultClassnamesRE: ClassnamesRE = {
  rulesEngineBuilder: '',
  rulesEngineHeader: '',
  consequentBuilder: '',
  consequentBuilderHeader: '',
  consequentBuilderBody: '',
  consequentBuilderStandalone: '',
  blockLabel: '',
  conditionBuilder: '',
  conditionBuilderHeader: '',
};

export const standardClassnamesRE: Record<keyof ClassnamesRE, string> = {
  rulesEngineBuilder: 'rulesEngineBuilder',
  rulesEngineHeader: 'rulesEngineBuilder-header',
  consequentBuilder: 'consequentBuilder',
  consequentBuilderHeader: 'consequentBuilder-header',
  consequentBuilderBody: 'consequentBuilder-body',
  consequentBuilderStandalone: 'consequentBuilder-standalone',
  blockLabel: 'blockLabel',
  conditionBuilder: 'conditionBuilder',
  conditionBuilderHeader: 'conditionBuilder-header',
};

export const defaultRulesEngine: RulesEngine = {
  conditions: [{ antecedent: { combinator: 'and', rules: [] } }],
};

export const defaultRulesEngineIC: RulesEngineIC = {
  conditions: [{ antecedent: { rules: [] } }],
};

export const defaultTranslationsRE: TranslationsFullRE = {
  blockLabelIf: { title: 'First condition', label: 'If' },
  blockLabelElseIf: { title: 'Subsequent condition', label: 'Else If' },
  blockLabelElse: { title: 'Fallback/default action', label: 'Else' },
  blockLabelThen: { title: 'Consequent action', label: 'Then' },
  addCondition: { title: 'Add condition', label: '+ Condition' },
  addSubcondition: { title: 'Add subcondition', label: '+ Subcondition' },
  addConsequent: { title: 'Add action', label: '+ Action' },
  removeCondition: { title: 'Remove condition', label: '⨯' },
  removeConsequent: { title: 'Remove action', label: '⨯' },
};
