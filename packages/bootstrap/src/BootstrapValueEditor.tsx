import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { standardClassnames, useValueEditor, ValueEditor } from 'react-querybuilder';

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
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        id={id}
        value={props.name}
        checked={props.checked}
        disabled={props.disabled}
        onChange={e => props.handleOnChange(e.target.value)}
      />
      <label className="form-check-label" htmlFor={id}>
        {props.label}
      </label>
    </div>
  );
};

/**
 * @group Components
 */
export const BootstrapValueEditor = (props: ValueEditorProps): React.JSX.Element | null => {
  const { valueListItemClassName } = useValueEditor(props);

  if (props.operator === 'null' || props.operator === 'notNull') {
    return null;
  }

  if (
    (props.operator === 'between' || props.operator === 'notBetween') &&
    (props.type === 'select' || props.type === 'text')
  ) {
    const listItemClasses =
      props.type === 'text' ? 'form-control form-control-sm' : 'form-select form-select-sm';
    return (
      <ValueEditor
        {...props}
        skipHook
        schema={{
          ...props.schema,
          classNames: {
            ...props.schema.classNames,
            valueListItem: `${valueListItemClassName} ${listItemClasses}`,
          },
        }}
      />
    );
  }

  switch (props.type) {
    case 'select':
    case 'multiselect':
      return (
        <ValueEditor
          {...props}
          skipHook
          className={`${props.className} form-select form-select-sm`}
        />
      );

    case 'switch':
      return (
        <span className={`${props.className} custom-control custom-switch`}>
          <input
            type="checkbox"
            className="form-check-input custom-control-input"
            title={props.title}
            disabled={props.disabled}
            onChange={e => props.handleOnChange(e.target.checked)}
            checked={!!props.value}
          />
        </span>
      );

    case 'checkbox':
      return <ValueEditor {...props} skipHook className={`${props.className} form-check-input`} />;

    case 'radio':
      return (
        <span title={props.title} className={standardClassnames.value}>
          {props.values?.map(v => (
            <RadioButton
              key={v.name}
              name={v.name}
              disabled={props.disabled}
              checked={props.value === v.name}
              handleOnChange={props.handleOnChange}
              label={v.label}
            />
          ))}
        </span>
      );
  }

  return (
    <ValueEditor
      {...props}
      skipHook
      className={`${props.className} form-control form-control-sm`}
    />
  );
};
