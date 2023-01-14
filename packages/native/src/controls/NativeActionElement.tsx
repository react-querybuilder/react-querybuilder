import type { ActionProps } from '@react-querybuilder/ts';
import { Button } from 'react-native';

export const NativeActionElement = ({
  handleOnClick,
  label,
  disabled,
  disabledTranslation,
}: ActionProps) => (
  <Button
    disabled={disabled && !disabledTranslation}
    title={disabledTranslation && disabled ? disabledTranslation.label ?? '' : label ?? ''}
    onPress={e => handleOnClick(e as any)}
  />
);

NativeActionElement.displayName = 'NativeActionElement';
