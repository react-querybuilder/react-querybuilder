import { forwardRef } from 'react';
import type { DragHandleProps } from '../types';

const DragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  ({ className, label, title }, dragRef) => (
    <span ref={dragRef} className={className} title={title}>
      {label}
    </span>
  )
);

DragHandle.displayName = 'DragHandle';

export default DragHandle;
