import { forwardRef } from 'react';
import type { DragHandleProps } from '../../src/types';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default forwardRef<HTMLSpanElement, DragHandleProps>(function BootstrapDragHandle(
  { enabled, className, title },
  dragRef
) {
  return (
    <span ref={dragRef} className={className} title={title}>
      {enabled ? <i className="bi bi-grip-vertical"></i> : ''}
    </span>
  );
});
