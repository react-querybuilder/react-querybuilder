import type { ActionNativeProps } from '@react-querybuilder/native';
import { Button } from 'react-native-paper';

export const PaperActionElement = ({
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

PaperActionElement.displayName = 'PaperActionElement';
