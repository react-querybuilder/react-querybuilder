import type { RuleGroupProps } from '@react-querybuilder/ts';
import { useContext } from 'react';
import { useRuleGroupDnD } from './hooks';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

export const RuleGroupDnD = (props: RuleGroupProps) => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const { useDrag, useDrop, waitForDrop = true } = rqbDndContext;
  const {
    path,
    disabled: disabledProp,
    parentDisabled,
    actions: { moveRule },
    schema: { independentCombinators },
  } = props;

  const disabled = !!parentDisabled || !!disabledProp;

  const dndRefs = useRuleGroupDnD({
    path,
    disabled,
    independentCombinators,
    waitForDrop,
    moveRule,
    useDrag: useDrag!,
    useDrop: useDrop!,
  });

  const { ruleGroup: BaseRuleGroupComponent } = rqbDndContext.baseControls;

  return <BaseRuleGroupComponent {...props} {...dndRefs} />;
};

RuleGroupDnD.displayName = 'RuleGroupDnD';
