import { useContext, useMemo } from 'react';
import type { RuleProps } from 'react-querybuilder';
import { standardClassnames } from 'react-querybuilder';
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

  const rule = useMemo(
    () =>
      `${props.schema.classNames.rule}${dndRefs.isOver ? ` ${standardClassnames.dndOver}` : ''}${
        dndRefs.isDragging ? ` ${standardClassnames.dndDragging}` : ''
      }`,
    [dndRefs.isDragging, dndRefs.isOver, props.schema.classNames.rule]
  );

  const { rule: BaseRuleComponent } = rqbDndContext.baseControls;

  return (
    <QueryBuilderDndContext.Provider value={rqbDndContext}>
      <BaseRuleComponent
        {...props}
        schema={{
          ...props.schema,
          classNames: { ...props.schema.classNames, rule },
        }}
        {...dndRefs}
      />
    </QueryBuilderDndContext.Provider>
  );
};

RuleDnD.displayName = 'RuleDnD';
