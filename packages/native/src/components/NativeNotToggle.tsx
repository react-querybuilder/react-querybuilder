import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { defaultNativeStyles } from '../styles';
import type { NotToggleNativeProps } from '../types';

export const NativeNotToggle = ({
  handleOnChange,
  label,
  checked,
  disabled,
  schema,
  testID,
}: NotToggleNativeProps): React.JSX.Element => {
  const styles = useMemo(
    () => ({
      notToggle: StyleSheet.flatten([defaultNativeStyles.notToggle, schema.styles?.notToggle]),
      notToggleLabel: StyleSheet.flatten([
        defaultNativeStyles.notToggleLabel,
        schema.styles?.notToggleLabel,
      ]),
      notToggleSwitch: StyleSheet.flatten([
        defaultNativeStyles.notToggleSwitch,
        schema.styles?.notToggleSwitch,
      ]),
    }),
    [schema.styles?.notToggle, schema.styles?.notToggleLabel, schema.styles?.notToggleSwitch]
  );

  return (
    <View style={styles.notToggle} testID={testID}>
      <Text style={styles.notToggleLabel}>{label}</Text>
      <Switch
        style={styles.notToggleSwitch}
        disabled={disabled}
        value={checked}
        onValueChange={v => handleOnChange(v)}
      />
    </View>
  );
};
