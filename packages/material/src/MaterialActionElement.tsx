import type { ActionWithRulesProps } from '@react-querybuilder/ts';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import { useContext } from 'react';
import { ActionElement } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { ButtonType, RQBMaterialComponents } from './types';

type MaterialActionProps = ActionWithRulesProps &
  ComponentPropsWithoutRef<ButtonType> & {
    muiComponents?: RQBMaterialComponents;
  };

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
  muiComponents: muiComponentsProp,
  ...otherProps
}: MaterialActionProps) => {
  const muiComponents = useContext(RQBMaterialContext) || muiComponentsProp;
  const key = muiComponents ? 'mui' : 'no-mui';
  if (!muiComponents) {
    const AE = ActionElement as ComponentType<ActionWithRulesProps>;
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

MaterialActionElement.displayName = 'MaterialActionElement';
