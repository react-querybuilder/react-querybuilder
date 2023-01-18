import { Picker } from '@react-native-picker/picker';
import type { Option } from '@react-querybuilder/ts';
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { joinWith, splitBy, standardClassnames } from 'react-querybuilder';
import { defaultStyles } from '../styles';
import type { ValueSelectorNativeProps } from '../types';

export const NativeValueSelector = ({
  handleOnChange,
  className,
  options,
  value,
  disabled,
  multiple,
  listsAsArrays,
  schema,
}: ValueSelectorNativeProps) => {
  const styles = useMemo(() => {
    if (className?.match(`\\b${standardClassnames.combinators}\\b`)) {
      return {
        selector: StyleSheet.flatten([
          defaultStyles.combinatorSelector,
          schema.styles?.combinatorSelector,
        ]),
        option: StyleSheet.flatten([
          defaultStyles.combinatorOption,
          schema.styles?.combinatorOption,
        ]),
      };
    } else if (className?.match(`\\b${standardClassnames.fields}\\b`)) {
      return {
        selector: StyleSheet.flatten([defaultStyles.fieldSelector, schema.styles?.fieldSelector]),
        option: StyleSheet.flatten([defaultStyles.fieldOption, schema.styles?.fieldOption]),
      };
    } else if (className?.match(`\\b${standardClassnames.operators}\\b`)) {
      return {
        selector: StyleSheet.flatten([
          defaultStyles.operatorSelector,
          schema.styles?.operatorSelector,
        ]),
        option: StyleSheet.flatten([defaultStyles.operatorOption, schema.styles?.operatorOption]),
      };
    } else if (className?.match(`\\b${standardClassnames.valueSource}\\b`)) {
      return {
        selector: StyleSheet.flatten([
          defaultStyles.valueSourceSelector,
          schema.styles?.valueSourceSelector,
        ]),
        option: StyleSheet.flatten([
          defaultStyles.valueSourceOption,
          schema.styles?.valueSourceOption,
        ]),
      };
    } else if (className?.match(`\\b${standardClassnames.value}\\b`)) {
      return {
        selector: StyleSheet.flatten([
          defaultStyles.valueEditorSelector,
          schema.styles?.valueEditorSelector,
        ]),
        option: StyleSheet.flatten([
          defaultStyles.valueEditorOption,
          schema.styles?.valueEditorOption,
        ]),
      };
    }
    return StyleSheet.create({ selector: {}, option: {} });
  }, [
    className,
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
  ]);

  const onChange = useCallback(
    (v: string | string[]) => {
      if (multiple) {
        const valArray = Array.from(v);
        handleOnChange(listsAsArrays ? valArray : joinWith(valArray, ','));
      } else {
        handleOnChange(v);
      }
    },
    [handleOnChange, listsAsArrays, multiple]
  );

  const val = multiple ? (Array.isArray(value) ? value : splitBy(value, ',')) : value;

  return (
    <Picker
      aria-disabled={disabled}
      style={styles.selector}
      itemStyle={styles.option}
      selectedValue={val}
      onValueChange={onChange}>
      {(options as Option[]).map(c => (
        <Picker.Item key={c.name} label={c.label} value={c.name} />
      ))}
    </Picker>
  );
};

NativeValueSelector.displayName = 'NativeValueSelector';
