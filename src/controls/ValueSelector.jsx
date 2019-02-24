import uniqueId from 'uuid/v4';
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

const ValueSelector = (props) => {
  const { value, options, className, handleOnChange, title } = props;

  return (
    <Select
      className={className}
      value={value}
      // title={title}
      onChange={(e) => handleOnChange(e)}>
      {options.map((option) => {
        const key = option.id ? `key-${option.id}` : `key-${option.name}`;
        return (
          <Select.Option key={key} value={option.name}>
            {option.label}
          </Select.Option>
        );
      })}
    </Select>
  );
};

ValueSelector.displayName = 'ValueSelector';

ValueSelector.propTypes = {
  value: PropTypes.string,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string
};

export default ValueSelector;
