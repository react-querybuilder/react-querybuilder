import * as React from 'react';
import { useMemo } from 'react';
import type { InputModeOptions } from 'react-native';
import { StyleSheet, Switch, TextInput, View } from 'react-native';
import { getFirstOption, parseNumber, useValueEditor } from 'react-querybuilder';
import { defaultNativeStyles } from '../styles';
import type { ValueEditorNativeProps } from '../types';

export const NativeValueEditor = (allProps: ValueEditorNativeProps): React.JSX.Element | null => {
  const {
    operator,
    value,
    handleOnChange,
    title,
    className,
    type = 'text',
    inputType = 'text',
    values = [],
    listsAsArrays,
    fieldData,
    disabled,
    separator = null,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    ...propsForValueSelector
  } = allProps;

  const styles = useMemo(
    () => ({
      value: StyleSheet.flatten([defaultNativeStyles.value, allProps.schema.styles?.value]),
      valueEditorSwitch: StyleSheet.flatten([
        defaultNativeStyles.valueEditorSwitch,
        allProps.schema.styles?.valueEditorSwitch,
      ]),
      valueList: StyleSheet.flatten([
        defaultNativeStyles.valueList,
        allProps.schema.styles?.valueList,
      ]),
    }),
    [
      allProps.schema.styles?.value,
      allProps.schema.styles?.valueEditorSwitch,
      allProps.schema.styles?.valueList,
    ]
  );

  const { valueAsArray, multiValueHandler, parseNumberMethod } = useValueEditor(allProps);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';

  // istanbul ignore next
  const inputMode = ['in', 'notIn'].includes(operator)
    ? 'text'
    : inputType === 'number'
      ? 'decimal'
      : ((inputType ?? 'text') as InputModeOptions);

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <TextInput
            key={key}
            style={styles.value}
            inputMode={inputMode}
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
          {...propsForValueSelector}
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
      <View testID={testID} style={styles.valueList}>
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
          {...propsForValueSelector}
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
        <TextInput
          testID={testID}
          style={styles.value}
          placeholder={placeHolderText}
          value={value}
          onChangeText={v => handleOnChange(v)}
        />
      );

    case 'switch':
    case 'checkbox':
      return (
        <Switch
          testID={testID}
          style={styles.valueEditorSwitch}
          disabled={disabled}
          value={!!value}
          onValueChange={v => handleOnChange(v)}
        />
      );

    // TODO: set up "radio" case
    // case 'radio':
    //   return (
    //     <span testID={testID} className={className} title={title}>
    //       {values.map(v => (
    //         <label key={v.name}>
    //           <input
    //             type="radio"
    //             value={v.name}
    //             disabled={disabled}
    //             checked={value === v.name}
    //             onChange={e => handleOnChange(e.target.value)}
    //           />
    //           {v.label}
    //         </label>
    //       ))}
    //     </span>
    //   );
  }

  return (
    <TextInput
      testID={testID}
      style={styles.value}
      inputMode={inputMode}
      placeholder={placeHolderText}
      value={value}
      onChangeText={v => handleOnChange(parseNumber(v, { parseNumbers: parseNumberMethod }))}
    />
  );
};
