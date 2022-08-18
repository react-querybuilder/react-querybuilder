import { cloneElement, isValidElement } from 'react';
import { standardClassnames } from 'react-querybuilder';
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

  /* istanbul ignore else */
  if (isValidElement(children)) {
    const header = `${children.props.schema.classNames.header}${
      dndRefs.isOver ? ` ${standardClassnames.dndOver}` : ''
    }`;
    const ruleGroup = `${children.props.schema.classNames.ruleGroup}${
      dndRefs.isDragging ? ` ${standardClassnames.dndDragging}` : ''
    }`;

    return cloneElement(children, {
      ...dndRefs,
      schema: {
        ...children.props.schema,
        classNames: { ...children.props.schema.classNames, header, ruleGroup },
      },
    });
  }

  /* istanbul ignore next */
  return null;
};

RuleGroupDnD.displayName = 'RuleGroupDnD';
