import uniqueId from "uuid/v4";
import React from "react";
import PropTypes from "prop-types";

const ValueSelector = props => {
  const { value, options, className, handleOnChange, title } = props;

  return (
    <select
      className={className}
      value={value}
      title={title}
      onChange={e => handleOnChange(e.target.value)}
    >
      {options.map(option => {
        return (
          <option key={option.id || option.name} value={option.name}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
};

ValueSelector.displayName = "ValueSelector";

ValueSelector.propTypes = {
  value: PropTypes.string,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string
};

export default ValueSelector;
