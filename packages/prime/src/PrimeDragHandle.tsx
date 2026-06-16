import type { ComponentPropsWithRef } from 'react';
import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

/**
 * @group Props
 */
// oxlint-disable-next-line typescript/no-explicit-any
export type PrimeDragHandleProps = DragHandleProps & { label?: any } & ComponentPropsWithRef<'i'>;

/**
 * @group Components
 */
export const PrimeDragHandle: React.ForwardRefExoticComponent<
  Omit<PrimeDragHandleProps, 'ref'> & React.RefAttributes<HTMLElement>
> = forwardRef<HTMLElement, PrimeDragHandleProps>(
  (
    {
      className,
      title,
      dragHandleAttributes,
      // Props that should not be in extraProps
      testID: _testID,
      level: _level,
      path: _path,
      label: _label,
      disabled: _disabled,
      context: _context,
      validation: _validation,
      schema: _schema,
      ruleOrGroup: _ruleOrGroup,
      ...extraProps
    },
    dragRef
  ) => (
    <i
      className={`pi pi-ellipsis-v ${className ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */}`}
      title={title}
      {...extraProps}
      {...dragHandleAttributes}
      ref={dragRef}
    />
  )
);
