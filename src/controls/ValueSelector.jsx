import uniqueId from 'uuid/v4';
import React from 'react';
import PropTypes from 'prop-types';
import { Select, MenuItem, InputLabel, FormControl, OutlinedInput } from '@material-ui/core';

const ValueSelector = (props) => {
  const { value, options, className, handleOnChange, title } = props;

  const onChangeBinder = (e) => {
    handleOnChange(e.target.value)
  }

  return (
    <FormControl variant="outlined">
      <Select
        variant="outlined"
        className={className}
        value={value}
        title={title}
        onChange={onChangeBinder}

        input={<OutlinedInput name={value} id={`outlined-${title}`}/>}
      >
        {
          options.map(option=> {
            const key = option.id ? `key-${option.id}` : `key-${option.name}`;
            return (
              <MenuItem key={key} value={option.name}>{option.label}</MenuItem> 
            );
          })
        }
      </Select>
    </FormControl>
    
  );
}

ValueSelector.displayName = 'ValueSelector';

ValueSelector.propTypes = {
  value: PropTypes.string,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string,
};

export default ValueSelector;
