import { Picker } from '@react-native-picker/picker';
import { useMemo } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import type { Field, Operator } from 'react-querybuilder';
import { useRule } from 'react-querybuilder';
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
      <Picker
        style={styles.fieldSelector}
        itemStyle={styles.fieldOption}
        selectedValue={r.rule.field}
        onValueChange={v => r.generateOnChangeHandler('field')(v)}>
        {(r.schema.fields as Field[]).map(f => (
          <Picker.Item key={f.name} value={f.name} label={f.label} />
        ))}
      </Picker>
      <Picker
        style={styles.operatorSelector}
        itemStyle={styles.operatorOption}
        selectedValue={r.rule.operator}
        onValueChange={v => r.generateOnChangeHandler('operator')(v)}>
        {(r.schema.getOperators(r.rule.field) as Operator[]).map(op => (
          <Picker.Item key={op.name} value={op.name} label={op.label} />
        ))}
      </Picker>
      <TextInput
        style={styles.value}
        value={r.rule.value}
        onChangeText={t => r.generateOnChangeHandler('value')(t)}
      />
      <Button title={props.translations.removeRule.label!} onPress={e => r.removeRule(e)} />
    </View>
  );
};
