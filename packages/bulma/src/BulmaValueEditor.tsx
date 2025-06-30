import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { useValueEditor, ValueEditor } from 'react-querybuilder';

// Extracted from callback so we can use `useId`
const RadioButton = (props: {
  name: string;
  disabled?: boolean;
  checked: boolean;
  handleOnChange: (v: string) => void;
  label: string;
}) => {
  const id = React.useId();
  return (
    <label className="radio" htmlFor={id}>
      <input
        id={id}
        type="radio"
        value={props.name}
        checked={props.checked}
        onChange={() => props.handleOnChange(props.name)}
        disabled={props.disabled}
      />
      {props.label}
    </label>
  );
};

/**
 * @group Components
 */
export const BulmaValueEditor = (props: ValueEditorProps): React.JSX.Element | null => {
  const { valueListItemClassName } = useValueEditor(props);

  if (props.operator === 'null' || props.operator === 'notNull') {
    return null;
  }

  const { values = [] } = props;

  if ((props.operator === 'between' || props.operator === 'notBetween') && props.type === 'text') {
    return (
      <ValueEditor
        {...props}
        skipHook
        schema={{
          ...props.schema,
          classNames: {
            ...props.schema.classNames,
            valueListItem: `${valueListItemClassName} input`,
          },
        }}
      />
    );
  }

  switch (props.type) {
    case 'select':
    case 'multiselect':
      return <ValueEditor {...props} skipHook />;

    case 'textarea':
      return (
        <div className={`${props.className} control`}>
          <ValueEditor {...props} skipHook className="textarea" />
        </div>
      );

    case 'switch':
    case 'checkbox':
      return (
        <label title={props.title} className={`${props.className} checkbox`}>
          <ValueEditor {...props} skipHook title="" className="" />
        </label>
      );

    case 'radio':
      return (
        <div className={`${props.className} control`} title={props.title}>
          {values.map(v => (
            <RadioButton
              key={v.name}
              name={v.name}
              disabled={props.disabled}
              checked={props.value === v.name}
              handleOnChange={props.handleOnChange}
              label={v.label}
            />
          ))}
        </div>
      );
  }

  return (
    <div className={`${props.className} control`}>
      <ValueEditor {...props} skipHook disabled={props.disabled} className="input" />
    </div>
  );
};
