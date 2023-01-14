import type { InlineCombinatorProps } from '@react-querybuilder/ts';
import { View } from 'react-native';
import { TestID } from 'react-querybuilder';

export const NativeInlineCombinator = ({
  component: CombinatorSelectorComponent,
  path,
  independentCombinators: _independentCombinators,
  ...props
}: InlineCombinatorProps) => (
  <View key="no-dnd" data-testid={TestID.inlineCombinator}>
    <CombinatorSelectorComponent {...props} path={path} testID={TestID.combinators} />
  </View>
);

NativeInlineCombinator.displayName = 'NativeInlineCombinator';
