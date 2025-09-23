import type { BaseOption, FullOptionList, Path, RuleGroupTypeAny } from 'react-querybuilder';
import type { RulesEngine, RulesEngineAction, RulesEngineCondition } from './rulesEngine';

export interface RulesEngineProps {
  conditionPath?: Path;
  onRulesEngineChange?: (re: RulesEngine) => void;
  rulesEngine?: RulesEngine;
  actionTypes?: FullOptionList<BaseOption>;
  autoSelectActionType?: boolean;
}

export interface RulesEngineConditionProps<RG extends RuleGroupTypeAny> {
  conditionPath: Path;
  condition: RulesEngineCondition<RG>;
  actionTypes?: FullOptionList<BaseOption>;
  isOnlyCondition: boolean;
  onConditionChange: (condition: RulesEngineCondition<RG>, index: number) => void;
  autoSelectActionType?: boolean;
}

export interface RulesEngineActionProps {
  conditionPath: Path;
  actionTypes?: FullOptionList<BaseOption>;
  action: RulesEngineAction;
  standalone?: boolean;
  onActionChange: (action: RulesEngineAction, index: number) => void;
  conditionsMet?: RuleGroupTypeAny;
  conditionsFailed?: RuleGroupTypeAny;
  autoSelectActionType?: boolean;
}
