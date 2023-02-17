import type { ValueEditorNativeProps } from '@react-querybuilder/native';
import { defaultNativeStyles } from '@react-querybuilder/native';
import { Input, Radio, Switch, TextArea } from 'native-base';
import { useMemo } from 'react';
import type { KeyboardType } from 'react-native';
import { StyleSheet, View } from 'react-native';
import {
  getFirstOption,
  parseNumber,
  useValueEditor,
} from 'react-querybuilder';
import { NativeBaseValueSelector } from './NativeBaseValueSelector';

export const NativeBaseValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type = 'text',
  inputType = 'text',
  values = [],
  listsAsArrays,
  parseNumbers,
  fieldData,
  disabled,
  separator = null,
  skipHook = false,
  testID,
  selectorComponent: SelectorComponent = NativeBaseValueSelector,
  ...props
}: ValueEditorNativeProps) => {
  const styles = useMemo(
    () => ({
      value: StyleSheet.flatten([
        defaultNativeStyles.value,
        props.schema.styles?.value,
      ]),
      valueEditorSwitch: StyleSheet.flatten([
        defaultNativeStyles.valueEditorSwitch,
        props.schema.styles?.valueEditorSwitch,
      ]),
      valueList: StyleSheet.flatten([
        defaultNativeStyles.valueList,
        props.schema.styles?.valueList,
      ]),
    }),
    [
      props.schema.styles?.value,
      props.schema.styles?.valueEditorSwitch,
      props.schema.styles?.valueList,
    ]
  );

  const { valueAsArray, multiValueHandler } = useValueEditor({
    skipHook,
    handleOnChange,
    inputType,
    operator,
    value,
    type,
    listsAsArrays,
    parseNumbers,
    values,
  });

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';
  // TODO: coerce keyboardType appropriately
  // const keyboardType: KeyboardType = ['in', 'notIn'].includes(operator) ? 'default' : inputType || 'default';
  const keyboardType: KeyboardType = 'default';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <Input
            key={key}
            style={styles.value}
            keyboardType={keyboardType}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            // TODO: disabled={disabled}
            onChangeText={v => multiValueHandler(v, i)}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...props}
          handleOnChange={v => multiValueHandler(v, i)}
          className={className}
          disabled={disabled}
          value={valueAsArray[i] ?? getFirstOption(values)}
          options={values}
          listsAsArrays={listsAsArrays}
        />
      );
    });

    return (
      <View style={styles.valueList}>
        {editors[0]}
        {separator}
        {editors[1]}
      </View>
    );
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <SelectorComponent
          {...props}
          testID={testID}
          className={className}
          title={title}
          handleOnChange={handleOnChange}
          disabled={disabled}
          value={value}
          options={values}
          multiple={type === 'multiselect'}
          listsAsArrays={listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <TextArea
          data-testid={testID}
          style={styles.value}
          placeholder={placeHolderText}
          value={value}
          onChangeText={v => handleOnChange(v)}
          onChange={e => handleOnChange((e.currentTarget as any).value)}
          autoCompleteType=""
        />
      );

    case 'switch':
    case 'checkbox':
      return (
        <Switch
          style={styles.valueEditorSwitch}
          disabled={disabled}
          isChecked={!!value}
          onValueChange={v => handleOnChange(v)}
        />
      );

    case 'radio':
      return (
        <Radio.Group
          data-testid={testID}
          name={title ?? ''}
          onChange={v => handleOnChange(v)}>
          {values.map(v => (
            <Radio key={v.name} value={v.name}>
              {v.label}
            </Radio>
          ))}
        </Radio.Group>
      );
  }

  return (
    <Input
      data-testid={testID}
      style={styles.value}
      keyboardType={keyboardType}
      placeholder={placeHolderText}
      value={value}
      onChangeText={v => handleOnChange(parseNumber(v, { parseNumbers }))}
    />
  );
};

NativeBaseValueEditor.displayName = 'NativeBaseValueEditor';
