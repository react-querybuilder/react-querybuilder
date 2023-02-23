import type { TextProps } from '@fluentui/react-components';
import { Text } from '@fluentui/react-components';
import type { DragHandleProps } from '@react-querybuilder/ts';
import { forwardRef } from 'react';

export const FluentDragHandle = forwardRef<HTMLSpanElement, DragHandleProps & TextProps>(
  ({ className, title, label, testID, schema: _schema, ...otherProps }, dragRef) => (
    <Text ref={dragRef} data-testid={testID} {...otherProps} className={className} title={title}>
      {label}
    </Text>
  )
);

FluentDragHandle.displayName = 'FluentDragHandle';
