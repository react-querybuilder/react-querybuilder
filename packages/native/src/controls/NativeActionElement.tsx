import { Button } from 'react-native';
import type { ActionNativeProps } from '../types';

export const NativeActionElement = ({
  handleOnClick,
  label,
  disabled,
  disabledTranslation,
}: ActionNativeProps) => (
  <Button
    disabled={disabled && !disabledTranslation}
    title={disabledTranslation && disabled ? disabledTranslation.label ?? '' : label ?? ''}
    onPress={e => handleOnClick(e as any)}
  />
);

NativeActionElement.displayName = 'NativeActionElement';
