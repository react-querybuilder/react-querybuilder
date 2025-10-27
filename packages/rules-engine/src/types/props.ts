import type {
  BaseOption,
  BaseTranslationWithLabel,
  Classname,
  FlexibleOptionList,
  FullField,
  FullOption,
  FullOptionList,
  OptionList,
  Path,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import * as React from 'react';
import type { QueryBuilderProps } from 'react-querybuilder';
import type { ActionElementREProps, ValueSelectorREProps } from '../components';
import type { AntecedentAny, AntecedentCascade, Consequent, RulesEngine } from './rulesEngine';

export interface SchemaRE {
  fields: OptionList<FullField>;
  components: ComponentsRE;
  classnames: ClassnamesRE;
  consequentTypes: FullOptionList<BaseOption>;
  autoSelectConsequentType: boolean;
  suppressStandardClassnames: boolean;
  translations: TranslationsFullRE;
}

export interface ComponentsRE {
  rulesEngineBuilderHeader: React.ComponentType<RulesEngineBuilderHeaderProps>;
  consequentBuilder: React.ComponentType<ConsequentProps>;
  consequentBuilderHeader: React.ComponentType<ConsequentProps>;
  consequentBuilderBody: React.ComponentType<ConsequentProps>;
  // oxlint-disable no-explicit-any
  conditionBuilder: React.ComponentType<ConditionProps>;
  conditionBuilderHeader: React.ComponentType<ConditionProps>;
  conditionBuilderBody: React.ComponentType<ConditionProps>;
  conditionBuilderCascade: React.ComponentType<ConditionCascadeProps<any>>;
  // oxlint-enable no-explicit-any
  queryBuilder: React.ComponentType<
    QueryBuilderProps<RuleGroupTypeAny, FullOption, FullOption, FullOption>
  >;
  actionElement: React.ComponentType<ActionElementREProps>;
  addCondition: React.ComponentType<ActionElementREProps>;
  addSubcondition: React.ComponentType<ActionElementREProps>;
  addConsequent: React.ComponentType<ActionElementREProps>;
  removeCondition: React.ComponentType<ActionElementREProps>;
  removeConsequent: React.ComponentType<ActionElementREProps>;
  consequentSelector: React.ComponentType<ValueSelectorREProps>;
  valueSelector: React.ComponentType<ValueSelectorREProps>;
}

export interface ClassnamesRE {
  /** Classes applied to the wrapper element. */
  rulesEngineBuilder: Classname;
  /** Classes applied to the rules engine header. */
  rulesEngineHeader: Classname;
  /** Classes applied to all block labels ("If", "Else", etc.). */
  blockLabel: Classname;
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
  /** Classes applied to condition builder headers ("if"/"else if" labels and controls). */
  conditionBuilderHeader: Classname;
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
  addCondition: BaseTranslationWithLabel<React.ReactNode>;
  addSubcondition: BaseTranslationWithLabel<React.ReactNode>;
  addConsequent: BaseTranslationWithLabel<React.ReactNode>;
  removeCondition: BaseTranslationWithLabel<React.ReactNode>;
  removeConsequent: BaseTranslationWithLabel<React.ReactNode>;
}
/**
 * The full `translations` interface for {@link RulesEngineBuilder}, with all properties required.
 *
 * @group Props
 */
// export type TranslationsFullRE = RequiredDeep<TranslationsRE>;
export type TranslationsFullRE = {
  [K in keyof TranslationsRE]: { [T in keyof TranslationsRE[K]]-?: TranslationsRE[K][T] };
};

export interface RulesEngineProps {
  fields?: FlexibleOptionList<FullField>;
  onRulesEngineChange?: (re: RulesEngine) => void;
  rulesEngine?: RulesEngine;
  consequentTypes?: FullOptionList<BaseOption>;
  autoSelectConsequentType?: boolean;
  suppressStandardClassnames?: boolean;
  components?: Partial<ComponentsRE>;
  classnames?: Partial<ClassnamesRE>;
  translations?: Partial<TranslationsRE>;
}

export interface RulesEngineBuilderHeaderProps {
  conditionPath: Path;
  classnames: string;
  defaultConsequent?: Consequent;
  schema: SchemaRE;
}

export interface ConditionCascadeProps<RG extends RuleGroupTypeAny> {
  conditionPath: Path;
  onConditionsChange: (rec: AntecedentCascade<RG>) => void;
  onDefaultConsequentChange: (rec?: Consequent) => void;
  conditions: AntecedentCascade<RG>;
  defaultConsequent?: Consequent;
  schema: SchemaRE;
}

export interface ConditionProps {
  schema: SchemaRE;
  conditionPath: Path;
  condition: AntecedentAny;
  consequentTypes?: FullOptionList<BaseOption>;
  isOnlyCondition: boolean;
  onConditionChange: (condition: AntecedentAny) => void;
  autoSelectConsequentType?: boolean;
}

export interface ConsequentProps {
  schema: SchemaRE;
  conditionPath: Path;
  consequentTypes?: FullOptionList<BaseOption>;
  consequent: Consequent;
  standalone?: boolean;
  onConsequentChange: (consequent?: Consequent) => void;
  conditionsMet?: RuleGroupTypeAny;
  conditionsFailed?: RuleGroupTypeAny;
  autoSelectConsequentType?: boolean;
}
