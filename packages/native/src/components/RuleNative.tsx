import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { RuleComponents, TestID, useRule } from 'react-querybuilder';
import { defaultNativeStyles } from '../styles';
import type { RuleNativeProps } from '../types';

export const RuleNative = (props: RuleNativeProps) => {
  const r = { ...props, ...useRule(props) };

  const styles = useMemo(
    () => ({ rule: StyleSheet.flatten([defaultNativeStyles.rule, r.schema.styles?.rule]) }),
    [r.schema.styles?.rule]
  );

  return (
    <View style={styles.rule} testID={TestID.rule}>
      <RuleComponents {...r} />
    </View>
  );
};

RuleNative.displayName = 'RuleNative';
