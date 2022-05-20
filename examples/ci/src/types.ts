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
