import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

// TODO: Is this component necessary?
export const TremorDragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  (
    { className, title, label, testID, schema: _schema, ruleOrGroup: _ruleOrGroup, ...otherProps },
    dragRef
  ) => (
    <span ref={dragRef} data-testid={testID} {...otherProps} className={className} title={title}>
      {label}
    </span>
  )
);

TremorDragHandle.displayName = 'TremorDragHandle';
