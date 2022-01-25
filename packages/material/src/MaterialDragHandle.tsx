import DragIndicator from '@mui/icons-material/DragIndicator';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

export const MaterialDragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  ({ className, title }, dragRef) => (
    <span ref={dragRef} className={className} title={title}>
      <DragIndicator />
    </span>
  )
);

MaterialDragHandle.displayName = 'MaterialDragHandle';
