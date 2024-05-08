import * as React from 'react';
import { useContext } from 'react';
import type { RuleGroupProps } from 'react-querybuilder';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import { useRuleGroupDnD } from './hooks';

export const RuleGroupDnD = (props: RuleGroupProps) => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const { canDrop, useDrag, useDrop } = rqbDndContext;

  const disabled = !!props.parentDisabled || !!props.disabled;

  const dndRefs = useRuleGroupDnD({
    ...props,
    disabled,
    useDrag: useDrag!,
    useDrop: useDrop!,
    canDrop,
  });

  const { ruleGroup: BaseRuleGroupComponent } = rqbDndContext.baseControls;

  return <BaseRuleGroupComponent {...props} {...dndRefs} />;
};
