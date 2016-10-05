import React from 'react';

export default class ValueEditor extends React.Component {
  static get propTypes() {
    return {
      field: React.PropTypes.string,
      operator: React.PropTypes.string,
      value: React.PropTypes.string,
      handleOnChange: React.PropTypes.func
    };
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {field, operator, value, handleOnChange} = this.props;

    if (operator === 'null' || operator === 'notNull') {
      return null;
    }

    return (
      <input type="text"
             value={value}
             onChange={e=>handleOnChange(e.target.value)} />
    );

  }
}
