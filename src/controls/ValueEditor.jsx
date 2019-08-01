import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';

const ValueEditor = (props) => {
  const {field, operator, value, handleOnChange, className, title} = props;

  const onChangeBinder = (e) => {
    handleOnChange(e.target.value)
  }

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  return (
    // <input type="text"
    //        value={value}
    //        title={title}
    //        onChange={e=>handleOnChange(e.target.value)} />
    <TextField
      className={className}
      value={value}
      onChange={onChangeBinder}
      variant="outlined"
    />
  );
};

ValueEditor.displayName = 'ValueEditor';

ValueEditor.propTypes = {
  field: PropTypes.string,
  operator: PropTypes.string,
  value: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string,
};

export default ValueEditor;
