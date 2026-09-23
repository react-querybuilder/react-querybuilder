import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { UndoRedoActionElements } from 'react-querybuilder/history';
import { defaultNativeStyles } from '../styles';
import type { UndoRedoActionsNativeProps } from '../types';

export const NativeUndoRedoActions = (props: UndoRedoActionsNativeProps): React.JSX.Element => {
  const style = React.useMemo(
    () => ({
      undoRedoActions: StyleSheet.flatten([
        defaultNativeStyles.undoRedoActions,
        props.schema.styles?.undoRedoActions,
      ]),
    }),
    [props.schema.styles?.undoRedoActions]
  );

  return (
    <View testID={props.testID} style={style.undoRedoActions}>
      <UndoRedoActionElements {...props} />
    </View>
  );
};
