import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  RuleGroupBodyComponents,
  RuleGroupHeaderComponents,
  useRuleGroup,
} from 'react-querybuilder';
import { defaultNativeStyles } from './styles';
import type { RuleGroupNativeProps } from './types';

export const RuleGroupNative = (props: RuleGroupNativeProps) => {
  const rg = { ...props, ...useRuleGroup(props) };

  const styles = useMemo(
    () => ({
      ruleGroup: StyleSheet.flatten([defaultNativeStyles.ruleGroup, rg.schema.styles?.ruleGroup]),
      ruleGroupHeader: StyleSheet.flatten([
        defaultNativeStyles.ruleGroupHeader,
        rg.schema.styles?.ruleGroupHeader,
      ]),
      ruleGroupBody: StyleSheet.flatten([
        defaultNativeStyles.ruleGroupBody,
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

RuleGroupNative.displayName = 'RuleGroupNative';
