import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const ValueEditor = (props) => {
  const { field, operator, value, handleOnChange, title } = props;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  return (
    <Input
      type="text"
      style={{ width: 120 }}
      value={value}
      title={title}
      onChange={(e) => handleOnChange(e.target.value)}
    />
  );
};

ValueEditor.displayName = 'ValueEditor';

ValueEditor.propTypes = {
  field: PropTypes.string,
  operator: PropTypes.string,
  value: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string
};

export default ValueEditor;
