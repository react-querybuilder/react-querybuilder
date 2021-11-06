import { DragHandleIcon } from '@chakra-ui/icons';
import { forwardRef } from 'react';
import type { DragHandleProps } from '../../src/types';

export default forwardRef<HTMLSpanElement, DragHandleProps>(function AntDDragHandle(
  { enabled, className, title },
  dragRef
) {
  return (
    <span ref={dragRef} className={className} title={title}>
      {enabled ? <DragHandleIcon /> : ''}
    </span>
  );
});
