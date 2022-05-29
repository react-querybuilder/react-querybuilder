import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  QueryBuilderProps,
} from 'react-querybuilder';

export type CIOption =
  | 'showCombinatorsBetweenRules'
  | 'showNotToggle'
  | 'showCloneButtons'
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
  | 'parseNumbers';

export type CIOptions = Record<CIOption, boolean>;

export type CIOptionsAction = {
  type: 'update';
  payload: {
    optionName: CIOption;
    value: boolean;
  };
};

export type DefaultQBPropsNoDefaultQueryIC = Omit<
  QueryBuilderProps<DefaultRuleGroupTypeIC>,
  'defaultQuery'
>;
export type DefaultQBPropsNoDefaultQuery = Omit<
  QueryBuilderProps<DefaultRuleGroupType>,
  'defaultQuery'
>;
