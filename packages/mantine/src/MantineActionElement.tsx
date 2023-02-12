import { Button } from '@mantine/core';
import type { ActionProps } from '@react-querybuilder/ts';

export const MantineActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
}: ActionProps) => (
  <Button
    type="button"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

MantineActionElement.displayName = 'MantineActionElement';
