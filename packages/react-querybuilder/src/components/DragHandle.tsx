import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from '../types';

/**
 * Default drag handle component used by {@link QueryBuilder} when `enableDragAndDrop` is `true`.
 *
 * @group Components
 */
export const DragHandle: React.ForwardRefExoticComponent<
  DragHandleProps & React.RefAttributes<HTMLSpanElement>
> = forwardRef<HTMLSpanElement, DragHandleProps>((props, dragRef) => (
  <span data-testid={props.testID} ref={dragRef} className={props.className} title={props.title}>
    {props.label}
  </span>
));
