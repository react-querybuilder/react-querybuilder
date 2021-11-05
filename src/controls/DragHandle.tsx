import { forwardRef } from 'react';
import type { DragHandleProps } from '../types';

export default forwardRef<HTMLSpanElement, DragHandleProps>(function DragHandle(
  { className, label, title },
  dragRef
) {
  return (
    <span ref={dragRef} className={className} title={title}>
      {label}
    </span>
  );
});
