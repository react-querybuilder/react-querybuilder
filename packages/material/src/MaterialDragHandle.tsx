import { DragIndicator } from '@mui/icons-material';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

export default forwardRef<HTMLSpanElement, DragHandleProps>(function MaterialDragHandle(
  { className, title },
  dragRef
) {
  return (
    <span ref={dragRef} className={className} title={title}>
      <DragIndicator />
    </span>
  );
});
