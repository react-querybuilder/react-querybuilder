import type {
  BaseOption,
  Classname,
  FlexibleOptionList,
  FullField,
  FullOptionList,
  OptionList,
  Path,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import * as React from 'react';
import type {
  RulesEngine,
  RulesEngineAction,
  RulesEngineCondition,
  RulesEngineConditions,
} from './rulesEngine';

export interface SchemaRE {
  fields: OptionList<FullField>;
  components: ComponentsRE;
  classnames: ClassnamesRE;
  actionTypes: FullOptionList<BaseOption>;
  autoSelectActionType: boolean;
}

export interface ComponentsRE {
  actionBuilder: React.ComponentType<RulesEngineActionProps>;
  actionBuilderHeader: React.ComponentType<RulesEngineActionProps>;
  // oxlint-disable-next-line no-explicit-any
  conditionBuilder: React.ComponentType<RulesEngineConditionProps<any>>;
  // oxlint-disable-next-line no-explicit-any
  conditionBuilderHeader: React.ComponentType<RulesEngineConditionProps<any>>;
}

export interface ClassnamesRE {
  /** Classes applied to the wrapper element. */
  rulesEngineBuilder: Classname;
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

export interface RulesEngineProps {
  fields?: FlexibleOptionList<FullField>;
  onRulesEngineChange?: (re: RulesEngine) => void;
  rulesEngine?: RulesEngine;
  actionTypes?: FullOptionList<BaseOption>;
  autoSelectActionType?: boolean;
  components?: Partial<ComponentsRE>;
  classnames?: Partial<ClassnamesRE>;
}

export interface RulesEngineConditionCascadeProps<RG extends RuleGroupTypeAny> {
  conditionPath: Path;
  onChange: (rec: RulesEngineConditions<RG>) => void;
  conditions: RulesEngineConditions<RG>;
  schema: SchemaRE;
}

export interface RulesEngineConditionProps<RG extends RuleGroupTypeAny> {
  schema: SchemaRE;
  conditionPath: Path;
  condition: RulesEngineCondition<RG>;
  actionTypes?: FullOptionList<BaseOption>;
  isOnlyCondition: boolean;
  onConditionChange: (condition: RulesEngineCondition<RG>) => void;
  autoSelectActionType?: boolean;
}

export interface RulesEngineActionProps {
  schema: SchemaRE;
  conditionPath: Path;
  actionTypes?: FullOptionList<BaseOption>;
  action: RulesEngineAction;
  standalone?: boolean;
  onActionChange: (action: RulesEngineAction) => void;
  conditionsMet?: RuleGroupTypeAny;
  conditionsFailed?: RuleGroupTypeAny;
  autoSelectActionType?: boolean;
}
