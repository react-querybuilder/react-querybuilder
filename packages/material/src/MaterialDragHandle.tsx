import type DragIndicator from '@mui/icons-material/DragIndicator';
import type { ComponentPropsWithRef } from 'react';
import * as React from 'react';
import { forwardRef, useContext } from 'react';
import type { DragHandleProps } from 'react-querybuilder';
import { DragHandle } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

/**
 * @group Props
 */
export type MaterialDragHandleProps = DragHandleProps &
  Omit<ComponentPropsWithRef<typeof DragIndicator>, 'path'> & {
    muiComponents?: RQBMaterialComponents;
  };

/**
 * @group Components
 */
export const MaterialDragHandle: React.ForwardRefExoticComponent<
  Omit<MaterialDragHandleProps, 'ref'> & React.RefAttributes<HTMLSpanElement>
> = forwardRef<HTMLSpanElement, MaterialDragHandleProps>(
  (
    {
      className,
      title,
      path,
      level,
      testID,
      label,
      disabled,
      context,
      validation,
      schema,
      ruleOrGroup,
      muiComponents: muiComponentsProp,
      ...otherProps
    },
    dragRef
  ) => {
    const muiComponents = useContext(RQBMaterialContext) ?? muiComponentsProp;
    const key = muiComponents ? 'mui' : 'no-mui';
    if (!muiComponents) {
      return (
        <DragHandle
          key={key}
          path={path}
          level={level}
          className={className}
          title={title}
          testID={testID}
          label={label}
          disabled={disabled}
          context={context}
          validation={validation}
          schema={schema}
          ruleOrGroup={ruleOrGroup}
        />
      );
    }

    const { DragIndicator } = muiComponents;

    return (
      <span key={key} ref={dragRef} className={className} title={title}>
        <DragIndicator {...otherProps} />
      </span>
    );
  }
);
