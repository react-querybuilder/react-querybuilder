import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FullField } from 'react-querybuilder';
import { RuleComponents, TestID, useRule } from 'react-querybuilder';
import { defaultNativeStyles } from '../styles';
import type { RuleNativeProps, SchemaNative } from '../types';

export const RuleNative = (props: RuleNativeProps) => {
  const r = useRule(props);
  const schema = r.schema as SchemaNative<FullField, string>;

  const styles = useMemo(
    () => ({ rule: StyleSheet.flatten([defaultNativeStyles.rule, schema.styles?.rule]) }),
    [schema.styles?.rule]
  );

  return (
    <View style={styles.rule} testID={TestID.rule}>
      <RuleComponents {...r} />
    </View>
  );
};

RuleNative.displayName = 'RuleNative';
