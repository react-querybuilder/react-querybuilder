import type {
  BaseOption,
  BaseTranslationWithLabel,
  Classname,
  FullOption,
  FullOptionList,
  Path,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import * as React from 'react';
import type { QueryBuilderProps } from 'react-querybuilder';
import type { Except } from 'type-fest';
import type { ActionElementREProps, ValueSelectorREProps } from '../components';
import type {
  Consequent,
  REConditionAny,
  REConditionCascade,
  RulesEngine,
  RulesEngineAny,
} from './rulesEngine';

export interface SchemaRE {
  reId: string;
  components: ComponentsRE;
  classnames: ClassnamesRE;
  consequentTypes: FullOptionList<BaseOption>;
  autoSelectConsequentType: boolean;
  suppressStandardClassnames: boolean;
  allowNestedConditions: boolean;
  translations: TranslationsFullRE;
  queryBuilderProps?: Except<
    QueryBuilderProps<RuleGroupTypeAny, FullOption, FullOption, FullOption>,
    'query' | 'onQueryChange'
  >;
  getRulesEngine: () => RulesEngineAny;
  dispatchRulesEngine: (re: RulesEngineAny) => void;
  addCondition: (cp: Path) => void;
  removeCondition: (cp: Path) => void;
  updateCondition: (cp: Path, p: string, v: unknown) => void;
}

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
  /** Classes applied to all "If" block labels. */
  blockLabelIf: Classname;
  /** Classes applied to all "If Else" block labels. */
  blockLabelIfElse: Classname;
  /** Classes applied to all "Else" block labels. */
  blockLabelElse: Classname;
  /** Classes applied to all "Then" block labels. */
  blockLabelThen: Classname;
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
  addDefaultConsequent: BaseTranslationWithLabel<React.ReactNode>;
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
  rulesEngine?: RulesEngine;
  defaultRulesEngine?: RulesEngine;
  onRulesEngineChange?: (re: RulesEngine) => void;
  consequentTypes?: FullOptionList<BaseOption>;
  autoSelectConsequentType?: boolean;
  suppressStandardClassnames?: boolean;
  allowNestedConditions?: boolean;
  enableMountRulesEngineChange?: boolean;
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

export interface RulesEngineBuilderHeaderProps {
  conditionPath: Path;
  classnames: string;
  defaultConsequent?: Consequent;
  schema: SchemaRE;
}

export interface ConditionCascadeProps<RG extends RuleGroupTypeAny> {
  conditionPath: Path;
  conditions: REConditionCascade<RG>;
  defaultConsequent?: Consequent;
  schema: SchemaRE;
}

export interface ConditionProps {
  schema: SchemaRE;
  conditionPath: Path;
  condition: REConditionAny;
  consequentTypes?: FullOptionList<BaseOption>;
  isOnlyCondition: boolean;
  // onConditionChange: (condition: REConditionAny) => void;
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
