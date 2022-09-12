import type { RuleGroupProps } from '@react-querybuilder/ts';
import { useContext, useMemo } from 'react';
import { standardClassnames } from 'react-querybuilder';
import { useRuleGroupDnD } from './hooks';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

export const RuleGroupDnD = (props: RuleGroupProps) => {
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

  const dndRefs = useRuleGroupDnD({
    disabled,
    path,
    independentCombinators,
    moveRule,
    useDrag: useDrag!,
    useDrop: useDrop!,
  });

  const schema = useMemo(
    () => ({
      ...props.schema,
      classNames: {
        ...props.schema.classNames,
        header: `${props.schema.classNames.header}${
          dndRefs.isOver ? ` ${standardClassnames.dndOver}` : ''
        }`,
        ruleGroup: `${props.schema.classNames.ruleGroup}${
          dndRefs.isDragging ? ` ${standardClassnames.dndDragging}` : ''
        }`,
      },
    }),
    [props.schema, dndRefs.isOver, dndRefs.isDragging]
  );

  const { ruleGroup: BaseRuleGroupComponent } = rqbDndContext.baseControls;

  return <BaseRuleGroupComponent {...props} schema={schema} {...dndRefs} />;
};

RuleGroupDnD.displayName = 'RuleGroupDnD';
