<script lang="ts">
  import type { RuleGroupType } from '@react-querybuilder/core';
  import { clsx } from '@react-querybuilder/core';
  import { setContext } from 'svelte';
  import type { QueryBuilderProps } from '../types';
  import { useQueryBuilder } from '../useQueryBuilder.svelte';
  import RuleGroup from './RuleGroup.svelte';

  let {
    query = $bindable({ combinator: 'and', rules: [] } as RuleGroupType),
    fields = [],
    onQueryChange,
    operators,
    combinators,
    controlElements,
    controlClassnames,
    translations,
    showNotToggle = false,
    showCombinatorsBetweenRules = false,
    disabled = false,
    addRuleToNewGroups = false,
    independentCombinators = false,
    enableDragAndDrop = false,
    validator,
    context,
    showCloneButtons = false,
    showLockButtons = false,
    showMuteButtons = false,
    showShiftActions = false,
    resetOnFieldChange = true,
    resetOnOperatorChange = false,
    autoSelectField = true,
    autoSelectOperator = true,
    listsAsArrays = false,
    parseNumbers = false,
    debugMode = false,
    qbId,
    ...restProps
  }: QueryBuilderProps = $props();

  // Use the query builder composable - pass props as a getter to maintain reactivity
  const qb = useQueryBuilder(() => ({
    query,
    fields,
    onQueryChange,
    operators,
    combinators,
    controlElements,
    controlClassnames,
    translations,
    showNotToggle,
    showCombinatorsBetweenRules,
    disabled,
    addRuleToNewGroups,
    independentCombinators,
    enableDragAndDrop,
    validator,
    context,
    showCloneButtons,
    showLockButtons,
    showMuteButtons,
    showShiftActions,
    resetOnFieldChange,
    resetOnOperatorChange,
    autoSelectField,
    autoSelectOperator,
    listsAsArrays,
    parseNumbers,
    debugMode,
    qbId
  }));

  // Set up context for child components
  setContext('queryBuilder', {
    get schema() { return qb.schema; },
    get actions() { return qb.actions; },
    get context() { return context; }
  });

  // Sync internal query with bound prop
  $effect(() => {
    query = qb.query;
  });

  const queryBuilderClassName = $derived(
    clsx(
      qb.schema.classNames.queryBuilder,
      disabled && qb.schema.classNames.disabled
    )
  );
</script>

<div
  class={queryBuilderClassName}
  data-qb-id={qb.schema.qbId}
  {...restProps}
>
  <RuleGroup
    ruleGroup={qb.query}
    path={[]}
    schema={qb.schema}
    actions={qb.actions}
    level={0}
    disabled={disabled}
    context={context}
  />
</div>
