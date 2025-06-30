import type {
  DefaultCombinator,
  DefaultOperator,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  FullField,
  QueryBuilderProps,
} from 'react-querybuilder';

export type CIOption =
  | 'showCombinatorsBetweenRules'
  | 'showNotToggle'
  | 'showCloneButtons'
  | 'showShiftActions'
  | 'resetOnFieldChange'
  | 'resetOnOperatorChange'
  | 'autoSelectField'
  | 'autoSelectOperator'
  | 'addRuleToNewGroups'
  | 'useValidation'
  | 'independentCombinators'
  | 'enableDragAndDrop'
  | 'disabled'
  | 'debugMode'
  | 'parseNumbers'
  | 'listsAsArrays'
  | 'showBranches'
  | 'justifiedLayout';

export type CIOptions = Record<CIOption, boolean>;

export type CIOptionsAction = {
  type: 'update';
  payload: {
    optionName: CIOption;
    value: boolean;
  };
};

export type DefaultQBPropsNoDefaultQueryIC = QueryBuilderProps<
  DefaultRuleGroupTypeIC,
  FullField,
  DefaultOperator,
  DefaultCombinator
>;
export type DefaultQBPropsNoDefaultQuery = QueryBuilderProps<
  DefaultRuleGroupType,
  FullField,
  DefaultOperator,
  DefaultCombinator
>;
