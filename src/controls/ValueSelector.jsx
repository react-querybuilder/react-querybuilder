import React from 'react';
import PropTypes from 'prop-types';

const ValueSelector = ({ className, handleOnChange, options, title, value }) => (
  <select
    className={className}
    value={value}
    title={title}
    onChange={(e) => handleOnChange(e.target.value)}>
    {options.map((option) => {
      const key = option.id ? `key-${option.id}` : `key-${option.name}`;
      return (
        <option key={key} value={option.name}>
          {option.label}
        </option>
      );
    })}
  </select>
);

ValueSelector.displayName = 'ValueSelector';

ValueSelector.propTypes = {
  value: PropTypes.string,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string
};

export default ValueSelector;
