import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TestID } from 'react-querybuilder';
import { defaultNativeStyles } from '../styles';
import type { InlineCombinatorNativeProps } from '../types';

export const NativeInlineCombinator = ({
  component: CombinatorSelectorComponent,
  path,
  ...props
}: InlineCombinatorNativeProps) => {
  const styles = useMemo(
    () => ({
      inlineCombinator: StyleSheet.flatten([
        defaultNativeStyles.inlineCombinator,
        props.schema.styles?.inlineCombinator,
      ]),
    }),
    [props.schema.styles?.inlineCombinator]
  );

  return (
    <View style={styles.inlineCombinator} key="no-dnd" testID={TestID.inlineCombinator}>
      <CombinatorSelectorComponent {...props} path={path} testID={TestID.combinators} />
    </View>
  );
};
