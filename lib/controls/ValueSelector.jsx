import React from 'react';

export default class ValueSelector extends React.Component {
  static get propTypes() {
    return {
      value: React.PropTypes.string,
      options: React.PropTypes.array.isRequired,
      className: React.PropTypes.string,
      handleOnChange: React.PropTypes.func
    }
  }

  constructor(props) {
    super(props);
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
