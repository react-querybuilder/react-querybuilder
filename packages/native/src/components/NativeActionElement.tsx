import * as React from 'react';
import { Button } from 'react-native';
import type { ActionNativeProps } from '../types';

export const NativeActionElement = ({
  handleOnClick,
  label,
  disabled,
  disabledTranslation,
  testID,
}: ActionNativeProps) => (
  <Button
    testID={testID}
    disabled={disabled && !disabledTranslation}
    title={`${disabledTranslation && disabled ? disabledTranslation.label ?? '' : label ?? ''}`}
    onPress={_e => handleOnClick()}
  />
);

NativeActionElement.displayName = 'NativeActionElement';
