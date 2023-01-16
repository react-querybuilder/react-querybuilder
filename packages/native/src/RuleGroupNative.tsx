import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  RuleGroupBodyComponents,
  RuleGroupHeaderComponents,
  useRuleGroup,
} from 'react-querybuilder';
import type { RuleGroupNativeProps, RuleGroupStyles, RuleGroupStyleSheets } from './types';

const baseStyles: RuleGroupStyles = {
  ruleGroup: {
    borderWidth: 1,
    marginBottom: 10,
  },
  ruleGroupHeader: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  ruleGroupBody: {
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  combinatorSelector: {
    height: 30,
    width: 50,
  },
};

export const RuleGroupNative = (props: RuleGroupNativeProps) => {
  const rg = { ...props, ...useRuleGroup(props) };

  const styles = useMemo(
    (): RuleGroupStyleSheets => ({
      ruleGroup: StyleSheet.flatten([baseStyles.ruleGroup, props.styles?.ruleGroup]),
      ruleGroupHeader: StyleSheet.flatten([
        baseStyles.ruleGroupHeader,
        props.styles?.ruleGroupHeader,
      ]),
      ruleGroupBody: StyleSheet.flatten([baseStyles.ruleGroupBody, props.styles?.ruleGroupBody]),
      combinatorSelector: StyleSheet.flatten([
        baseStyles.combinatorSelector,
        props.styles?.combinatorSelector,
      ]),
      combinatorOption: StyleSheet.flatten([
        baseStyles.combinatorOption,
        props.styles?.combinatorOption,
      ]),
      inlineCombinator: StyleSheet.flatten([
        baseStyles.inlineCombinator,
        props.styles?.inlineCombinator,
      ]),
    }),
    [props.styles]
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
