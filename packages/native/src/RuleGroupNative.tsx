import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  RuleGroupBodyComponents,
  RuleGroupHeaderComponents,
  useRuleGroup,
} from 'react-querybuilder';
import { defaultStyles } from './defaults';
import type { RuleGroupNativeProps } from './types';

export const RuleGroupNative = (props: RuleGroupNativeProps) => {
  const rg = { ...props, ...useRuleGroup(props) };

  const styles = useMemo(
    () => ({
      ruleGroup: StyleSheet.flatten([defaultStyles.ruleGroup, rg.schema.styles?.ruleGroup]),
      ruleGroupHeader: StyleSheet.flatten([
        defaultStyles.ruleGroupHeader,
        rg.schema.styles?.ruleGroupHeader,
      ]),
      ruleGroupBody: StyleSheet.flatten([
        defaultStyles.ruleGroupBody,
        rg.schema.styles?.ruleGroupBody,
      ]),
    }),
    [
      rg.schema.styles?.ruleGroup,
      rg.schema.styles?.ruleGroupBody,
      rg.schema.styles?.ruleGroupHeader,
    ]
  );

  return (
    <View style={styles.ruleGroup}>
      <View style={styles.ruleGroupHeader}>
        <RuleGroupHeaderComponents {...rg} />
      </View>
      <View style={styles.ruleGroupBody}>
        <RuleGroupBodyComponents {...rg} />
      </View>
    </View>
  );
};
