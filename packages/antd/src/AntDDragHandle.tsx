import { HolderOutlined } from '@ant-design/icons';
import type { ComponentPropsWithRef } from 'react';
import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

/**
 * @group Props
 */
// oxlint-disable-next-line typescript/no-explicit-any
export type AntDDragHandleProps = DragHandleProps & { label?: any } & ComponentPropsWithRef<
    typeof HolderOutlined
  >;

/**
 * @group Components
 */
export const AntDDragHandle: React.ForwardRefExoticComponent<
  Omit<AntDDragHandleProps, 'ref'> & React.RefAttributes<HTMLSpanElement>
> = forwardRef<HTMLSpanElement, AntDDragHandleProps>(
  (
    {
      className,
      title,
      // Props that should not be in extraProps
      testID: _testID,
      level: _level,
      path: _path,
      label: _label,
      disabled: _disabled,
      context: _context,
      validation: _validation,
      schema: _schema,
      ruleOrGroup: _ruleOrGroup,
      ...extraProps
    },
    dragRef
  ) => <HolderOutlined className={className} title={title} {...extraProps} ref={dragRef} />
);
