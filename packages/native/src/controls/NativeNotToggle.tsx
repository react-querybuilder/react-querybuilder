import { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { defaultStyles } from '../defaults';
import type { NotToggleNativeProps } from '../types';

export const NativeNotToggle = ({
  handleOnChange,
  label,
  checked,
  disabled,
  schema,
}: NotToggleNativeProps) => {
  const styles = useMemo(
    () => ({
      notToggle: StyleSheet.flatten([defaultStyles.notToggle, schema.styles?.notToggle]),
      notToggleLabel: StyleSheet.flatten([
        defaultStyles.notToggleLabel,
        schema.styles?.notToggleLabel,
      ]),
      notToggleSwitch: StyleSheet.flatten([
        defaultStyles.notToggleSwitch,
        schema.styles?.notToggleSwitch,
      ]),
    }),
    [schema.styles?.notToggle, schema.styles?.notToggleLabel, schema.styles?.notToggleSwitch]
  );

  return (
    <View style={styles.notToggle}>
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

NativeNotToggle.displayName = 'NativeNotToggle';
