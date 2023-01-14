import type { NotToggleProps } from '@react-querybuilder/ts';
import { StyleSheet, Switch, Text, View } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
});

export const NativeNotToggle = ({ handleOnChange, label, checked, disabled }: NotToggleProps) => (
  <View style={styles.wrapper}>
    <Text>{label}</Text>
    <Switch disabled={disabled} value={checked} onValueChange={v => handleOnChange(v)} />
  </View>
);

NativeNotToggle.displayName = 'NativeNotToggle';
