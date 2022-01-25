import { DragHandleIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

export const ChakraDragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  ({ className, title, disabled }, dragRef) => (
    <span ref={dragRef} className={className} title={title}>
      <IconButton
        isDisabled={disabled}
        aria-label={title ?? /* istanbul ignore next */ ''}
        size="xs"
        icon={<DragHandleIcon />}
      />
    </span>
  )
);

ChakraDragHandle.displayName = 'ChakraDragHandle';
