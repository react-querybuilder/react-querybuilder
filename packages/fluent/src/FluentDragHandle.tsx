import type { TextProps } from '@fluentui/react-components';
import { Text } from '@fluentui/react-components';
import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';

/**
 * @group Components
 */
export const FluentDragHandle: React.ForwardRefExoticComponent<
  (DragHandleProps & TextProps) & React.RefAttributes<HTMLSpanElement>
> = forwardRef<HTMLSpanElement, DragHandleProps & TextProps>(
  (
    { className, title, label, testID, schema: _schema, ruleOrGroup: _ruleOrGroup, ...otherProps },
    dragRef
  ) => (
    <Text ref={dragRef} data-testid={testID} {...otherProps} className={className} title={title}>
      {label}
    </Text>
  )
);
