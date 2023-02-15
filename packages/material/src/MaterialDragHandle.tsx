import type { DragHandleProps } from '@react-querybuilder/ts';
import type { ComponentPropsWithRef } from 'react';
import { forwardRef, useContext } from 'react';
import { DragHandle } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { DragIndicatorType, RQBMaterialComponents } from './types';

type MaterialDragHandleProps = DragHandleProps &
  Omit<ComponentPropsWithRef<DragIndicatorType>, 'path'> & {
    muiComponents?: RQBMaterialComponents;
  };

export const MaterialDragHandle = forwardRef<HTMLSpanElement, MaterialDragHandleProps>(
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
      muiComponents: muiComponentsProp,
      ...otherProps
    },
    dragRef
  ) => {
    const muiComponents = useContext(RQBMaterialContext) || muiComponentsProp;
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

MaterialDragHandle.displayName = 'MaterialDragHandle';
