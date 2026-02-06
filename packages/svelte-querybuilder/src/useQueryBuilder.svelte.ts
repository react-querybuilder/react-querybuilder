import type {
  FullField,
  FullOperator,
  FullOptionList,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import {
  addInPlace,
  defaultCombinators,
  defaultOperators,
  defaultTranslations,
  generateID,
  moveInPlace,
  prepareOptionList,
  prepareRuleOrGroup,
  removeInPlace,
  standardClassnames,
  updateInPlace,
} from '@react-querybuilder/core';
import ActionElement from './components/ActionElement.svelte';
import NotToggle from './components/NotToggle.svelte';
import ShiftActions from './components/ShiftActions.svelte';
import ValueEditor from './components/ValueEditor.svelte';
import ValueSelector from './components/ValueSelector.svelte';
import type { QueryBuilderActions, QueryBuilderProps, QueryBuilderSchema } from './types';

export const useQueryBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  getProps: () => QueryBuilderProps<RG>
): { query: RG; schema: QueryBuilderSchema; actions: QueryBuilderActions } => {
  const props = $derived(getProps());

  // Initialize query state
  let query = $state<RG>(props.query ?? ({ combinator: 'and', rules: [] as RG['rules'] } as RG));

  // Set up fields with enhanced metadata
  const fields = $derived<FullOptionList<FullField>>(
    prepareOptionList({ optionList: props.fields }).optionList
  );

  // Set up operators
  const operators = $derived<FullOptionList<FullOperator>>(
    prepareOptionList({ optionList: props.operators ?? defaultOperators }).optionList
  );

  // Set up combinators
  const combinators = $derived(props.combinators ?? defaultCombinators);

  // Set up translations
  const translations = $derived({
    ...defaultTranslations,
    ...props.translations,
  });

  // Set up classnames
  const classNames = $derived({
    ...standardClassnames,
    ...props.controlClassnames,
  });

  // Generate unique ID for this query builder instance
  const qbId = props.qbId ?? `qb-${generateID()}`;

  // Default control components
  const defaultControls = {
    actionElement: ActionElement,
    notToggle: NotToggle,
    shiftActions: ShiftActions,
    valueEditor: ValueEditor,
    valueSelector: ValueSelector,
    combinatorSelector: ValueSelector,
    fieldSelector: ValueSelector,
    operatorSelector: ValueSelector,
    valueSourceSelector: ValueSelector,
  };

  // Merge custom controls
  const controls = $derived({
    ...defaultControls,
    ...props.controlElements,
  });

  // Build schema
  const schema = $derived<QueryBuilderSchema>({
    fields,
    operators,
    combinators,
    controls,
    classNames,
    translations,
    validationMap: props.validator,
    showNotToggle: props.showNotToggle ?? false,
    showCombinatorsBetweenRules: props.showCombinatorsBetweenRules ?? false,
    showCloneButtons: props.showCloneButtons ?? false,
    showLockButtons: props.showLockButtons ?? false,
    showMuteButtons: props.showMuteButtons ?? false,
    showShiftActions: props.showShiftActions ?? false,
    independentCombinators: props.independentCombinators ?? false,
    enableDragAndDrop: props.enableDragAndDrop ?? false,
    autoSelectField: props.autoSelectField ?? true,
    autoSelectOperator: props.autoSelectOperator ?? true,
    addRuleToNewGroups: props.addRuleToNewGroups ?? false,
    resetOnFieldChange: props.resetOnFieldChange ?? true,
    resetOnOperatorChange: props.resetOnOperatorChange ?? false,
    listsAsArrays: props.listsAsArrays ?? false,
    parseNumbers: props.parseNumbers ?? false,
    debugMode: props.debugMode ?? false,
    qbId,
  });

  // Action: Add a new group
  function onGroupAdd(path: number[]) {
    const newGroup: RuleGroupType = {
      id: generateID(),
      combinator: combinators[0]?.name ?? 'and',
      rules: schema.addRuleToNewGroups
        ? [
            {
              id: generateID(),
              field: fields[0]?.name ?? '',
              operator: operators[0]?.name ?? '=',
              value: '',
            },
          ]
        : [],
    };

    const preparedGroup = prepareRuleOrGroup(newGroup, {
      fields,
      operators,
      getNextId: generateID,
    });
    addInPlace(query, preparedGroup, path);
    notifyChange();
  }

  // Action: Remove a group
  function onGroupRemove(path: number[]) {
    removeInPlace(query, path);
    notifyChange();
  }

  // Action: Add a new rule
  function onRuleAdd(path: number[], rule?: RuleType) {
    const newRule: RuleType =
      rule ??
      ({
        id: generateID(),
        field: schema.autoSelectField ? (fields[0]?.name ?? '') : '',
        operator: schema.autoSelectOperator ? (operators[0]?.name ?? '=') : '',
        value: '',
      } as RuleType);

    const preparedRule = prepareRuleOrGroup(newRule, { fields, operators, getNextId: generateID });
    addInPlace(query, preparedRule, path);
    notifyChange();
  }

  // Action: Remove a rule
  function onRuleRemove(path: number[]) {
    removeInPlace(query, path);
    notifyChange();
  }

  // Action: Update a property
  function onPropChange(prop: string, value: unknown, path: number[]) {
    updateInPlace(query, prop, value, path);
    notifyChange();
  }

  // Action: Move or clone a rule/group
  function moveRule(oldPath: number[], newPath: number[], clone = false) {
    moveInPlace(query, oldPath, newPath, { clone });
    notifyChange();
  }

  // Notify parent of changes
  function notifyChange() {
    // Create a deep copy to avoid reference issues
    const updatedQuery = JSON.parse(JSON.stringify(query)) as RG;

    // Regenerate IDs if needed
    if (schema.debugMode) {
      console.log('Query updated:', updatedQuery);
    }

    // Call the onChange callback if provided
    if (props.onQueryChange) {
      props.onQueryChange(updatedQuery);
    }
  }

  // Build actions object
  const actions: QueryBuilderActions = {
    onGroupAdd,
    onGroupRemove,
    onRuleAdd,
    onRuleRemove,
    onPropChange,
    moveRule,
  };

  // Watch for external query changes
  $effect(() => {
    if (props.query && props.query !== query) {
      query = props.query;
    }
  });

  return {
    get query() {
      return query;
    },
    schema,
    actions,
  };
};
