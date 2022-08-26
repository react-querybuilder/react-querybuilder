import { cloneElement, isValidElement } from 'react';
import { standardClassnames } from 'react-querybuilder';
import { useRuleDnD } from './internal/hooks';
import type { RuleDndProps } from './types';

export const RuleDnD = ({
  children,
  moveRule,
  disabled: disabledProp,
  parentDisabled,
  path,
  independentCombinators,
  useDrag,
  useDrop,
}: RuleDndProps) => {
  const disabled = !!parentDisabled || !!disabledProp;

  const dndRefs = useRuleDnD({
    path,
    disabled,
    independentCombinators,
    moveRule,
    useDrag,
    useDrop,
  });

  const rule = `${children.props.schema.classNames.rule}${
    dndRefs.isOver ? ` ${standardClassnames.dndOver}` : ''
  }${dndRefs.isDragging ? ` ${standardClassnames.dndDragging}` : ''}`;

  return isValidElement(children)
    ? cloneElement(children, {
        ...dndRefs,
        schema: {
          ...children.props.schema,
          classNames: { ...children.props.schema.classNames, rule },
        },
      })
    : /* istanbul ignore next */ null;
};

RuleDnD.displayName = 'RuleDnD';
