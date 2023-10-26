import * as React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { pathsAreEqual, useShiftActions } from 'react-querybuilder';
import { defaultNativeStyles } from '../styles';
import type { ShiftActionsNativeProps } from '../types';

export const NativeShiftActions = ({
  path,
  labels,
  testID,
  lastInGroup,
  schema: { combinators, dispatchQuery, getQuery, styles },
}: ShiftActionsNativeProps) => {
  const { shiftUp, shiftDown } = useShiftActions({ combinators, dispatchQuery, getQuery, path });

  const style = React.useMemo(
    () => ({
      shiftActions: StyleSheet.flatten([defaultNativeStyles.shiftActions, styles?.shiftActions]),
    }),
    [styles?.shiftActions]
  );

  return (
    <View testID={testID} style={style.shiftActions}>
      <Button
        disabled={pathsAreEqual([0], path)}
        onPress={shiftUp}
        accessibilityLabel={labels?.shiftUp as string}
        title={labels?.shiftUp as string}
      />
      <Button
        disabled={lastInGroup && path.length === 1}
        onPress={shiftDown}
        accessibilityLabel={labels?.shiftDown as string}
        title={labels?.shiftDown as string}
      />
    </View>
  );
};

NativeShiftActions.displayName = 'NativeShiftActions';
