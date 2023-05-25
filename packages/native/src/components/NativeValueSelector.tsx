import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { TestID, joinWith, useValueSelector } from 'react-querybuilder';
import { defaultNativeSelectStyles, defaultNativeStyles } from '../styles';
import type { ValueSelectorNativeProps } from '../types';

export const NativeValueSelector = ({
  handleOnChange,
  options: _options,
  value,
  disabled,
  multiple,
  listsAsArrays,
  schema,
  testID,
}: ValueSelectorNativeProps) => {
  const styles = useMemo(() => {
    if (testID === TestID.combinators) {
      return {
        selector: StyleSheet.flatten([
          defaultNativeStyles.combinatorSelector,
          schema.styles?.combinatorSelector,
        ]),
        option: StyleSheet.flatten([
          defaultNativeStyles.combinatorOption,
          schema.styles?.combinatorOption,
        ]),
      };
    } else if (testID === TestID.fields) {
      return {
        selector: StyleSheet.flatten([
          defaultNativeStyles.fieldSelector,
          schema.styles?.fieldSelector,
        ]),
        option: StyleSheet.flatten([defaultNativeStyles.fieldOption, schema.styles?.fieldOption]),
      };
    } else if (testID === TestID.operators) {
      return {
        selector: StyleSheet.flatten([
          defaultNativeStyles.operatorSelector,
          schema.styles?.operatorSelector,
        ]),
        option: StyleSheet.flatten([
          defaultNativeStyles.operatorOption,
          schema.styles?.operatorOption,
        ]),
      };
    } else if (testID === TestID.valueSourceSelector) {
      return {
        selector: StyleSheet.flatten([
          defaultNativeStyles.valueSourceSelector,
          schema.styles?.valueSourceSelector,
        ]),
        option: StyleSheet.flatten([
          defaultNativeStyles.valueSourceOption,
          schema.styles?.valueSourceOption,
        ]),
      };
    } else if (testID === TestID.valueEditor) {
      return {
        selector: StyleSheet.flatten([
          defaultNativeStyles.valueEditorSelector,
          schema.styles?.valueEditorSelector,
        ]),
        option: StyleSheet.flatten([
          defaultNativeStyles.valueEditorOption,
          schema.styles?.valueEditorOption,
        ]),
      };
    }
    return StyleSheet.create(defaultNativeSelectStyles);
  }, [
    schema.styles?.combinatorOption,
    schema.styles?.combinatorSelector,
    schema.styles?.fieldOption,
    schema.styles?.fieldSelector,
    schema.styles?.operatorOption,
    schema.styles?.operatorSelector,
    schema.styles?.valueEditorOption,
    schema.styles?.valueEditorSelector,
    schema.styles?.valueSourceOption,
    schema.styles?.valueSourceSelector,
    testID,
  ]);

  const { onChange } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  // istanbul ignore next
  const val = multiple ? (Array.isArray(value) ? joinWith(value, ',') : value) : value;

  return (
    <TextInput
      testID={testID}
      aria-disabled={disabled}
      style={styles.selector}
      value={val}
      onChangeText={onChange}
    />
  );
};

NativeValueSelector.displayName = 'NativeValueSelector';
