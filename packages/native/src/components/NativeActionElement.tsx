import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ActionNativeProps } from '../types';
import { defaultNativeStyles } from '../styles';

export const NativeActionElement = ({
  handleOnClick,
  label,
  disabled,
  disabledTranslation,
  testID,
  schema: _schema,
}: ActionNativeProps) => (
  <Pressable
    testID={testID}
    disabled={disabled && !disabledTranslation}
    onPress={_e => handleOnClick()}>
    <View style={defaultNativeStyles.actionElement}>
      <Text
        style={
          defaultNativeStyles.actionElementText
        }>{`${disabledTranslation && disabled ? (disabledTranslation.label ?? '') : (label ?? '')}`}</Text>
    </View>
  </Pressable>
);
