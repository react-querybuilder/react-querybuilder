import type { NotToggleNativeProps } from '@react-querybuilder/native';
import { defaultNativeStyles } from '@react-querybuilder/native';
import { Switch, Text, View } from 'native-base';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const NativeBaseNotToggle = ({
  handleOnChange,
  label,
  checked,
  disabled,
  schema,
}: NotToggleNativeProps) => {
  const styles = useMemo(
    () => ({
      notToggle: StyleSheet.flatten([
        defaultNativeStyles.notToggle,
        schema.styles?.notToggle,
      ]),
      notToggleLabel: StyleSheet.flatten([
        defaultNativeStyles.notToggleLabel,
        schema.styles?.notToggleLabel,
      ]),
      notToggleSwitch: StyleSheet.flatten([
        defaultNativeStyles.notToggleSwitch,
        schema.styles?.notToggleSwitch,
      ]),
    }),
    [
      schema.styles?.notToggle,
      schema.styles?.notToggleLabel,
      schema.styles?.notToggleSwitch,
    ]
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
