import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { defaultNativeStyles } from '../styles';
import type { ActionNativeProps } from '../types';

/**
 * @group Components
 */
export const NativeActionElement = ({
  handleOnClick,
  label,
  disabled,
  disabledTranslation,
  testID,
  title,
}: ActionNativeProps): React.JSX.Element => {
  const isDisabled = !!disabled && !disabledTranslation;

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={disabledTranslation && disabled ? disabledTranslation.title : title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={_e => handleOnClick()}>
      <View style={defaultNativeStyles.actionElement}>
        <Text style={defaultNativeStyles.actionElementText}>
          {
            (disabledTranslation && disabled
              ? (disabledTranslation.label ?? '')
              : (label ?? '')) as string
          }
        </Text>
      </View>
    </Pressable>
  );
};
