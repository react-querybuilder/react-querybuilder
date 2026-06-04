import type { OperatorEvaluator } from 'json-rules-engine';
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
  evaluationMode: '',
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
  evaluationMode: 'rulesEngineBuilder-evaluationMode',
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
  evaluationMode: { title: 'How sibling conditions are evaluated', label: 'Evaluation mode' },
  evaluationModeCascade: {
    title: 'Evaluate conditions in order; stop after the first match (if/else-if/else)',
    label: 'Stop at first match (cascade)',
  },
  evaluationModeCumulative: {
    title: 'Evaluate every condition independently; any number may match',
    label: 'Evaluate all (cumulative)',
  },
};

export const jsonRulesEngineAdditionalOperators: Record<
  string,
  OperatorEvaluator<unknown, unknown>
> = {
  beginsWith: (factValue, compareToValue) => `${factValue}`.startsWith(`${compareToValue}`),
  doesNotBeginWith: (factValue, compareToValue) => !`${factValue}`.startsWith(`${compareToValue}`),
  endsWith: (factValue, compareToValue) => `${factValue}`.endsWith(`${compareToValue}`),
  doesNotEndWith: (factValue, compareToValue) => !`${factValue}`.endsWith(`${compareToValue}`),
  contains: (factValue, compareToValue) => `${factValue}`.includes(`${compareToValue}`),
  doesNotContain: (factValue, compareToValue) => !`${factValue}`.includes(`${compareToValue}`),
};
