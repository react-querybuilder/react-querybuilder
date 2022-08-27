import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import type { ActionWithRulesProps } from 'react-querybuilder';
import { ActionElement } from 'react-querybuilder';
import type { ButtonType, RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

type MaterialActionProps = ActionWithRulesProps &
  ComponentPropsWithoutRef<ButtonType> & {
    muiComponents?: Partial<RQBMaterialComponents>;
  };

type GetMaterialActionElementProps = Pick<RQBMaterialComponents, 'Button'>;
const muiComponentNames: (keyof RQBMaterialComponents)[] = ['Button'];

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
  muiComponents,
  ...otherProps
}: MaterialActionProps) => {
  const muiComponentsInternal = useMuiComponents(muiComponentNames, muiComponents);
  const key = muiComponentsInternal ? 'mui' : 'no-mui';
  if (!muiComponentsInternal) {
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
      />
    );
  }

  const { Button } = muiComponentsInternal as GetMaterialActionElementProps;

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
