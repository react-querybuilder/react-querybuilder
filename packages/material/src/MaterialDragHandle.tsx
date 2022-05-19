import DragIndicator from '@mui/icons-material/DragIndicator';
import { forwardRef, type ComponentPropsWithRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

type MaterialDragHandleProps = DragHandleProps &
  Omit<ComponentPropsWithRef<typeof DragIndicator>, 'path'>;

export const MaterialDragHandle = forwardRef<HTMLSpanElement, MaterialDragHandleProps>(
  (
    {
      className,
      title,
      path: _path,
      // Props that should not be in extraProps
      testID: _testID,
      ref: _ref,
      level: _level,
      label: _label,
      disabled: _disabled,
      context: _context,
      validation: _validation,
      ...extraProps
    },
    dragRef
  ) => (
    <span ref={dragRef} className={className} title={title}>
      <DragIndicator {...extraProps} />
    </span>
  )
);

MaterialDragHandle.displayName = 'MaterialDragHandle';
