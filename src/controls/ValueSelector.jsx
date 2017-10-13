import React from 'react';
import PropTypes from 'prop-types';

const ValueSelector = (props) => {
  const {value, options, className, handleOnChange} = props;

  return (
    <select className={className}
            value={value}
            onChange={e=>handleOnChange(e.target.value)}>
      {
        options.map(option=> {
          return (
            <option key={option.name} value={option.name}>{option.label}</option>
          );
        })
      }
    </select>
  );
}

ValueSelector.displayName = 'ValueSelector';

ValueSelector.propTypes = {
  value: PropTypes.string,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  handleOnChange: PropTypes.func
};

export default ValueSelector;