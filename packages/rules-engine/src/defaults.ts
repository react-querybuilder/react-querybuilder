import type { ClassnamesRE, RulesEngine, RulesEngineIC, TranslationsFullRE } from './types';

/**
 * Default classnames used by {@link RulesEngineBuilder}.
 *
 * @group Defaults
 */
export const defaultClassnamesRE: ClassnamesRE = {
  rulesEngineBuilder: '',
  rulesEngineHeader: '',
  rulesEngineBody: '',
  consequentBuilder: '',
  consequentBuilderHeader: '',
  consequentBuilderBody: '',
  consequentBuilderStandalone: '',
  conditionBuilder: '',
  conditionBuilderBody: '',
  conditionBuilderHeader: '',
  blockLabel: '',
  blockLabelIf: '',
  blockLabelIfElse: '',
  blockLabelElse: '',
  blockLabelThen: '',
  blockLabelWhen: '',
  blockLabelAlways: '',
  evaluationMode: '',
  shiftActions: '',
};

/**
 * Standard classnames applied by {@link RulesEngineBuilder}.
 *
 * @group Defaults
 */
export const standardClassnamesRE: Record<keyof ClassnamesRE, string> = {
  rulesEngineBuilder: 'rulesEngineBuilder',
  rulesEngineHeader: 'rulesEngineBuilder-header',
  rulesEngineBody: 'rulesEngineBuilder-body',
  consequentBuilder: 'consequentBuilder',
  consequentBuilderHeader: 'consequentBuilder-header',
  consequentBuilderBody: 'consequentBuilder-body',
  consequentBuilderStandalone: 'consequentBuilder-standalone',
  conditionBuilder: 'conditionBuilder',
  conditionBuilderBody: 'conditionBuilder-body',
  conditionBuilderHeader: 'conditionBuilder-header',
  blockLabel: 'blockLabel',
  blockLabelIf: 'blockLabel-if',
  blockLabelIfElse: 'blockLabel-ifelse',
  blockLabelElse: 'blockLabel-else',
  blockLabelThen: 'blockLabel-then',
  blockLabelWhen: 'blockLabel-when',
  blockLabelAlways: 'blockLabel-always',
  evaluationMode: 'rulesEngineBuilder-evaluationMode',
  shiftActions: 'shiftActions',
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
  blockLabelWhen: { title: 'Independent condition', label: 'When' },
  blockLabelAlways: { title: 'Always-applied consequent', label: 'Always' },
  addCondition: { title: 'Add condition', label: '+ Condition' },
  addSubcondition: { title: 'Add subcondition', label: '+ Subcondition' },
  addConsequent: { title: 'Add consequent action/result', label: '+ Then' },
  addDefaultConsequent: { title: 'Add consequent action/result', label: '+ Else' },
  removeCondition: { title: 'Remove condition', label: '⨯' },
  removeConsequent: { title: 'Remove consequent action/result', label: '⨯' },
  shiftActionUp: { title: 'Shift condition up', label: '˄' },
  shiftActionDown: { title: 'Shift condition down', label: '˅' },
  evaluationMode: { title: 'How sibling conditions are evaluated' },
  evaluationModeCascade: {
    title: 'Evaluate conditions in order; stop after the first match (if/else-if/else)',
    label: 'Stop at first match (cascade)',
  },
  evaluationModeCumulative: {
    title: 'Evaluate every condition independently; any number may match',
    label: 'Evaluate all (cumulative)',
  },
};
