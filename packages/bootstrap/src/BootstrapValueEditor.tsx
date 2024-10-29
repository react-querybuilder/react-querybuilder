import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { standardClassnames, useValueEditor, ValueEditor } from 'react-querybuilder';

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
            <div key={v.name} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                id={v.name}
                value={v.name}
                checked={props.value === v.name}
                disabled={props.disabled}
                onChange={e => props.handleOnChange(e.target.value)}
              />
              <label className="form-check-label" htmlFor={v.name}>
                {v.label}
              </label>
            </div>
          ))}
        </span>
      );
  }

  return <ValueEditor skipHook {...props} />;
};
