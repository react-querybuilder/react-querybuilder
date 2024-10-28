import { IconButton } from '@chakra-ui/react';
import type { ComponentPropsWithRef } from 'react';
import * as React from 'react';
import { forwardRef } from 'react';
import { MdDragIndicator } from 'react-icons/md';
import type { DragHandleProps } from 'react-querybuilder';

type IBP = ComponentPropsWithRef<typeof IconButton>;

export type ChakraDragHandleProps = DragHandleProps &
  Omit<IBP, 'aria-label'> &
  Partial<Pick<IBP, 'aria-label'>>;

export const ChakraDragHandle: React.ForwardRefExoticComponent<
  Omit<ChakraDragHandleProps, 'ref'> & React.RefAttributes<HTMLSpanElement>
> = forwardRef<HTMLSpanElement, ChakraDragHandleProps>(
  (
    {
      className,
      title,
      disabled,
      // Props that should not be in extraProps
      testID: _testID,
      level: _level,
      path: _path,
      label: _label,
      context: _context,
      validation: _validation,
      schema: _schema,
      ruleOrGroup: _ruleOrGroup,
      ...extraProps
    },
    dragRef
  ) => (
    <span ref={dragRef} className={className} title={title}>
      <IconButton
        disabled={disabled}
        aria-label={title ?? /* istanbul ignore next */ ''}
        {...extraProps}>
        <MdDragIndicator />
      </IconButton>
    </span>
  )
);
