import type { RuleProps } from '@react-querybuilder/ts';
import { useContext } from 'react';
import { useRuleDnD } from './hooks';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

export const RuleDnD = (props: RuleProps) => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const { useDrag, useDrop } = rqbDndContext;
  const {
    path,
    disabled: disabledProp,
    parentDisabled,
    actions: { moveRule },
    schema: { independentCombinators },
  } = props;

  const disabled = !!parentDisabled || !!disabledProp;

  const dndRefs = useRuleDnD({
    path,
    disabled,
    independentCombinators,
    moveRule,
    useDrag: useDrag!,
    useDrop: useDrop!,
  });

  const { rule: BaseRuleComponent } = rqbDndContext.baseControls;

  return (
    <QueryBuilderDndContext.Provider value={rqbDndContext}>
      <BaseRuleComponent {...props} {...dndRefs} />
    </QueryBuilderDndContext.Provider>
  );
};

RuleDnD.displayName = 'RuleDnD';
