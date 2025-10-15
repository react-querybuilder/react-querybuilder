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
import type {
  RulesEngine,
  RulesEngineAction,
  RulesEngineConditionAny,
  RulesEngineConditions,
} from './rulesEngine';

export interface SchemaRE {
  fields: OptionList<FullField>;
  components: ComponentsRE;
  classnames: ClassnamesRE;
  actionTypes: FullOptionList<BaseOption>;
  autoSelectActionType: boolean;
  suppressStandardClassnames: boolean;
  translations: TranslationsFullRE;
}

export interface ComponentsRE {
  rulesEngineBuilderHeader: React.ComponentType<RulesEngineBuilderHeaderProps>;
  actionBuilder: React.ComponentType<RulesEngineActionProps>;
  actionBuilderHeader: React.ComponentType<RulesEngineActionProps>;
  actionBuilderBody: React.ComponentType<RulesEngineActionProps>;
  // oxlint-disable no-explicit-any
  conditionBuilder: React.ComponentType<RulesEngineConditionProps>;
  conditionBuilderHeader: React.ComponentType<RulesEngineConditionProps>;
  conditionBuilderBody: React.ComponentType<RulesEngineConditionProps>;
  conditionBuilderCascade: React.ComponentType<RulesEngineConditionCascadeProps<any>>;
  // oxlint-enable no-explicit-any
  queryBuilder: React.ComponentType<
    QueryBuilderProps<RuleGroupTypeAny, FullOption, FullOption, FullOption>
  >;
  actionElement: React.ComponentType<ActionElementREProps>;
  addCondition: React.ComponentType<ActionElementREProps>;
  addSubcondition: React.ComponentType<ActionElementREProps>;
  addAction: React.ComponentType<ActionElementREProps>;
  removeCondition: React.ComponentType<ActionElementREProps>;
  removeAction: React.ComponentType<ActionElementREProps>;
  actionSelector: React.ComponentType<ValueSelectorREProps>;
  valueSelector: React.ComponentType<ValueSelectorREProps>;
}

export interface ClassnamesRE {
  /** Classes applied to the wrapper element. */
  rulesEngineBuilder: Classname;
  /** Classes applied to the rules engine header. */
  rulesEngineHeader: Classname;
  /** Classes applied to all block labels ("If", "Else", etc.). */
  blockLabel: Classname;
  /** Classes applied to action builders ("then" sections). */
  actionBuilder: Classname;
  /** Classes applied to action builder headers. */
  actionBuilderHeader: Classname;
  /** Classes applied to action builder bodies. */
  actionBuilderBody: Classname;
  /** Classes applied to standalone action builders ("else" sections). */
  actionBuilderStandalone: Classname;
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
  addAction: BaseTranslationWithLabel<React.ReactNode>;
  removeCondition: BaseTranslationWithLabel<React.ReactNode>;
  removeAction: BaseTranslationWithLabel<React.ReactNode>;
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
  actionTypes?: FullOptionList<BaseOption>;
  autoSelectActionType?: boolean;
  suppressStandardClassnames?: boolean;
  components?: Partial<ComponentsRE>;
  classnames?: Partial<ClassnamesRE>;
  translations?: Partial<TranslationsRE>;
}

export interface RulesEngineBuilderHeaderProps {
  conditionPath: Path;
  classnames: string;
  defaultAction?: RulesEngineAction;
  schema: SchemaRE;
}

export interface RulesEngineConditionCascadeProps<RG extends RuleGroupTypeAny> {
  conditionPath: Path;
  onConditionsChange: (rec: RulesEngineConditions<RG>) => void;
  onDefaultActionChange: (rec?: RulesEngineAction) => void;
  conditions: RulesEngineConditions<RG>;
  defaultAction?: RulesEngineAction;
  schema: SchemaRE;
}

export interface RulesEngineConditionProps {
  schema: SchemaRE;
  conditionPath: Path;
  condition: RulesEngineConditionAny;
  actionTypes?: FullOptionList<BaseOption>;
  isOnlyCondition: boolean;
  onConditionChange: (condition: RulesEngineConditionAny) => void;
  autoSelectActionType?: boolean;
}

export interface RulesEngineActionProps {
  schema: SchemaRE;
  conditionPath: Path;
  actionTypes?: FullOptionList<BaseOption>;
  action: RulesEngineAction;
  standalone?: boolean;
  onActionChange: (action?: RulesEngineAction) => void;
  conditionsMet?: RuleGroupTypeAny;
  conditionsFailed?: RuleGroupTypeAny;
  autoSelectActionType?: boolean;
}
