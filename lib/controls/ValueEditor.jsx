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
    const {field, operator, value, children, handleOnChange} = this.props;

    if (operator === 'null' || operator === 'notNull') {
      return null;
    }

    return (children ?
      React.cloneElement(children, {
        field: field,
        operator: operator,
        value: value,
        handleOnChange: handleOnChange
      }) : this._defaultValueEditor()
    );

  }

  _defaultValueEditor() {
    return (
      <input type="text"
             value={this.props.value}
             onChange={e=>this.props.handleOnChange(e.target.value)} />
    );
  }
}
