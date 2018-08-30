import * as React from 'react';

export interface ValueEditorProps {
  field: string;
  value: string;
  operator: string;
  handleOnChange: (val: string) => void;
  title: string;
}

const ValueEditor = (props: ValueEditorProps): JSX.Element | null => {
  // this.displayName = 'ValueEditor';
  const { operator, value, handleOnChange, title } = props;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  return (
    <input
      type="text"
      value={value}
      title={title}
      onChange={(e) => handleOnChange(e.target.value)}
    />
  );
};

export default ValueEditor;
