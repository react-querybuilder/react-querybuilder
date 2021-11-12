import { IconButton } from '@chakra-ui/button';
import { DragHandleIcon } from '@chakra-ui/icons';
import { forwardRef } from 'react';
import type { DragHandleProps } from '../../src/types';

export default forwardRef<HTMLSpanElement, DragHandleProps>(function ChakraDragHandle(
  { className, title },
  dragRef
) {
  return (
    <span ref={dragRef} className={className} title={title}>
      <IconButton aria-label={title} size="xs" icon={<DragHandleIcon />} />
    </span>
  );
});
