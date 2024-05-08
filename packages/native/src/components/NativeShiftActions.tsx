import * as React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { defaultNativeStyles } from '../styles';
import type { ShiftActionsNativeProps } from '../types';

export const NativeShiftActions = ({
  shiftUp,
  shiftDown,
  shiftUpDisabled,
  shiftDownDisabled,
  disabled,
  labels,
  testID,
  schema: { styles },
}: ShiftActionsNativeProps) => {
  const style = React.useMemo(
    () => ({
      shiftActions: StyleSheet.flatten([defaultNativeStyles.shiftActions, styles?.shiftActions]),
    }),
    [styles?.shiftActions]
  );

  return (
    <View testID={testID} style={style.shiftActions}>
      <Button
        disabled={disabled || shiftUpDisabled}
        onPress={shiftUp}
        accessibilityLabel={labels?.shiftUp as string}
        title={labels?.shiftUp as string}
      />
      <Button
        disabled={disabled || shiftDownDisabled}
        onPress={shiftDown}
        accessibilityLabel={labels?.shiftDown as string}
        title={labels?.shiftDown as string}
      />
    </View>
  );
};
