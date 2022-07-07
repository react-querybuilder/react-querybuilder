import { cloneElement, isValidElement } from 'react';
import { useRuleGroupDnD } from './internal/hooks';
import type { RuleGroupDndProps } from './types';

export const RuleGroupDnD = ({
  children,
  path,
  disabled: disabledProp,
  parentDisabled,
  moveRule,
  useDrag,
  useDrop,
}: RuleGroupDndProps) => {
  const disabled = !!parentDisabled || !!disabledProp;

  const dndRefs = useRuleGroupDnD({
    disabled,
    path,
    moveRule,
    useDrag,
    useDrop,
  });

  return isValidElement(children)
    ? cloneElement(children, {
        schema: {
          ...children.props.schema,
          dnd: { ...children.props.schema.dnd, ruleGroup: dndRefs },
        },
      })
    : /* istanbul ignore next */ null;
};

RuleGroupDnD.displayName = 'RuleGroupDnD';
