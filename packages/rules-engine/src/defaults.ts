import type { ClassnamesRE, RulesEngine, RulesEngineIC, TranslationsFullRE } from './types';

/**
 * Default classnames used by {@link RulesEngineBuilder}.
 *
 * @group Defaults
 */
export const defaultClassnamesRE: ClassnamesRE = {
  rulesEngineBuilder: '',
  rulesEngineHeader: '',
  consequentBuilder: '',
  consequentBuilderHeader: '',
  consequentBuilderBody: '',
  consequentBuilderStandalone: '',
  conditionBuilder: '',
  conditionBuilderHeader: '',
  blockLabel: '',
  blockLabelIf: '',
  blockLabelIfElse: '',
  blockLabelElse: '',
  blockLabelThen: '',
};

/**
 * Standard classnames applied by {@link RulesEngineBuilder}.
 *
 * @group Defaults
 */
export const standardClassnamesRE: Record<keyof ClassnamesRE, string> = {
  rulesEngineBuilder: 'rulesEngineBuilder',
  rulesEngineHeader: 'rulesEngineBuilder-header',
  consequentBuilder: 'consequentBuilder',
  consequentBuilderHeader: 'consequentBuilder-header',
  consequentBuilderBody: 'consequentBuilder-body',
  consequentBuilderStandalone: 'consequentBuilder-standalone',
  conditionBuilder: 'conditionBuilder',
  conditionBuilderHeader: 'conditionBuilder-header',
  blockLabel: 'blockLabel',
  blockLabelIf: 'blockLabel-if',
  blockLabelIfElse: 'blockLabel-ifelse',
  blockLabelElse: 'blockLabel-else',
  blockLabelThen: 'blockLabel-then',
};

export const defaultRulesEngine: RulesEngine = {
  conditions: [{ antecedent: { combinator: 'and', rules: [] } }],
};

export const defaultRulesEngineIC: RulesEngineIC = {
  conditions: [{ antecedent: { rules: [] } }],
};

/**
 * Default configuration of translatable strings
 * for {@link RulesEngineBuilder}.
 *
 * @group Defaults
 */
export const defaultTranslationsRE: TranslationsFullRE = {
  blockLabelIf: { title: 'First condition', label: 'If' },
  blockLabelElseIf: { title: 'Subsequent condition', label: 'Else If' },
  blockLabelElse: { title: 'Fallback/default consequent', label: 'Else' },
  blockLabelThen: { title: 'Consequent action/result', label: 'Then' },
  addCondition: { title: 'Add condition', label: '+ Condition' },
  addSubcondition: { title: 'Add subcondition', label: '+ Subcondition' },
  addConsequent: { title: 'Add consequent action/result', label: '+ Then' },
  addDefaultConsequent: { title: 'Add consequent action/result', label: '+ Else' },
  removeCondition: { title: 'Remove condition', label: '⨯' },
  removeConsequent: { title: 'Remove consequent action/result', label: '⨯' },
};
