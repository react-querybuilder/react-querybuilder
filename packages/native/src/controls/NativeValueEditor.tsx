import type { ValueEditorProps } from '@react-querybuilder/ts';
import type { KeyboardType } from 'react-native';
import { StyleSheet, Switch, TextInput, View } from 'react-native';
import { getFirstOption, parseNumber, useValueEditor } from 'react-querybuilder';
import { NativeValueSelector } from './NativeValueSelector';

const styles = StyleSheet.create({ valueList: { flexDirection: 'row' } });

export const NativeValueEditor = ({
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
  ...props
}: ValueEditorProps) => {
  const { valArray, betweenValueHandler } = useValueEditor({
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
          <TextInput
            key={key}
            keyboardType={keyboardType}
            placeholder={placeHolderText}
            value={valArray[i] ?? ''}
            // TODO: disabled={disabled}
            onChangeText={v => betweenValueHandler(v, i)}
          />
        );
      }
      return (
        <NativeValueSelector
          key={key}
          {...props}
          handleOnChange={v => betweenValueHandler(v, i)}
          className={className}
          disabled={disabled}
          value={valArray[i] ?? getFirstOption(values)}
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
        <NativeValueSelector
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
        <TextInput
          data-testid={testID}
          placeholder={placeHolderText}
          value={value}
          onChangeText={v => handleOnChange(v)}
        />
      );

    case 'switch':
    case 'checkbox':
      return <Switch disabled={disabled} value={!!value} onValueChange={v => handleOnChange(v)} />;

    // TODO: set up "radio" case
    // case 'radio':
    //   return (
    //     <span data-testid={testID} className={className} title={title}>
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
      data-testid={testID}
      keyboardType={keyboardType}
      placeholder={placeHolderText}
      value={value}
      onChangeText={v => handleOnChange(parseNumber(v, { parseNumbers }))}
    />
  );
};

NativeValueEditor.displayName = 'NativeValueEditor';