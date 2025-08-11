import type { Button } from '@mui/material';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import * as React from 'react';
import { useContext } from 'react';
import type { ActionProps } from 'react-querybuilder';
import { ActionElement } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

/**
 * @group Props
 */
export interface MaterialActionProps extends ActionProps, ComponentPropsWithoutRef<typeof Button> {
  muiComponents?: RQBMaterialComponents;
}

/**
 * @group Components
 */
export const MaterialActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
  testID,
  path,
  level,
  rules,
  context,
  validation,
  ruleOrGroup,
  schema,
  muiComponents: muiComponentsProp,
  ...otherProps
}: MaterialActionProps): React.JSX.Element => {
  const muiComponents = useContext(RQBMaterialContext) ?? muiComponentsProp;
  const key = muiComponents ? 'mui' : 'no-mui';
  if (!muiComponents) {
    const AE = ActionElement as ComponentType<ActionProps>;
    return (
      <AE
        key={key}
        className={className}
        handleOnClick={handleOnClick}
        label={label}
        title={title}
        disabled={disabled}
        disabledTranslation={disabledTranslation}
        testID={testID}
        path={path}
        level={level}
        rules={rules}
        context={context}
        validation={validation}
        ruleOrGroup={ruleOrGroup}
        schema={schema}
      />
    );
  }

  const { Button } = muiComponents;

  return (
    <Button
      key={key}
      variant="contained"
      color="secondary"
      className={className}
      title={disabledTranslation && disabled ? disabledTranslation.title : title}
      size="small"
      disabled={disabled && !disabledTranslation}
      onClick={e => handleOnClick(e)}
      {...otherProps}>
      {disabledTranslation && disabled ? disabledTranslation.label : label}
    </Button>
  );
};
