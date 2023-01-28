import type { ActionNativeProps } from '@react-querybuilder/native';
import { Button } from '@ui-kitten/components';

export const KittenActionElement = ({
  handleOnClick,
  label,
  disabled,
  disabledTranslation,
  title,
}: ActionNativeProps) => (
  <Button
    aria-label={title}
    disabled={disabled && !disabledTranslation}
    onPress={(e: any) => handleOnClick(e)}>
    {disabledTranslation && disabled
      ? disabledTranslation.label ?? ''
      : label ?? ''}
  </Button>
);

KittenActionElement.displayName = 'KittenActionElement';
