import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from '../types';

/**
 * Defaut drag handle component used by {@link QueryBuilder} when
 * `enableDragAndDrop` is `true`.
 */
export const DragHandle = forwardRef<HTMLSpanElement, DragHandleProps>((props, dragRef) => (
  <span data-testid={props.testID} ref={dragRef} className={props.className} title={props.title}>
    {props.label}
  </span>
));
