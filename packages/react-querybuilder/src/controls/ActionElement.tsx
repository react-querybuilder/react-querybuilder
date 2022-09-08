import type { ActionProps } from '@react-querybuilder/ts';

export const ActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
  testID,
}: ActionProps) => (
  <button
    type="button"
    data-testid={testID}
    disabled={disabled && !disabledTranslation}
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </button>
);

ActionElement.displayName = 'ActionElement';
