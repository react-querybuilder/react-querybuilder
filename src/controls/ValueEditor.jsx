import React from 'react';
import PropTypes from 'prop-types';

const ValueEditor = (props) => {
  const {field, operator, value, handleOnChange, title, className} = props;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  return (
    <input type="text"
           value={value}
           title={title}
           className={className}
           onChange={e=>handleOnChange(e.target.value)} />
  );
};

ValueEditor.displayName = 'ValueEditor';

ValueEditor.propTypes = {
  field: PropTypes.string,
  operator: PropTypes.string,
  value: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string,
  className: PropTypes.string,
};

export default ValueEditor;
