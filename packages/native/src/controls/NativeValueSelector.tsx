import { Picker } from '@react-native-picker/picker';
import type { Option, ValueSelectorProps } from '@react-querybuilder/ts';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { joinWith, splitBy } from 'react-querybuilder';

const styles = StyleSheet.create({
  selector: {},
  option: {},
});

export const NativeValueSelector = ({
  handleOnChange,
  options,
  value,
  disabled,
  multiple,
  listsAsArrays,
}: ValueSelectorProps) => {
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
