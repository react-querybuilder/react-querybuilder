import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

export default forwardRef<HTMLSpanElement, DragHandleProps>(function MaterialDragHandle(
  { className, title },
  dragRef
) {
  return (
    <span ref={dragRef} className={className} title={title}>
      <DragIndicatorIcon />
    </span>
  );
});
