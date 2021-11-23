import { HolderOutlined } from '@ant-design/icons';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

export default forwardRef<HTMLSpanElement, DragHandleProps>(function AntDDragHandle(
  { className, title },
  dragRef
) {
  return (
    <span ref={dragRef} className={className} title={title}>
      <HolderOutlined />
    </span>
  );
});
