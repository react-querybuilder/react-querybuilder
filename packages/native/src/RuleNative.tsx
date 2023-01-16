import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { RuleComponents, useRule } from 'react-querybuilder';
import { defaultStyles } from './defaults';
import type { RuleNativeProps } from './types';

export const RuleNative = (props: RuleNativeProps) => {
  const r = { ...props, ...useRule(props) };

  const styles = useMemo(
    () => ({ rule: StyleSheet.flatten([defaultStyles.rule, r.schema.styles?.rule]) }),
    [r.schema.styles?.rule]
  );

  return (
    <View style={styles.rule}>
      <RuleComponents {...r} />
    </View>
  );
};
