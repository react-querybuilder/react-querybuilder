import { cloneElement, isValidElement } from 'react';
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

  return isValidElement(children)
    ? cloneElement(children, {
        schema: { ...children.props.schema, dnd: { ...children.props.schema.dnd, rule: dndRefs } },
      })
    : /* istanbul ignore next */ null;
};

RuleDnD.displayName = 'RuleDnD';
