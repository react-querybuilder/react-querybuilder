import { Checkbox, Radio, Switch, Textarea, TextInput } from '@mantine/core';
import type { ValueEditorProps } from 'react-querybuilder';
import { getFirstOption, standardClassnames, useValueEditor } from 'react-querybuilder';
import { MantineValueSelector } from './MantineValueSelector';

export const MantineValueEditor = (props: ValueEditorProps) => {
  const { valArray, betweenValueHandler } = useValueEditor({
    handleOnChange: props.handleOnChange,
    inputType: props.inputType,
    operator: props.operator,
    value: props.value,
    type: props.type,
    listsAsArrays: props.listsAsArrays,
    parseNumbers: props.parseNumbers,
    values: props.values,
  });

  const { selectorComponent: SelectorComponent = MantineValueSelector } = props;

  if (props.operator === 'null' || props.operator === 'notNull') {
    return null;
  }

  const placeHolderText = props.fieldData?.placeholder ?? '';
  const { values = [] } = props;

  if (
    (props.operator === 'between' || props.operator === 'notBetween') &&
    (props.type === 'select' || props.type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (props.type === 'text') {
        return (
          <TextInput
            key={key}
            type={props.inputType || 'text'}
            placeholder={placeHolderText}
            value={valArray[i] ?? ''}
            className={`${standardClassnames.valueListItem} input`}
            disabled={props.disabled}
            onChange={e => betweenValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...props}
          className={standardClassnames.valueListItem}
          handleOnChange={v => betweenValueHandler(v, i)}
          disabled={props.disabled}
          value={valArray[i] ?? getFirstOption(values)}
          options={values}
          listsAsArrays={props.listsAsArrays}
        />
      );
    });

    return (
      <span data-testid={props.testID} className={props.className} title={props.title}>
        {editors[0]}
        {props.separator}
        {editors[1]}
      </span>
    );
  }

  switch (props.type) {
    case 'select':
    case 'multiselect':
      return (
        <SelectorComponent
          {...props}
          title={props.title}
          className={props.className}
          handleOnChange={props.handleOnChange}
          options={values}
          value={props.value}
          disabled={props.disabled}
          multiple={props.type === 'multiselect'}
          listsAsArrays={props.listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <Textarea
          className={props.className}
          value={props.value}
          title={props.title}
          placeholder={placeHolderText}
          disabled={props.disabled}
          onChange={e => props.handleOnChange(e.target.value)}
        />
      );

    case 'switch':
      return (
        <Switch
          className={props.className}
          title={props.title}
          checked={props.value}
          disabled={props.disabled}
          onChange={e => props.handleOnChange(e.target.checked)}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          className={props.className}
          title={props.title}
          checked={props.value}
          disabled={props.disabled}
          onChange={e => props.handleOnChange(e.target.checked)}
        />
      );

    case 'radio':
      return (
        <Radio.Group
          className={props.className}
          title={props.title}
          value={props.value}
          onChange={props.handleOnChange}>
          {values.map(v => (
            <Radio key={v.name} value={v.name} label={v.label} disabled={props.disabled} />
          ))}
        </Radio.Group>
      );
  }

  return (
    <TextInput
      data-testid={props.testID}
      title={props.title}
      className={props.className}
      placeholder={placeHolderText}
      type={props.inputType || 'text'}
      disabled={props.disabled}
      value={props.value}
      onChange={e => props.handleOnChange(e.target.value)}
    />
  );
};

MantineValueEditor.displayName = 'MantineValueEditor';
