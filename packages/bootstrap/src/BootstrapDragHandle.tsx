import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

export const BootstrapDragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  ({ className, title }, dragRef) => (
    <span ref={dragRef} className={className} title={title}>
      <i className="bi bi-grip-vertical"></i>
    </span>
  )
);

BootstrapDragHandle.displayName = 'BootstrapDragHandle';
