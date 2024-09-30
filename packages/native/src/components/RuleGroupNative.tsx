import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FullField, RuleGroupProps } from 'react-querybuilder';
import {
  RuleGroupBodyComponents,
  RuleGroupHeaderComponents,
  TestID,
  useRuleGroup,
} from 'react-querybuilder';
import { defaultNativeStyles } from '../styles';
import type { RuleGroupNativeProps, SchemaNative } from '../types';

export const RuleGroupNative = (props: RuleGroupNativeProps): React.JSX.Element => {
  const rg = useRuleGroup(props);
  const schema = rg.schema as SchemaNative<FullField, string>;

  const styles = useMemo(
    () => ({
      ruleGroup: StyleSheet.flatten([defaultNativeStyles.ruleGroup, schema.styles?.ruleGroup]),
      ruleGroupHeader: StyleSheet.flatten([
        defaultNativeStyles.ruleGroupHeader,
        schema.styles?.ruleGroupHeader,
      ]),
      ruleGroupBody: StyleSheet.flatten([
        defaultNativeStyles.ruleGroupBody,
        schema.styles?.ruleGroupBody,
      ]),
    }),
    [schema.styles?.ruleGroup, schema.styles?.ruleGroupBody, schema.styles?.ruleGroupHeader]
  );

  return (
    <View style={styles.ruleGroup} testID={TestID.ruleGroup}>
      <View style={styles.ruleGroupHeader}>
        <RuleGroupHeaderComponents {...(rg as RuleGroupProps & ReturnType<typeof useRuleGroup>)} />
      </View>
      <View style={styles.ruleGroupBody}>
        <RuleGroupBodyComponents {...(rg as RuleGroupProps & ReturnType<typeof useRuleGroup>)} />
      </View>
    </View>
  );
};
