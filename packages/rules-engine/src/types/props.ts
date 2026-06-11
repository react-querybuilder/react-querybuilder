import type {
  BaseTranslation,
  BaseTranslationWithLabel,
  Classname,
  FlexibleOptionList,
  FlexibleOptionListProp,
  FullOption,
  FullOptionList,
  Path,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import * as React from 'react';
import type { QueryBuilderProps } from 'react-querybuilder';
import type { Except } from 'type-fest';
import type {
  ActionElementREProps,
  ShiftActionsREProps,
  ValueSelectorREProps,
} from '../components';
import type { EvaluationMode } from './export';
import type {
  Consequent,
  ConsequentTypeOption,
  FullConsequentTypeOption,
  REConditionAny,
  REConditionCascade,
  RulesEngine,
  RulesEngineAny,
} from './rulesEngine';

/**
 * Configuration options passed in the `schema` prop from
 * {@link RulesEngineBuilder} to each subcomponent.
 *
 * @group Props
 */
export interface SchemaRE {
  reId: string;
  components: ComponentsRE;
  classnames: ClassnamesRE;
  consequentTypes: FullOptionList<FullConsequentTypeOption>;
  autoSelectConsequentType: boolean;
  suppressStandardClassnames: boolean;
  allowDefaultConsequents: boolean;
  allowNestedConditions: boolean;
  showShiftActions: boolean;
  evaluationMode: EvaluationMode;
  translations: TranslationsFullRE;
  queryBuilderProps?: Except<
    QueryBuilderProps<RuleGroupTypeAny, FullOption, FullOption, FullOption>,
    'query' | 'onQueryChange'
  >;
  getRulesEngine: () => RulesEngineAny;
  dispatchRulesEngine: (re: RulesEngineAny) => void;
  addCondition: (parentConditionPath: Path, condition?: REConditionAny) => void;
  removeCondition: (conditionPath: Path) => void;
  moveCondition: (conditionPath: Path, direction: 'up' | 'down') => void;
  updateCondition: (conditionPath: Path, property: string, value: unknown) => void;
  defaultConsequentType: FullOption;
  getConsequentTypes: (
    conditionPath: Path,
    antecedent: RuleGroupTypeAny,
    context?: unknown
  ) => FullOptionList<FullConsequentTypeOption>;
  getDefaultConsequentType: (
    conditionPath: Path,
    antecedent: RuleGroupTypeAny,
    context?: unknown
  ) => string;
}

/**
 * All subcomponents.
 *
 * @group Props
 */
export interface ComponentsRE {
  rulesEngineBuilderHeader: React.ComponentType<RulesEngineBuilderHeaderProps>;
  consequentBuilder: React.ComponentType<ConsequentProps>;
  consequentBuilderHeader: React.ComponentType<ConsequentProps>;
  consequentBuilderBody: React.ComponentType<ConsequentProps>;
  conditionBuilder: React.ComponentType<ConditionProps>;
  conditionBuilderHeader: React.ComponentType<ConditionProps>;
  conditionBuilderBody: React.ComponentType<ConditionProps>;
  conditionBuilderCascade: React.ComponentType<ConditionCascadeProps<RuleGroupTypeAny>>;
  queryBuilder: React.ComponentType<
    QueryBuilderProps<RuleGroupTypeAny, FullOption, FullOption, FullOption>
  >;
  actionElement: React.ComponentType<ActionElementREProps>;
  addCondition: React.ComponentType<ActionElementREProps>;
  addSubcondition: React.ComponentType<ActionElementREProps>;
  addConsequent: React.ComponentType<ActionElementREProps>;
  removeCondition: React.ComponentType<ActionElementREProps>;
  removeConsequent: React.ComponentType<ActionElementREProps>;
  shiftActions: React.ComponentType<ShiftActionsREProps>;
  consequentSelector: React.ComponentType<ValueSelectorREProps>;
  valueSelector: React.ComponentType<ValueSelectorREProps>;
}

/**
 * Classnames applied to each component.
 *
 * @group Props
 */
export interface ClassnamesRE {
  /** Classes applied to the wrapper element. */
  rulesEngineBuilder: Classname;
  /** Classes applied to the rules engine header. */
  rulesEngineHeader: Classname;
  /** Classes applied to the rules engine body. */
  rulesEngineBody: Classname;
  /** Classes applied to all block labels ("If", "Else", etc.). */
  blockLabel: Classname;
  /** Classes applied to all "If" block labels (cascade mode initial condition). */
  blockLabelIf: Classname;
  /** Classes applied to all "If Else" block labels (cascade mode subsequent conditions). */
  blockLabelIfElse: Classname;
  /** Classes applied to all "Else" block labels (cascade mode default condition). */
  blockLabelElse: Classname;
  /** Classes applied to all "Then" block labels. */
  blockLabelThen: Classname;
  /** Classes applied to all "When" block labels (cumulative mode conditions). */
  blockLabelWhen: Classname;
  /** Classes applied to all "Always" block labels (cumulative mode default consequent). */
  blockLabelAlways: Classname;
  /** Classes applied to consequent builders ("then" sections). */
  consequentBuilder: Classname;
  /** Classes applied to consequent builder headers. */
  consequentBuilderHeader: Classname;
  /** Classes applied to consequent builder bodies. */
  consequentBuilderBody: Classname;
  /** Classes applied to standalone consequent builders ("else" sections). */
  consequentBuilderStandalone: Classname;
  /** Classes applied to condition builders ("if"/"else if" sections). */
  conditionBuilder: Classname;
  /** Classes applied to condition builder bodies ("if"/"else if" content). */
  conditionBuilderBody: Classname;
  /** Classes applied to condition builder headers ("if"/"else if" labels and controls). */
  conditionBuilderHeader: Classname;
  /** Classes applied to the evaluation mode toggle control. */
  evaluationMode: Classname;
  /** Classes applied to the shift up/down action container in condition headers. */
  shiftActions: Classname;
}

/**
 * The shape of the `translations` prop for {@link RulesEngineBuilder}.
 *
 * @group Props
 */
export interface TranslationsRE {
  blockLabelIf: BaseTranslationWithLabel<React.ReactNode>;
  blockLabelElseIf: BaseTranslationWithLabel<React.ReactNode>;
  blockLabelElse: BaseTranslationWithLabel<React.ReactNode>;
  blockLabelThen: BaseTranslationWithLabel<React.ReactNode>;
  blockLabelWhen: BaseTranslationWithLabel<React.ReactNode>;
  blockLabelAlways: BaseTranslationWithLabel<React.ReactNode>;
  addCondition: BaseTranslationWithLabel<React.ReactNode>;
  addSubcondition: BaseTranslationWithLabel<React.ReactNode>;
  addConsequent: BaseTranslationWithLabel<React.ReactNode>;
  addDefaultConsequent: BaseTranslationWithLabel<React.ReactNode>;
  removeCondition: BaseTranslationWithLabel<React.ReactNode>;
  removeConsequent: BaseTranslationWithLabel<React.ReactNode>;
  shiftActionUp: BaseTranslationWithLabel<React.ReactNode>;
  shiftActionDown: BaseTranslationWithLabel<React.ReactNode>;
  evaluationMode: BaseTranslation;
  evaluationModeCascade: BaseTranslationWithLabel<React.ReactNode>;
  evaluationModeCumulative: BaseTranslationWithLabel<React.ReactNode>;
}
/**
 * The full `translations` interface for {@link RulesEngineBuilder}, with all properties required.
 *
 * @group Props
 */
export type TranslationsFullRE = {
  [K in keyof TranslationsRE]: { [T in keyof TranslationsRE[K]]-?: TranslationsRE[K][T] };
};

/**
 * Props for {@link RulesEngineBuilder}.
 *
 * @group Props
 */
export interface RulesEngineProps {
  rulesEngine?: RulesEngine;
  defaultRulesEngine?: RulesEngine;
  onRulesEngineChange?: (re: RulesEngine) => void;
  consequentTypes?: FlexibleOptionList<ConsequentTypeOption>;
  getConsequentTypes?: (
    conditionPath: Path,
    antecedent: RuleGroupTypeAny,
    context?: unknown
  ) => FlexibleOptionListProp<ConsequentTypeOption> | null;
  onAddCondition?: (
    condition: REConditionAny,
    parentConditionPath: Path,
    rulesEngine: RulesEngineAny
  ) => REConditionAny | boolean;
  onRemoveCondition?: (
    condition: REConditionAny,
    conditionPath: Path,
    rulesEngine: RulesEngineAny
  ) => REConditionAny | boolean;
  /**
   * This callback is invoked before a condition is shifted up or down. Return `true` to allow
   * the shift, `false` to cancel it, or a new rules engine object which will become the new state.
   */
  onMoveCondition?: (
    condition: REConditionAny,
    fromPath: Path,
    direction: 'up' | 'down',
    rulesEngine: RulesEngineAny,
    nextRulesEngine: RulesEngineAny
  ) => RulesEngineAny | boolean;
  autoSelectConsequentType?: boolean;
  suppressStandardClassnames?: boolean;
  allowDefaultConsequents?: boolean;
  allowNestedConditions?: boolean;
  showShiftActions?: boolean;
  /**
   * When `true`, newly added conditions are seeded with a consequent using the default
   * consequent type for that condition.
   */
  addConsequentToNewConditions?: boolean;
  enableMountRulesEngineChange?: boolean;
  showBranches?: boolean;
  components?: Partial<ComponentsRE>;
  classnames?: Partial<ClassnamesRE>;
  translations?: Partial<TranslationsRE>;
  queryBuilderProps?: Except<
    QueryBuilderProps<RuleGroupTypeAny, FullOption, FullOption, FullOption>,
    'query' | 'onQueryChange'
  >;
  /**
   * `id` generator function. Should always produce a unique/random string.
   *
   * @default crypto.randomUUID
   */
  idGenerator?: () => string;
}

/**
 * Props for {@link RulesEngineBuilderHeader}.
 *
 * @group Props
 */
export interface RulesEngineBuilderHeaderProps {
  conditionPath: Path;
  classnames: string;
  defaultConsequent?: Consequent;
  schema: SchemaRE;
}

/**
 * Props for {@link ConditionCascade}.
 *
 * @group Props
 */
export interface ConditionCascadeProps<RG extends RuleGroupTypeAny> {
  conditionPath: Path;
  conditions: REConditionCascade<RG>;
  defaultConsequent?: Consequent;
  schema: SchemaRE;
}

/**
 * Props for {@link ConditionBuilder}.
 *
 * @group Props
 */
export interface ConditionProps {
  schema: SchemaRE;
  conditionPath: Path;
  condition: REConditionAny;
  consequentTypes?: FullOptionList<FullConsequentTypeOption>;
  isOnlyCondition: boolean;
  // onConditionChange: (condition: REConditionAny) => void;
  autoSelectConsequentType?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
}

/**
 * Props for {@link ConsequentBuilder}, {@link ConsequentBuilderHeader}, and {@link ConsequentBuilderBody}.
 *
 * @group Props
 */
export interface ConsequentProps {
  schema: SchemaRE;
  conditionPath: Path;
  consequentTypes?: FullOptionList<FullConsequentTypeOption>;
  consequent: Consequent;
  standalone?: boolean;
  onConsequentChange: (consequent?: Consequent) => void;
  conditionsMet?: RuleGroupTypeAny;
  conditionsFailed?: RuleGroupTypeAny;
  autoSelectConsequentType?: boolean;
}
