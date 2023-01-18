import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TestID } from 'react-querybuilder';
import { defaultStyles } from '../styles';
import type { InlineCombinatorNativeProps } from '../types';

export const NativeInlineCombinator = ({
  component: CombinatorSelectorComponent,
  path,
  independentCombinators: _independentCombinators,
  ...props
}: InlineCombinatorNativeProps) => {
  const styles = useMemo(
    () => ({
      inlineCombinator: StyleSheet.flatten([
        defaultStyles.inlineCombinator,
        props.schema.styles?.inlineCombinator,
      ]),
    }),
    [props.schema.styles?.inlineCombinator]
  );

  return (
    <View style={styles.inlineCombinator} key="no-dnd" data-testid={TestID.inlineCombinator}>
      <CombinatorSelectorComponent {...props} path={path} testID={TestID.combinators} />
    </View>
  );
};

NativeInlineCombinator.displayName = 'NativeInlineCombinator';
