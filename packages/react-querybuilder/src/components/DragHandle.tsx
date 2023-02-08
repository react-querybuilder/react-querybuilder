import type { DragHandleProps } from '@react-querybuilder/ts';
import { forwardRef } from 'react';

export const DragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  ({ className, label, title, testID }, dragRef) => (
    <span data-testid={testID} ref={dragRef} className={className} title={title}>
      {label}
    </span>
  )
);

DragHandle.displayName = 'DragHandle';
