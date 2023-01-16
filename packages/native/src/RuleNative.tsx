import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { RuleComponents, useRule } from 'react-querybuilder';
import type { RuleNativeProps, RuleStyles, RuleStyleSheets } from './types';

const baseStyles: RuleStyles = {
  rule: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  fieldSelector: {
    height: 30,
    width: 100,
  },
  fieldOption: {},
  operatorSelector: {
    height: 30,
    width: 100,
  },
  operatorOption: {},
  value: {
    borderWidth: 1,
    height: 30,
    minWidth: 100,
  },
};

export const RuleNative = (props: RuleNativeProps) => {
  const r = { ...props, ...useRule(props) };

  const styles = useMemo(
    (): RuleStyleSheets => ({
      rule: StyleSheet.flatten([baseStyles.rule, props.styles?.rule]),
      fieldSelector: StyleSheet.flatten([baseStyles.fieldSelector, props.styles?.fieldSelector]),
      fieldOption: StyleSheet.flatten([baseStyles.fieldOption, props.styles?.fieldOption]),
      operatorSelector: StyleSheet.flatten([
        baseStyles.operatorSelector,
        props.styles?.operatorSelector,
      ]),
      operatorOption: StyleSheet.flatten([baseStyles.operatorOption, props.styles?.operatorOption]),
      valueSourceSelector: StyleSheet.flatten([
        baseStyles.operatorSelector,
        props.styles?.operatorSelector,
      ]),
      valueSourceOption: StyleSheet.flatten([
        baseStyles.operatorOption,
        props.styles?.operatorOption,
      ]),
      value: StyleSheet.flatten([baseStyles.value, props.styles?.value]),
    }),
    [props.styles]
  );

  return (
    <View style={styles.rule}>
      <RuleComponents {...r} />
    </View>
  );
};
