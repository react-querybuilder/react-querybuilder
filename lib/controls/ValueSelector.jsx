import React from 'react';
import PropTypes from 'prop-types';

export default class ValueSelector extends React.Component {
  static get propTypes() {
    return {
      value: PropTypes.string,
      options: PropTypes.array.isRequired,
      className: PropTypes.string,
      handleOnChange: PropTypes.func
    }
  }

  render() {
    const {value, options, className, handleOnChange} = this.props;

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
}
