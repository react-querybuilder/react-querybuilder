import React from 'react';
import PropTypes from 'prop-types';

const ValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
}) => {
  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  switch (type) {
    case 'select':
      return (
        <select onChange={(e) => handleOnChange(e.target.value)} value={value}>
          {values.map((v) => (
            <option value={v.name}>{v.label}</option>
          ))}
        </select>
      );

    case 'checkbox':
      return (
        <input type="checkbox" onChange={(e) => handleOnChange(e.target.checked)} value={!!value} />
      );

    case 'radio':
      return values.map((v) => (
        <label>
          <input
            type="radio"
            value={v.name}
            checked={value === v.name}
            onChange={(e) => handleOnChange(e.target.value)}
          />{' '}
          {v.label}
        </label>
      ));

    default:
      return (
        <input
          type={inputType || 'text'}
          value={value}
          title={title}
          className={className}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

ValueEditor.displayName = 'ValueEditor';

ValueEditor.propTypes = {
  field: PropTypes.string,
  operator: PropTypes.string,
  value: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(['select', 'checkbox', 'radio', 'text']),
  inputType: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.object)
};

export default ValueEditor;
