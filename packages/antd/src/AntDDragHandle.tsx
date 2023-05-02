import { HolderOutlined } from '@ant-design/icons';
import type { ComponentPropsWithRef } from 'react';
import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

type AntDDragHandleProps = DragHandleProps & ComponentPropsWithRef<typeof HolderOutlined>;

export const AntDDragHandle = forwardRef<HTMLSpanElement, AntDDragHandleProps>(
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
      ...extraProps
    },
    dragRef
  ) => <HolderOutlined ref={dragRef} className={className} title={title} {...extraProps} />
);

AntDDragHandle.displayName = 'AntDDragHandle';
